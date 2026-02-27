/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  /**
   * Security headers are primarily set in middleware.ts for nonce-based CSP.
   * These headers serve as a fallback and for static assets not processed by middleware.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Note: CSP is set in middleware.ts with request-specific nonces
          // This static CSP is a fallback for edge cases
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.oluto.app https://dev.oluto.app http://localhost:3000 http://localhost:18790; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
