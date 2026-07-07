// app/api/search/route.js
// VULN: SQL injection in search via $queryRawUnsafe
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ products: [], query: q });
  }

  try {
    // VULN: SQL injection via unsanitized search query
    // Example: q = %' UNION SELECT id,username,password,email,role,creditCard,resetToken,createdAt,createdAt,createdAt,createdAt FROM "User"--
    const products = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Product" WHERE name ILIKE '%${q}%' OR description ILIKE '%${q}%'`
    );

    return NextResponse.json({
      products,
      query: q,
      count: products.length,
      // VULN: Flag 2 hint
      hint: 'Search is powered by raw SQL for performance',
    });
  } catch (error) {
    // VULN: SQL error message exposed
    return NextResponse.json(
      { error: `Search error: ${error.message}`, query: q },
      { status: 500 }
    );
  }
}
