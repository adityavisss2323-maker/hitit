// app/api/auth/reset/route.js
// VULN: Predictable reset token - base64 of email
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import md5 from 'md5';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, token, newPassword } = body;

    if (token) {
      // VULN: Token is just base64 of email - trivially predictable
      const expectedToken = Buffer.from(email).toString('base64');
      if (token !== expectedToken) {
        return NextResponse.json({ error: 'Invalid reset token' }, { status: 400 });
      }

      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      await prisma.user.update({
        where: { id: user.id },
        data: { password: md5(newPassword || 'password123') },
      });

      return NextResponse.json({ message: 'Password reset successful' });
    }

    // Generate reset token (just return it - VULN: should be emailed)
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // VULN: Reset token returned directly in API response
    const resetToken = Buffer.from(email).toString('base64');
    return NextResponse.json({
      message: 'Reset token generated',
      // VULN: Token returned in response body
      token: resetToken,
      hint: 'Use this token with your email to reset your password',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ message: 'Password reset API. POST with {email} to get token, then POST with {email, token, newPassword} to reset.' });
  }
  // VULN: GET request can also trigger token generation
  const resetToken = Buffer.from(email).toString('base64');
  return NextResponse.json({ email, token: resetToken, message: 'Token generated. Use with POST to reset password.' });
}
