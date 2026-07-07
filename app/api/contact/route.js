// app/api/contact/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!email || !subject || !message) {
      return NextResponse.json({ error: 'Email, subject, and message are required' }, { status: 400 });
    }

    const user = getCurrentUser(request);

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user?.id || null,
        subject,
        email,
        message,
      },
    });

    return NextResponse.json({ ticket, message: 'Support ticket created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  // VULN: No auth check on listing tickets
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
