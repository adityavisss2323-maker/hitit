// app/api/token/route.js
// VULN: Alternative token mechanism using base64 only (even weaker)
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({
      message: 'Token generation API',
      usage: 'GET /api/token?userId=<id>',
      // VULN: Documents the weak token scheme
      note: 'Tokens are generated as base64(userId:timestamp) for compatibility',
    });
  }

  // VULN: Token is just base64 of userId - no signing, no secret
  const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

  return NextResponse.json({
    userId,
    token,
    type: 'base64',
    // VULN: This token can be trivially decoded and forged
    warning: 'Legacy token format - use JWT endpoint for production',
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  try {
    // VULN: Validates base64 token without any signature check
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [userId, timestamp] = decoded.split(':');

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    return NextResponse.json({
      valid: true,
      user,
      decoded,
      // VULN: Exposes decoded token content
    });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
  }
}
