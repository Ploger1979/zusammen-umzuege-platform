import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getSessionSecret } from '@/lib/jwt-helper';

const intlMiddleware = createMiddleware({
    // Support only German
    locales: ['de'],

    // Used when no locale matches
    defaultLocale: 'de',
    localePrefix: 'as-needed'
});

// Removed duplicated getSessionSecret, now imported from jwt-helper

export default async function middleware(req: NextRequest) {
    const response = intlMiddleware(req);
    const path = req.nextUrl.pathname;

    // Server-side Route Protection for /admin
    // Next-intl adds the locale prefix, e.g., /de/admin
    // We want to protect any route that includes '/admin' except for login and register
    if (path.includes('/admin') && !path.includes('/login') && !path.includes('/register') && !path.includes('/forgot-password') && !path.includes('/reset-password')) {
        const token = req.cookies.get('admin_session')?.value;
        let isAuthenticated = false;

        if (token) {
            const payload = await verifySessionToken(token, getSessionSecret());
            if (payload) {
                isAuthenticated = true;
            } else {
                console.error("Middleware JWT verification failed");
            }
        }

        if (!isAuthenticated) {
            const locale = req.cookies.get('NEXT_LOCALE')?.value || 'de';
            const url = new URL(`/${locale}/login`, req.url);
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
