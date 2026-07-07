// app/api/products/[id]/route.js
// VULN: SQL injection via $queryRawUnsafe in product fetch by ID
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    // VULN: $queryRawUnsafe with unsanitized id parameter
    // Example injection: /api/products/1 UNION SELECT id,username,password,email,role,creditCard,resetToken,createdAt,createdAt FROM User--
    const products = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Product" WHERE id = ${id}`
    );

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Attach comments
    const comments = await prisma.comment.findMany({
      where: { productId: products[0].id },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ product: products[0], comments });
  } catch (error) {
    // VULN: Full Prisma/DB error exposed
    return NextResponse.json(
      { error: `Database error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  // VULN: No CSRF protection, weak admin check
  const user = getCurrentUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: body,
    });
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
