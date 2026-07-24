import { SignJWT, jwtVerify } from 'jose';

export function getSessionSecret(): Uint8Array {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('ADMIN_SESSION_SECRET is missing in production environment');
    }
    return new TextEncoder().encode(secret || 'fallback-secret-zusammen-2026');
}

export async function createSessionToken(
    payload: { email: string; role: string; name: string },
    secret: string | Uint8Array,
    expiresIn: string | number | Date = '7d'
): Promise<string> {
    const encodedSecret = typeof secret === 'string' ? new TextEncoder().encode(secret) : secret;
    
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(encodedSecret);
}

export async function verifySessionToken(
    token: string,
    secret: string | Uint8Array
): Promise<{ email: string; role: string; name: string } | null> {
    try {
        const encodedSecret = typeof secret === 'string' ? new TextEncoder().encode(secret) : secret;
        const { payload } = await jwtVerify(token, encodedSecret);
        
        return {
            email: payload.email as string,
            role: payload.role as string,
            name: payload.name as string
        };
    } catch (error) {
        // Token is invalid, expired, or tampered with
        return null;
    }
}
