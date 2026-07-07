// app/api/admin/users/route.js
// VULN: Returns all user data including sensitive fields
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';

export async function GET(request) {
  // VULN: Admin check uses JWT role which can be forged with weak secret
  const user = getCurrentUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    // VULN: Returns ALL user data including credit cards, reset tokens, hashed passwords
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        creditCard: true,    // VULN: Sensitive data
        resetToken: true,    // VULN: Sensitive data  
        password: true,      // VULN: MD5 hash exposed
        createdAt: true,
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({
      users,
      count: users.length,
      // VULN: Admin token in response
      _adminToken: 'vm_admin_internal_token_xK9pL2mN',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
