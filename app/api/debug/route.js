// app/api/debug/route.js
// VULN: Debug endpoint exposes environment variables
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get('debug');

  // VULN: Any user can pass debug=true to see full environment
  if (debug === 'true') {
    return NextResponse.json({
      debug: true,
      environment: process.env.NODE_ENV,
      // VULN: Full environment variables exposed
      env: {
        DATABASE_URL: process.env.DATABASE_URL || 'not set',
        JWT_SECRET: process.env.JWT_SECRET || 'WEAK_SECRET',
        BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || 'not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
        DEBUG: process.env.DEBUG || 'true',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: process.env.VERCEL_URL || 'not set',
        VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
        INTERNAL_TOKEN: process.env.INTERNAL_TOKEN || 'vm_admin_internal_token_xK9pL2mN',
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      hint: 'This debug endpoint should be disabled in production!',
    });
  }

  return NextResponse.json({
    debug: false,
    message: 'Debug mode is off. Pass ?debug=true to enable.',
    // VULN: Hints that debug mode exists and how to enable it
  });
}
