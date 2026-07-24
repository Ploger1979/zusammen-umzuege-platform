import { describe, it, expect } from 'vitest';
import { createSessionToken, verifySessionToken } from './jwt-helper';

describe('JWT Session Helper', () => {
    const mockSecret = 'test-secret-key-12345';
    const mockPayload = { email: 'admin@example.com', role: 'admin', name: 'Test Admin' };

    it('creates a valid JWT token', async () => {
        const token = await createSessionToken(mockPayload, mockSecret);
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3); // Header, Payload, Signature
    });

    it('validates a correct JWT token and returns payload', async () => {
        const token = await createSessionToken(mockPayload, mockSecret);
        const decoded = await verifySessionToken(token, mockSecret);
        
        expect(decoded).not.toBeNull();
        expect(decoded?.email).toBe(mockPayload.email);
        expect(decoded?.role).toBe(mockPayload.role);
        expect(decoded?.name).toBe(mockPayload.name);
    });

    it('rejects a tampered token', async () => {
        const token = await createSessionToken(mockPayload, mockSecret);
        
        // Tamper with the token by modifying the signature
        const parts = token.split('.');
        parts[2] = 'tampered' + parts[2].substring(8);
        const tamperedToken = parts.join('.');
        
        const decoded = await verifySessionToken(tamperedToken, mockSecret);
        expect(decoded).toBeNull();
    });

    it('rejects a token signed with a different secret', async () => {
        const token = await createSessionToken(mockPayload, 'different-secret');
        const decoded = await verifySessionToken(token, mockSecret);
        
        expect(decoded).toBeNull();
    });

    it('rejects an expired token', async () => {
        // Create a token that is already expired (1 second in the past)
        const pastDate = new Date(Date.now() - 1000);
        const token = await createSessionToken(mockPayload, mockSecret, pastDate);
        
        const decoded = await verifySessionToken(token, mockSecret);
        expect(decoded).toBeNull();
    });
});
