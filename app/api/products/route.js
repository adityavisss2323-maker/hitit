// app/api/products/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');

    let products;
    if (category) {
      products = await prisma.product.findMany({
        where: { category },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } else {
      products = await prisma.product.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ products });
  } catch (error) {
    // VULN: Verbose Prisma error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
