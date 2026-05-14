import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ count: 0 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) return NextResponse.json({ count: 0 });

  const count = await prisma.ticket.count({
    where: {
      status: 'VALID',
      order: {
        userId: user.id,
      },
    },
  });

  return NextResponse.json({ count });
}