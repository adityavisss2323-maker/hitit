// app/api/orders/[id]/route.js
// VULN: IDOR - returns any order without checking if requester owns it
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const { id } = await params;
  const user = getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    // VULN: IDOR - no check that order belongs to requesting user
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { product: true, user: { select: { id: true, username: true, email: true } } },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // VULN: Returns full order including userId of owner, exposing other users' data
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
