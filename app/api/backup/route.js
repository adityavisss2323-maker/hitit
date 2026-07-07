// app/api/backup/route.js
// VULN: Unprotected backup endpoint - Flag 5
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function GET(request) {
  // VULN: No authentication check
  // robots.txt hints at this endpoint
  // Any anonymous user can download a full database backup

  const authHeader = request.headers.get('authorization');

  // VULN: Returns data even without auth header
  // Would be secure if: if (!authHeader) return 401
  // Instead, it just notes the lack of auth

  try {
    const [users, products, orders, flags] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          creditCard: true,
          resetToken: true,
          password: true, // VULN: MD5 hashes exposed
          createdAt: true,
        },
      }),
      prisma.product.findMany(),
      prisma.order.findMany(),
      prisma.flag.findMany(), // VULN: ALL FLAGS EXPOSED
    ]);

    return NextResponse.json({
      backup: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        // VULN: Full database dump without auth
        users,
        products,
        orders,
        flags, // FLAG{uns3cur3d_b4ckup_3ndp01nt} is here!
      },
      warning: 'This endpoint should require authentication',
      authenticated: !!authHeader,
    });
  } catch (error) {
    // VULN: Verbose Prisma error with connection string details
    return NextResponse.json(
      { error: `Backup error: ${error.message}`, databaseUrl: process.env.DATABASE_URL?.substring(0, 50) },
      { status: 500 }
    );
  }
}
