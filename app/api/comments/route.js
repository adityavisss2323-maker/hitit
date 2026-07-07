// app/api/comments/route.js
// VULN: Stores raw HTML without sanitization (Stored XSS)
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  try {
    const comments = await prisma.comment.findMany({
      where: productId ? { productId: parseInt(productId) } : {},
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const body = await request.json();
    const { productId, comment, rating } = body;

    // VULN: No server-side HTML sanitization - stored XSS
    // The comment is stored as-is with raw HTML
    const newComment = await prisma.comment.create({
      data: {
        userId: user.id,
        productId: parseInt(productId),
        comment: comment, // Raw HTML stored directly
        rating: parseInt(rating) || 5,
      },
      include: { user: { select: { id: true, username: true } } },
    });

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
