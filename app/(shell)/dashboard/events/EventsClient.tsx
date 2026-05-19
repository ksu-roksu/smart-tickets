'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type EventStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'COMPLETED' | 'ARCHIVED'

type Event = {
  id: string
  title: string
  date: string
  venue: string
  city: string
  sold: number
  total: number
  status: EventStatus
  category: string
}

const STATUS_CONFIG: Record<EventStatus, { label: string; dot: string; className: string }> = {
  PUBLISHED:      { label: 'Продаётся',   dot: 'bg-emerald-400', className: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  PENDING_REVIEW: { label: 'На проверке', dot: 'bg-amber-400',   className: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  DRAFT:          { label: 'Черновик',    dot: 'bg-sky-400',     className: 'bg-sky-400/10 text-sky-400 border-sky-400/20' },
  REJECTED:       { label: 'Отклонено',   dot: 'bg-red-400',     className: 'bg-red-400/10 text-red-400 border-red-400/20' },
  COMPLETED:      { label: 'Завершено',   dot: 'bg-blue-400',    className: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
  ARCHIVED:       { label: 'Архив',       dot: 'bg-zinc-500',    className: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' },
}

const FILTER_TABS: { id: EventStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Все' },
  { id: 'PUBLISHED', label: 'Продаётся' },
  { id: 'PENDING_REVIEW', label: 'На проверке' },
  { id: 'DRAFT', label: 'Черновики' },
  { id: 'REJECTED', label: 'Отклонено' },
  { id: 'COMPLETED', label: 'Завершено' },
  { id: 'ARCHIVED', label: 'Архив' },
]

function StatusBadge({ status }: { status: EventStatus }) {
  const s = STATUS_CONFIG[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${s.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export default function EventsClient({ events }: { events: Event[] }) {
  const [activeTab, setActiveTab] = useState<EventStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const q = search.toLowerCase().trim()
      const matchTab = activeTab === 'ALL' || e.status === activeTab
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)

      return matchTab && matchSearch
    })
  }, [events, activeTab, search])

  const kpi = useMemo(() => {
    const active = events.filter(e => e.status === 'PUBLISHED').length
    const review = events.filter(e => e.status === 'PENDING_REVIEW').length
    const sold = events.reduce((s, e) => s + e.sold, 0)
    const capacity = events.reduce((s, e) => s + e.total, 0)
    const fillRate = capacity ? Math.round((sold / capacity) * 100) : 0

    return { active, review, sold, capacity, fillRate }
  }, [events])

  return (
    <div className="min-h-screen p-6" style={{ background: '#0d0d0d', color: 'white' }}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">События</h1>
          <p className="mt-0.5 text-sm text-white/30">
            Управление событиями, статусами продаж и модерацией
          </p>
        </div>

        <Link
          href="/dashboard/events/new"
          className="flex items-center gap-2 rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
        >
          + Новое событие
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Всего событий', value: events.length.toLocaleString('ru-KZ'), delta: `${filtered.length} в выборке`, up: true },
          { label: 'Продаётся', value: kpi.active.toLocaleString('ru-KZ'), delta: 'активные продажи', up: true },
          { label: 'На проверке', value: kpi.review.toLocaleString('ru-KZ'), delta: 'ожидают модерации', up: kpi.review === 0 },
          { label: 'Заполнение', value: `${kpi.fillRate}%`, delta: `${kpi.sold.toLocaleString('ru-KZ')} / ${kpi.capacity.toLocaleString('ru-KZ')}`, up: true },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-white/[0.06] p-4" style={{ background: '#111' }}>
            <div className="mb-2 text-xs text-white/30">{k.label}</div>
            <div className="text-2xl font-semibold text-white">{k.value}</div>
            <div className={`mt-1 text-xs ${k.up ? 'text-emerald-400' : 'text-amber-400'}`}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-40 flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/20">🔍</span>
          <input
            type="text"
            placeholder="Поиск по названию, площадке, городу или категории…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white/70 placeholder:text-white/20 focus:border-white/15 focus:outline-none"
          />
        </div>

        {FILTER_TABS.map((tab) => {
          const count = tab.id === 'ALL'
            ? events.length
            : events.filter((e) => e.status === tab.id).length

          if (count === 0 && tab.id !== 'ALL') return null

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                  : 'border-white/[0.07] text-white/35 hover:bg-white/[0.04] hover:text-white/50'
              }`}
            >
              {tab.label}
              <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/35">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06]" style={{ background: '#111' }}>
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.06]" style={{ background: '#0d0d0d' }}>
            <tr>
              {['СОБЫТИЕ', 'КАТЕГОРИЯ', 'ГОРОД / ПЛОЩАДКА', 'ПРОДАЖИ', 'ЗАПОЛНЕНИЕ', 'СТАТУС', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-white/20">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="mb-2 text-2xl">🎟️</div>
                  <div className="text-sm font-medium text-white/50">События не найдены</div>
                  <div className="mt-1 text-xs text-white/25">
                    Попробуйте изменить поиск или фильтр.
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(event => {
                const pct = event.total > 0 ? Math.round((event.sold / event.total) * 100) : 0

                return (
                  <tr
                    key={event.id}
                    className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] last:border-none"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/events/${event.id}`} className="block">
                        <div className="font-medium text-white/75">{event.title}</div>
                        <div className="mt-0.5 text-xs text-white/30">{event.date}</div>
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-xs text-white/35">
                        {event.category}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-white/60">{event.city}</div>
                      <div className="mt-0.5 text-xs text-white/30">{event.venue}</div>
                    </td>

                    <td className="px-4 py-3 text-white/55">
                      {event.sold.toLocaleString('ru-KZ')} / {event.total.toLocaleString('ru-KZ')}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-[3px] w-24 rounded-full bg-white/[0.06]">
                          <div
                            className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-white/20'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/30">{pct}%</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={event.status} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="opacity-0 rounded-lg border border-white/[0.07] px-2 py-1 text-xs text-white/30 transition-opacity hover:bg-white/[0.04] group-hover:opacity-100"
                      >
                        Открыть →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}