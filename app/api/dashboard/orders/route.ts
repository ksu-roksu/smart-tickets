// app/api/dashboard/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/require-auth'

export async function GET(req: NextRequest) {
  try {
    const ctx = await requirePermission('orders:view')
    const { searchParams } = new URL(req.url)

    const search = searchParams.get('q') ?? ''
    const status = searchParams.get('status') ?? 'ALL'
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = 20

    const orgFilter = ctx.isPlatformUser
      ? {}
      : { organizationId: ctx.organizationId ?? '__none__' }

    const statusFilter = status === 'ALL'
      ? {}
      : { status: status as any }

    const searchFilter = search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: 'insensitive' as any } },
            { buyerEmail: { contains: search, mode: 'insensitive' as any } },
            { buyerName: { contains: search, mode: 'insensitive' as any } },
            { buyerPhone: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {}

    const where = { ...orgFilter, ...statusFilter, ...searchFilter }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          event: { select: { title: true } },
          items: {
            select: {
              quantity: true,
              ticketType: { select: { name: true } },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    // Счётчик новых заказов (PAID за сегодня)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newToday = await prisma.order.count({
      where: { ...orgFilter, status: 'PAID', paidAt: { gte: today } },
    })

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: Number(o.totalAmount),
        currency: o.currency,
        buyerName: o.buyerName,
        buyerEmail: o.buyerEmail,
        buyerPhone: o.buyerPhone,
        eventTitle: o.event?.title ?? null,
        ticketSummary: o.items
          .map(i => `${i.ticketType.name} ×${i.quantity}`)
          .join(', '),
        ticketCount: o.items.reduce((s, i) => s + i.quantity, 0),
        paymentProvider: o.paymentProvider,
        createdAt: o.createdAt.toISOString(),
        paidAt: o.paidAt?.toISOString() ?? null,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
      newToday,
    })
  } catch (error) {
    console.error('orders error:', error)
    return NextResponse.json({ error: 'Ошибка загрузки заказов' }, { status: 500 })
  }
}