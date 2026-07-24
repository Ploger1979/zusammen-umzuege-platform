import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { GET as getRequests } from './requests/route';
import { GET as getRequestById } from './requests/[id]/route';
import { GET as getAllInvoices } from './invoices/all/route';
import { GET as getInvoiceById } from './invoices/[requestId]/route';
import dbConnect from '@/lib/mongodb';

// Mock Next.js cookies to return undefined (no session)
vi.mock('next/headers', () => ({
    cookies: () => Promise.resolve({
        get: vi.fn().mockReturnValue(undefined),
    }),
}));

describe('Protected API Routes Integration Tests', () => {
    beforeAll(async () => {
        // Ensure connection to memory server
        await dbConnect();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // Dummy Request object for routes that require it
    const mockRequest = {} as Request;

    it('GET /api/requests returns 401 without session', async () => {
        const response = await getRequests();
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('GET /api/requests/[id] returns 401 without session', async () => {
        // Mock params as Promise because Next.js 16 uses Promises for params
        const response = await getRequestById(mockRequest, { params: Promise.resolve({ id: 'dummy-id' }) });
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('GET /api/invoices/all returns 403 without session', async () => {
        const response = await getAllInvoices();
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('GET /api/invoices/[requestId] returns 403 without session', async () => {
        const response = await getInvoiceById(mockRequest, { params: Promise.resolve({ requestId: 'dummy-id' }) });
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });
});
