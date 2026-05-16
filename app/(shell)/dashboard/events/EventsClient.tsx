'use client'

import { useState } from 'react'
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

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> = {
  PUBLISHED:      { label: 'Продаётся',   className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  PENDING_REVIEW: { label: 'На проверке', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  DRAFT:          { label: 'Черновик',    className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  REJECTED:       { label: 'Отклонено',   className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  COMPLETED:      { label: 'Завершено',   className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  ARCHIVED:       { label: 'Архив',       className: 'bg-zinc-500/10 text-zinc-500 border-zinc-700/20' },
}

const FILTER_TABS: { id: EventStatus | 'ALL'; label: string }[] = [
  { id: 'ALL',            label: 'Все' },
  { id: 'PUBLISHED',      label: 'Продаётся' },
  { id: 'PENDING_REVIEW', label: 'На проверке' },
  { id: 'DRAFT',          label: 'Черновики' },
  { id: 'REJECTED',       label: 'Отклонено' },
  { id: 'COMPLETED',      label: 'Завершено' },
  { id: 'ARCHIVED',       label: 'Архив' },
]

export default function EventsClient({ events }: { events: Event[] }) {
  const [activeTab, setActiveTab] = useState<EventStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const filtered = events.filter((e) => {
    const matchTab = activeTab === 'ALL' || e.status === activeTab
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">События</h1>
          <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
            {events.length} событий всего
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="flex items-center gap-2 rounded-2xl bg-[var(--color-text-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-background-primary)] transition hover:opacity-90"
        >
          <span>＋</span>
          <span>Новое событие</span>
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Поиск по названию или площадке..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-2xl border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-border-secondary)]"
      />

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-1">
        {FILTER_TABS.map((tab) => {
          const count = tab.id === 'ALL'
            ? events.length
            : events.filter((e) => e.status === tab.id).length
          if (count === 0 && tab.id !== 'ALL') return null

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition',
                activeTab === tab.id
                  ? 'bg-[var(--color-background-secondary)] font-medium text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
              ].join(' ')}
            >
              {tab.label}
              <span className="rounded-full bg-[var(--color-background-tertiary)] px-1.5 py-0.5 text-[10px]">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Events list */}
      <div className="rounded-3xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--color-text-tertiary)]">
            Нет событий
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-tertiary)]">
            {filtered.map((event) => {
              const cfg = STATUS_CONFIG[event.status]
              const pct = event.total > 0 ? Math.round((event.sold / event.total) * 100) : 0

              return (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-[var(--color-background-secondary)]"
                >
                  <div className="h-5 w-5 shrink-0 rounded-md border border-[var(--color-border-secondary)]" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                        {event.title}
                      </span>
                      <span className="shrink-0 rounded-full border border-[var(--color-border-tertiary)] px-2 py-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                        {event.category}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                      {event.date} · {event.venue} · {event.city}
                    </div>
                  </div>

                  <div className="hidden w-32 shrink-0 sm:block">
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
                      <span>{event.sold} / {event.total}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-background-tertiary)]">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs ${cfg.className}`}>
                    {cfg.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}