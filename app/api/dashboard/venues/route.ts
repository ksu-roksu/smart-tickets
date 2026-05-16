/**
 * app/api/dashboard/venues/route.ts
 * GET /api/dashboard/venues?q=arena&city=Алматы&limit=8
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const city = searchParams.get('city')?.trim() ?? ''
  const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '8'))

  const venues = await prisma.venue.findMany({
    where: {
      isActive: true,
      ...(city ? { city } : {}),
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      capacity: true,
    },
    orderBy: { name: 'asc' },
    take: limit,
  })

  return NextResponse.json({ data: venues })
}
