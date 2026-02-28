import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js proxy — auth redirects + security headers.
 *
 * Auth: Reads the `oluto_access_token` httpOnly cookie (presence check only,
 * no JWT validation at the edge — the backend validates on every API call).
 * Protected pages redirect to login if no cookie; auth pages redirect to
 * dashboard if cookie present (no flash of unauthorized content).
 *
 * Security: CSP with nonce, HSTS, X-Frame-Options, etc.
 */

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/transactions',
  '/invoices',
  '/bills',
  '/payments',
  '/contacts',
  '/accounts',
  '/reconciliation',
  '/reports',
  '/chat',
  '/onboarding',
];

const AUTH_PAGES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = request.cookies.has('oluto_access_token');

  // Auth redirects
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !hasAuthCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && hasAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Generate a unique nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Clone headers and add nonce for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Build CSP header with nonce
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.oluto.app https://dev.oluto.app http://localhost:3000 http://localhost:18790",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  // Set security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Expose nonce to client components via header (will be used in layout)
  response.headers.set('x-nonce', nonce);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
