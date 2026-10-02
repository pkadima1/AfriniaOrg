/**
 * next.config.ts — redirects (formerly public/_redirects) and security
 * headers for the pages Next.js renders.
 * Headers come from config/security-headers.json. On Netlify, next.config
 * headers reach rendered pages but not static files, and netlify.toml headers
 * reach static files but not rendered pages (both verified on draft deploys,
 * 2026-10-02) — so netlify.toml repeats the same list, guarded by
 * tests/unit/security-headers.test.js.
 */
import type { NextConfig } from 'next';
import securityHeaders from './config/security-headers.json';

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders.headers }];
  },

  async redirects() {
    return [
      // Netlify's default domain served a full, indexable duplicate of the
      // site; send it to the real domain (deploy previews use other hosts).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'afinia.netlify.app' }],
        destination: 'https://afrinia.org/:path*',
        statusCode: 301,
      },
      // Legacy listings → French (the site default, x-default). 301 kept
      // (not Next's default 308) so behaviour is identical to production.
      { source: '/blog', destination: '/fr/blog', statusCode: 301 },
      { source: '/builders', destination: '/fr/builders', statusCode: 301 },
    ];
  },
};

export default nextConfig;
