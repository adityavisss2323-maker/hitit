// app/api/orders/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';

export async function GET(request) {
  const user = getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  // VULN: No CSRF token check
  const user = getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const body = await request.json();
    const { productId, quantity, total } = body;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        total: parseFloat(total),
        status: 'pending',
      },
      include: { product: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
