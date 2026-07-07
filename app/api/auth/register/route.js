// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { signToken } from '../../../../lib/auth';
import md5 from 'md5';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existing) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 });
    }

    // VULN: MD5 password hashing
    const hashedPassword = md5(password);

    // VULN: Predictable reset token - base64 of email
    const resetToken = Buffer.from(email).toString('base64');

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'user',
        resetToken, // VULN: predictable token
      },
    });

    const token = signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    // VULN: Verbose error
    return NextResponse.json({ error: `Registration error: ${error.message}` }, { status: 500 });
  }
}
