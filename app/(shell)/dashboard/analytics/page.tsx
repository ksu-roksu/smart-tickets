import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/require-auth'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
  const ctx = await requirePermission('analytics:view')

  const orgFilter = ctx.isPlatformUser
    ? {}
    : { organizationId: ctx.organizationId ?? '__none__' }

  const now = new Date()

  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const orders = await prisma.order.findMany({
    where: {
      ...orgFilter,
      status: { in: ['PAID', 'TICKET_ISSUED'] },
      OR: [
        { paidAt: { gte: thirtyDaysAgo } },
        { createdAt: { gte: thirtyDaysAgo } },
      ],
    },
    select: {
      id: true,
      createdAt: true,
      paidAt: true,
      totalAmount: true,
      items: {
        select: {
          quantity: true,
          ticketTypeId: true,
          ticketType: {
            select: { name: true },
          },
        },
      },
    },
  })

  const salesByDay: Record<string, { amount: number; tickets: number; orders: number }> = {}

  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(d.getDate() + i)
    salesByDay[d.toISOString().split('T')[0]] = { amount: 0, tickets: 0, orders: 0 }
  }

  for (const order of orders) {
    const date = order.paidAt ?? order.createdAt
    const key = new Date(date).toISOString().split('T')[0]
    const tickets = order.items.reduce((sum, item) => sum + item.quantity, 0)

    if (salesByDay[key]) {
      salesByDay[key].amount += Number(order.totalAmount)
      salesByDay[key].tickets += tickets
      salesByDay[key].orders += 1
    }
  }

  const salesDays = Object.entries(salesByDay).map(([date, value]) => ({
    date,
    day: new Date(date).toLocaleDateString('ru-KZ', {
      day: 'numeric',
      month: 'short',
    }),
    ...value,
  }))

  const ticketTypeMap: Record<string, { name: string; quantity: number; amount: number }> = {}

  for (const order of orders) {
    const orderTickets = order.items.reduce((sum, item) => sum + item.quantity, 0)

    for (const item of order.items) {
      const key = item.ticketTypeId
      const proportionalAmount =
        orderTickets > 0 ? Number(order.totalAmount) * (item.quantity / orderTickets) : 0

      if (!ticketTypeMap[key]) {
        ticketTypeMap[key] = {
          name: item.ticketType?.name ?? 'Билет',
          quantity: 0,
          amount: 0,
        }
      }

      ticketTypeMap[key].quantity += item.quantity
      ticketTypeMap[key].amount += proportionalAmount
    }
  }

  const ticketTypes = Object.values(ticketTypeMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8)

  const ticketOrgFilter = ctx.isPlatformUser
    ? {}
    : { order: { organizationId: ctx.organizationId ?? '__none__' } }

  const totalTickets = await prisma.ticket.count({
    where: {
      ...ticketOrgFilter,
      status: { in: ['VALID', 'USED'] },
    },
  })

  const usedTickets = await prisma.ticket.count({
    where: {
      ...ticketOrgFilter,
      status: 'USED',
    },
  })

  const activeEvents = await prisma.event.count({
    where: {
      ...orgFilter,
      status: 'PUBLISHED',
    },
  })

  const topEventsRaw = await prisma.event.findMany({
    where: orgFilter,
    orderBy: [
      { soldCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 6,
    select: {
      id: true,
      title: true,
      status: true,
      soldCount: true,
      totalCapacity: true,
      date: true,
      startAt: true,
      createdAt: true,
      venue: {
        select: {
          name: true,
          city: true,
        },
      },
    },
  })

  const topEvents = topEventsRaw.map((event) => ({
    id: event.id,
    title: event.title,
    status: event.status,
    sold: event.soldCount ?? 0,
    total: event.totalCapacity ?? 0,
    venue: event.venue?.name ?? 'Площадка не указана',
    city: event.venue?.city ?? '—',
    date: new Date(event.date ?? event.startAt ?? event.createdAt).toLocaleDateString('ru-KZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }))

  const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)

  const totalTicketsSold = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )

  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0

  const sevenDayAmount = salesDays.slice(-7).reduce((sum, day) => sum + day.amount, 0)
  const previousSevenDayAmount = salesDays.slice(-14, -7).reduce((sum, day) => sum + day.amount, 0)

  const revenueDelta =
    previousSevenDayAmount > 0
      ? Math.round(((sevenDayAmount - previousSevenDayAmount) / previousSevenDayAmount) * 100)
      : null

  return (
    <AnalyticsClient
      salesDays={salesDays}
      ticketTypes={ticketTypes}
      topEvents={topEvents}
      summary={{
        totalAmount,
        totalTicketsSold,
        totalOrders,
        averageOrderValue,
        checkinTotal: totalTickets,
        checkinUsed: usedTickets,
        activeEvents,
        revenueDelta,
      }}
    />
  )
}