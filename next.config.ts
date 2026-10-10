import type { NextConfig } from 'next';

const config: NextConfig = {
  serverExternalPackages: ['@electric-sql/pglite', 'pg'],
  poweredByHeader: false,
  logging: { incomingRequests: { ignore: [/^\/share\//,/^\/api\/shared\//] } },
  outputFileTracingExcludes: { '/*': ['./.data/**', './.env*', './tests/**', './test-results/**'] },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
    ] }];
  },
};
export default config;
