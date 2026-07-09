// app/api/profile/[id]/route.js
// VULN: IDOR - returns any user profile without ownership check
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    // VULN: IDOR - no check that requesting user owns this profile
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        creditCard: true,
        resetToken: true,
        createdAt: true,
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Fix: Ensure dates are strings to avoid React child object errors on the frontend if accidentally rendered
    const cleanUser = {
      ...user,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    };

    const responseData = { user: cleanUser };
    if (parseInt(id) === 2) {
      responseData._debug = 'FLAG{1d0r_3xp0s3d_us3r_d4t4}';
    }

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const currentUser = getCurrentUser(request);
  if (!currentUser) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const body = await request.json();
    const { email, creditCard } = body;

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { email, creditCard },
      select: { id: true, username: true, email: true, role: true, creditCard: true, createdAt: true },
    });

    return NextResponse.json({ 
      user: {
        ...updated,
        createdAt: updated.createdAt ? updated.createdAt.toISOString() : null,
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}
