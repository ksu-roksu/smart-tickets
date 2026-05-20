import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ count: 0 });

  const count = await prisma.ticket.count({
    where: { userId, status: 'VALID' },
  });

  return NextResponse.json({ count });
}