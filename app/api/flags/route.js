// app/api/flags/route.js
// Flag 10: Forged JWT admin flag endpoint
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';

export async function GET(request) {
  const user = getCurrentUser(request);

  if (!user) {
    return NextResponse.json({
      error: 'Authentication required',
      hint: 'You need a valid JWT token to access flags',
    }, { status: 401 });
  }

  if (user.role !== 'admin') {
    return NextResponse.json({
      error: 'Admin access required',
      hint: 'JWT tokens contain role information. The secret is weak - try cracking or forging it.',
      yourRole: user.role,
    }, { status: 403 });
  }

  // VULN: Returns flag if JWT has admin role (can be forged with weak secret)
  try {
    const flag = await prisma.flag.findUnique({
      where: { flagName: 'flag_10_jwt' },
    });

    return NextResponse.json({
      message: 'Congratulations! You forged an admin JWT token.',
      flag: flag?.flagValue || 'FLAG{jwt_w34k_s3cr3t_4dm1n_f0rg3d}',
      user: user,
      hint: 'The JWT secret was WEAK_SECRET - always use cryptographically strong secrets!',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
