// app/api/dashboard/orders/badge/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/require-auth'

export async function GET() {
  try {
    const ctx = await requirePermission('orders:view')
    const orgFilter = ctx.isPlatformUser
      ? {}
      : { organizationId: ctx.organizationId ?? '__none__' }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const newToday = await prisma.order.count({
      where: { ...orgFilter, status: 'PAID', paidAt: { gte: today } },
    })

    return NextResponse.json({ count: newToday })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}