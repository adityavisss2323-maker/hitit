// app/api/profile/[id]/route.js
// VULN: IDOR - returns any user profile without ownership check
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    // VULN: IDOR - no check that requesting user owns this profile
    // Any authenticated or unauthenticated user can access any profile
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        creditCard: true,  // VULN: Credit card exposed
        resetToken: true,  // VULN: Reset token exposed
        createdAt: true,
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // VULN: Flag 3 hint - embed flag value in user 2 (alice) profile
    const responseData = { user };
    if (parseInt(id) === 2) {
      responseData._debug = 'FLAG{1d0r_3xp0s3d_us3r_d4t4}';
    }

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  // VULN: No CSRF protection; no ownership check
  const currentUser = getCurrentUser(request);
  if (!currentUser) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  // VULN: Does not verify currentUser.id === parseInt(id)
  // Any authenticated user can update any profile

  try {
    const body = await request.json();
    const { email, creditCard } = body;

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { email, creditCard },
      select: { id: true, username: true, email: true, role: true, creditCard: true, createdAt: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
