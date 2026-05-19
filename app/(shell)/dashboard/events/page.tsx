import { requirePermission } from '@/lib/rbac/requirePermission'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import EventsClient from './EventsClient'

export default async function EventsPage() {
  const ctx = await requireAuth()
requirePermission(ctx, 'events:view')

  const where = ctx.isPlatformUser
    ? {}
    : { organizationId: ctx.organizationId ?? '__none__' }

  const events = await prisma.event.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      venue: { select: { name: true, city: true } },
    },
  })

  const mapped = events.map((e) => ({
    id: e.id,
    title: e.title,
    date: new Date(e.date ?? e.startAt ?? new Date()).toLocaleDateString('ru-KZ', {
      day: 'numeric', month: 'long', year: 'numeric',
    }),
    venue: e.venue?.name ?? '—',
    city: e.venue?.city ?? '—',
    category: e.category ?? '—',
    status: e.status,
    sold: e.soldCount ?? 0,
    total: e.totalCapacity ?? 0,
  }))

  return <EventsClient events={mapped} />
}