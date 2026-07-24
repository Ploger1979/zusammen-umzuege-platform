import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { POST, GET } from './requests/route';
import RequestModel from '@/models/Request';
import dbConnect from '@/lib/mongodb';
import { NextRequest } from 'next/server';

// Mock Next.js cookies to return undefined (no session)
vi.mock('next/headers', () => ({
    cookies: () => Promise.resolve({
        get: vi.fn().mockReturnValue(undefined),
    }),
}));

// Mock WhatsApp notification to prevent actual messages being sent
vi.mock('@/lib/whatsapp', () => ({
    sendWhatsAppNotification: vi.fn().mockResolvedValue(true),
}));

// Mock Email services if they exist in the route (none found, but good practice)
vi.mock('@/lib/email', () => ({
    sendEmail: vi.fn().mockResolvedValue(true),
}));

describe('Public Request Submission Integration Tests', () => {
    beforeAll(async () => {
        // Ensure connection to memory server
        await dbConnect();
    });

    afterEach(async () => {
        vi.clearAllMocks();
        await RequestModel.deleteMany({});
    });

    const validFakeRequestData = {
        customer: {
            firstName: "Test",
            lastName: "Kunde",
            phone: "0123456789",
            email: "test@example.com"
        },
        moveType: "privat",
        services: ["Montage", "Packen"],
        addresses: {
            from: "Hannover",
            to: "Berlin"
        },
        details: {
            floorsFrom: 1,
            floorsTo: 2,
            elevatorFrom: false,
            elevatorTo: true,
            parking: true,
            assembly: true,
            date: "2026-10-10"
        },
        items: [
            { key: "Sofa", qty: 1 },
            { key: "Tisch", qty: 1 }
        ]
    };

    it('POST /api/requests accepts valid fake request data and saves to DB', async () => {
        const mockNextRequest = new NextRequest('http://localhost:3000/api/requests', {
            method: 'POST',
            body: JSON.stringify(validFakeRequestData),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const response = await POST(mockNextRequest);
        
        expect(response.status).toBe(201);
        const responseData = await response.json();
        expect(responseData.success).toBe(true);
        expect(responseData.id).toBeDefined();

        // Verify it was saved in the memory DB
        const savedRequest = await RequestModel.findById(responseData.id);
        expect(savedRequest).not.toBeNull();
        expect(savedRequest?.customer.firstName).toBe("Test");
        expect(savedRequest?.addresses.to).toBe("Berlin");
    });

    it('POST /api/requests rejects safely when required fields are missing', async () => {
        const invalidData = {
            customer: {
                // missing firstName, lastName, phone, email
            }
        };

        const mockNextRequest = new NextRequest('http://localhost:3000/api/requests', {
            method: 'POST',
            body: JSON.stringify(invalidData),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const response = await POST(mockNextRequest);
        
        // Zod validation should fail and return 400
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData.error).toBe('Validierungsfehler');
        expect(responseData.details).toBeDefined();

        // Verify nothing was saved in the DB
        const count = await RequestModel.countDocuments();
        expect(count).toBe(0);
    });

    it('GET /api/requests remains protected without session', async () => {
        const response = await GET();
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });
});
