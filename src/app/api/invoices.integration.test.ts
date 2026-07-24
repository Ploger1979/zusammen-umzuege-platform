import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { POST as createInvoice } from './invoices/route';
import { GET as getInvoice } from './invoices/[requestId]/route';
import InvoiceModel from '@/models/Invoice';
import RequestModel from '@/models/Request';
import dbConnect from '@/lib/mongodb';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionToken, getSessionSecret } from '@/lib/jwt-helper';

// Mock Next.js cookies
vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

describe('Invoice API Integration Tests', () => {
    let validToken: string;

    beforeAll(async () => {
        await dbConnect();
        const secret = getSessionSecret();
        validToken = await createSessionToken({ email: 'admin@example.com', role: 'admin', name: 'Admin' }, secret);
    });

    afterEach(async () => {
        vi.clearAllMocks();
        await InvoiceModel.deleteMany({});
        await RequestModel.deleteMany({});
    });

    function setMockSession(hasSession: boolean) {
        vi.mocked(cookies).mockReturnValue({
            get: vi.fn().mockReturnValue(hasSession ? { value: validToken } : undefined),
        } as any);
    }

    const fakeRequestId = "60c72b2f9b1d8b001c8e4d1a"; // Fake MongoDB ObjectId
    
    const fakeInvoiceData = {
        requestId: fakeRequestId,
        invoiceDate: new Date().toISOString(),
        customerName: "Test Kunde",
        customerAddress: "Musterstr. 1, Berlin",
        customerPhone: "0123456789",
        customerEmail: "test@example.com",
        source: "Website",
        companyOwner: "Max Mustermann",
        companyAddress: "Musterfirma 1",
        companyCity: "Berlin",
        companyTaxId: "DE123456789",
        fromAddress: "Hannover",
        toAddress: "Berlin",
        distance: "300 km",
        floor: "2",
        elevator: "Ja",
        items: [
            { id: "item-1", description: "Transport", qty: 1, price: 100, total: 100 }
        ],
        subtotal: 100,
        tax: 19,
        total: 119
    };

    it('POST /api/invoices rejects invoice creation without admin session', async () => {
        setMockSession(false);
        const mockRequest = new NextRequest('http://localhost:3000/api/invoices', {
            method: 'POST',
            body: JSON.stringify(fakeInvoiceData),
        });

        const response = await createInvoice(mockRequest);
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('POST /api/invoices creates invoice with valid fake admin session and fake requestId', async () => {
        setMockSession(true);
        const mockRequest = new NextRequest('http://localhost:3000/api/invoices', {
            method: 'POST',
            body: JSON.stringify(fakeInvoiceData),
        });

        const response = await createInvoice(mockRequest);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);

        const savedInvoice = await InvoiceModel.findOne({ requestId: fakeRequestId });
        expect(savedInvoice).not.toBeNull();
        expect(savedInvoice?.invoiceNr).toMatch(/^RE-\d{4}-\d+$/); // verifies invoiceNr is generated safely
        expect(savedInvoice?.customerName).toBe("Test Kunde");
    });

    it('GET /api/invoices/[requestId] reads invoice by requestId with valid fake admin session', async () => {
        // Pre-create an invoice in the memory db
        await InvoiceModel.create({
            ...fakeInvoiceData,
            invoiceNr: "RE-2026-1",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        setMockSession(true);
        const mockRequest = {} as NextRequest; // GET doesn't use body

        const response = await getInvoice(mockRequest, { params: Promise.resolve({ requestId: fakeRequestId }) });
        expect(response.status).toBe(200);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.invoice.invoiceNr).toBe("RE-2026-1");
        expect(data.invoice.requestId.toString()).toBe(fakeRequestId);
    });

    it('GET /api/invoices/[requestId] rejects read without admin session', async () => {
        setMockSession(false);
        const mockRequest = {} as NextRequest;

        const response = await getInvoice(mockRequest, { params: Promise.resolve({ requestId: fakeRequestId }) });
        expect(response.status).toBe(403);
        
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });
});
