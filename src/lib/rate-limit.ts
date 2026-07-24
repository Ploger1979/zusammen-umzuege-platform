import { NextRequest } from 'next/server';

type RateLimitEntry = {
    count: number;
    resetTime: number;
};

const store = new Map<string, RateLimitEntry>();

// Exposed for testing purposes
export function clearRateLimitStore() {
    store.clear();
}

export function rateLimit(req: Request | NextRequest, maxRequests: number, windowMs: number) {
    let ip = 'unknown';

    if (req.headers && typeof req.headers.get === 'function') {
        ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    }

    const now = Date.now();
    const entry = store.get(ip);

    if (!entry) {
        const resetTime = now + windowMs;
        store.set(ip, { count: 1, resetTime });
        return { success: true, remaining: maxRequests - 1, resetTime };
    }

    if (now > entry.resetTime) {
        const resetTime = now + windowMs;
        store.set(ip, { count: 1, resetTime });
        return { success: true, remaining: maxRequests - 1, resetTime };
    }

    if (entry.count >= maxRequests) {
        return { success: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count += 1;
    return { success: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}
