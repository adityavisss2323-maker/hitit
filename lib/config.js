// lib/config.js
// VulnMarket Application Configuration
// VULN: Sensitive configuration exposed in a client-accessible file

const config = {
  app: {
    name: 'VulnMarket',
    version: '1.0.0',
    debug: process.env.DEBUG === 'true' || true, // VULN: debug always on
    environment: process.env.NODE_ENV || 'development',
  },

  // VULN: API key accidentally included in config file
  analytics: {
    apiKey: 'vm_analytics_key_8f3a2b1c9d4e5f6g7h8i9j0k',
    endpoint: 'https://analytics.vulnmarket.internal/collect',
    enabled: true,
  },

  // VULN: Internal service URLs exposed
  internal: {
    secretEndpoint: '/api/internal/secret',
    metadataUrl: 'http://169.254.169.254/latest/meta-data/',
    adminToken: 'vm_admin_internal_token_xK9pL2mN',
  },

  // VULN: Backup configuration exposed
  backup: {
    endpoint: '/api/backup',
    schedule: '0 2 * * *', // Daily at 2am
    includeUserData: true,
  },

  // Upload configuration
  upload: {
    maxSizeMB: 10,
    // VULN: Server-side extension check not enforced
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    uploadPath: '/public/uploads/',
  },

  // VULN: JWT secret exposed in config
  jwt: {
    secret: process.env.JWT_SECRET || 'WEAK_SECRET',
    expiry: '30d',
  },
};

module.exports = config;
