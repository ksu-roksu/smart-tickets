// app/api/dashboard/sales-chart/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/require-auth'

export async function GET() {
  try {
    const ctx = await requirePermission('analytics:view')

    const now = new Date()
    const tz = 'Asia/Almaty'

    // 7 дней назад — начало дня
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const where = {
      status: { in: ['PAID', 'TICKET_ISSUED'] as any },
      paidAt: { gte: sevenDaysAgo, lte: now },
      ...(ctx.isPlatformUser ? {} : { organizationId: ctx.organizationId ?? '__none__' }),
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        paidAt: true,
        totalAmount: true,
        items: { select: { quantity: true } },
      },
    })

    // Группируем по дням (0 = 6 дней назад, 6 = сегодня)
    const days: { amount: number; tickets: number }[] = Array.from({ length: 7 }, () => ({
      amount: 0,
      tickets: 0,
    }))

    for (const order of orders) {
      if (!order.paidAt) continue

      const orderDate = new Date(order.paidAt)
      const diffMs = now.getTime() - orderDate.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const idx = 6 - diffDays

      if (idx < 0 || idx > 6) continue

      days[idx].amount += Number(order.totalAmount)
      days[idx].tickets += order.items.reduce((s, i) => s + i.quantity, 0)
    }

    // Названия дней недели
    const DAY_NAMES_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

    const result = days.map((d, i) => {
      const date = new Date(sevenDaysAgo)
      date.setDate(date.getDate() + i)
      return {
        day: DAY_NAMES_RU[date.getDay()],
        date: date.toISOString().split('T')[0],
        amount: Math.round(d.amount),
        tickets: d.tickets,
        isToday: i === 6,
      }
    })

    // Сводные метрики
    const totalAmount = result.reduce((s, d) => s + d.amount, 0)
    const totalTickets = result.reduce((s, d) => s + d.tickets, 0)
    const bestDay = result.reduce((best, d) => d.amount > best.amount ? d : best, result[0])

    // Вчера vs позавчера для delta
    const todayAmount = result[6].amount
    const yesterdayAmount = result[5].amount
    const deltaPercent = yesterdayAmount > 0
      ? Math.round(((todayAmount - yesterdayAmount) / yesterdayAmount) * 100)
      : null

    return NextResponse.json({
      days: result,
      summary: {
        totalAmount,
        totalTickets,
        bestDay: { day: bestDay.day, amount: bestDay.amount },
        todayAmount,
        yesterdayAmount,
        deltaPercent,
      },
    })
  } catch (error) {
    console.error('sales-chart error:', error)
    return NextResponse.json({ error: 'Ошибка загрузки данных' }, { status: 500 })
  }
}