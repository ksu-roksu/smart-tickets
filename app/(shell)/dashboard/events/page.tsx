import { requireAuth } from '@/lib/auth/require-auth'
import EventsClient from './EventsClient'

export default async function EventsPage() {
  const ctx = await requireAuth()

  const params = new URLSearchParams()
  if (!ctx.isPlatformUser && ctx.organizationId) {
    // фильтр по организации происходит в API через resolveUser
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/dashboard/events?limit=50`,
    { cache: 'no-store' }
  )

  const json = res.ok ? await res.json() : { data: [] }

  const events = (json.data ?? []).map((e: any) => ({
    id: e.id,
    title: e.title,
    date: new Date(e.date ?? e.startAt).toLocaleDateString('ru-KZ', {
      day: 'numeric', month: 'long', year: 'numeric',
    }),
    venue: e.venue?.name ?? '—',
    city: e.venue?.city ?? '—',
    category: e.category ?? '—',
    status: e.status,
    sold: e.soldCount ?? 0,
    total: e.totalCapacity ?? 0,
  }))

  return <EventsClient events={events} />
}