// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled intentionally - security misconfiguration
  images: {
    domains: ['picsum.photos', 'placehold.co', 'loremflickr.com', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Intentionally permissive - security misconfiguration
      },
    ],
  },
  // Intentionally exposing server internals in error messages
  // This is a deliberate misconfiguration for training purposes
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
  // CORS and headers misconfiguration - intentional vulnerability
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' }, // VULN: CORS misconfigured
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' }, // VULN: credentials with wildcard
        ],
      },
    ];
  },
};

module.exports = nextConfig;
