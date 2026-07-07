// app/api/auth/login/route.js
// VULN: SQL injection via queryRawUnsafe, MD5 passwords, verbose error messages
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { signToken } from '../../../../lib/auth';
import md5 from 'md5';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // VULN: MD5 hashing used for password
    const hashedPassword = md5(password);

    // VULN: SQL injection via $queryRawUnsafe
    // Vulnerable query - username and password not sanitized
    // Injection example: username = admin'-- 
    const users = await prisma.$queryRawUnsafe(
      `SELECT * FROM "User" WHERE username = '${username}' AND password = '${hashedPassword}'`
    );

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const user = users[0];

    // VULN: Role from database used to build JWT - but JWT secret is weak
    const token = signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role, // VULN: role in JWT payload can be forged
    });

    // VULN: No rate limiting, no account lockout
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      // VULN: Flag 2 hints in response for SQLi challenge
      message: 'Login successful',
    });
  } catch (error) {
    // VULN: Verbose Prisma error message exposed
    return NextResponse.json(
      { error: `Authentication error: ${error.message}` },
      { status: 500 }
    );
  }
}
