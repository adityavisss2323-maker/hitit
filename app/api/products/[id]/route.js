// app/api/products/[id]/route.js
// VULN: SQL injection via $queryRawUnsafe
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const products = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Product" WHERE id = ${id}`
    );

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const product = products[0];

    const comments = await prisma.comment.findMany({
      where: { productId: product.id },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Fix: Convert dates and clean up objects to prevent React #438 error
    const cleanProduct = {
      ...product,
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : null,
    };
    
    const cleanComments = comments.map(c => ({
      ...c,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
    }));

    return NextResponse.json({ product: cleanProduct, comments: cleanComments });
  } catch (error) {
    return NextResponse.json(
      { error: `Database error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
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
    return NextResponse.json({ 
      product: {
        ...product,
        createdAt: product.createdAt ? product.createdAt.toISOString() : null,
        updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}
