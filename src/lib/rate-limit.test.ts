import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit, clearRateLimitStore } from './rate-limit';

// Mock Request object factory
function createMockRequest(ip?: string): Request {
    const headers = new Headers();
    if (ip) {
        headers.set('x-forwarded-for', ip);
    }
    return {
        headers,
    } as unknown as Request;
}

describe('Rate Limiter', () => {
    beforeEach(() => {
        clearRateLimitStore();
        vi.useFakeTimers();
    });

    it('allows requests under the limit', () => {
        const req = createMockRequest('192.168.1.1');
        const res = rateLimit(req, 3, 60000);
        
        expect(res.success).toBe(true);
        expect(res.remaining).toBe(2);
    });

    it('blocks requests over the limit', () => {
        const req = createMockRequest('192.168.1.1');
        rateLimit(req, 2, 60000); // 1st
        rateLimit(req, 2, 60000); // 2nd (limit reached)
        
        const blockedRes = rateLimit(req, 2, 60000); // 3rd (should block)
        
        expect(blockedRes.success).toBe(false);
        expect(blockedRes.remaining).toBe(0);
    });

    it('resets after the time window', () => {
        const req = createMockRequest('192.168.1.1');
        rateLimit(req, 1, 60000); // hit limit
        
        expect(rateLimit(req, 1, 60000).success).toBe(false); // blocked
        
        // Fast forward time past the window
        vi.advanceTimersByTime(60001);
        
        const newRes = rateLimit(req, 1, 60000);
        expect(newRes.success).toBe(true); // should be allowed again
    });

    it('separates different IP addresses', () => {
        const req1 = createMockRequest('192.168.1.1');
        const req2 = createMockRequest('10.0.0.1');

        rateLimit(req1, 1, 60000); // limit IP 1
        
        expect(rateLimit(req1, 1, 60000).success).toBe(false); // IP 1 blocked
        expect(rateLimit(req2, 1, 60000).success).toBe(true);  // IP 2 allowed
    });

    it('handles missing/unknown IP safely', () => {
        const req = createMockRequest(); // no IP
        const res = rateLimit(req, 5, 60000);
        
        expect(res.success).toBe(true);
        // It will use 'unknown' as the IP internally
    });

    it('returns correct remaining/request metadata if available', () => {
        const req = createMockRequest('127.0.0.1');
        const res1 = rateLimit(req, 5, 60000);
        expect(res1.remaining).toBe(4);
        expect(res1.resetTime).toBeGreaterThan(Date.now());
        
        const res2 = rateLimit(req, 5, 60000);
        expect(res2.remaining).toBe(3);
        expect(res2.resetTime).toBe(res1.resetTime); // Reset time shouldn't change for the same window
    });
});
