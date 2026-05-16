'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

type EventStatus = 'published' | 'moderation' | 'draft' | 'rejected' | 'finished' | 'archive'

type Event = {
  id: string
  title: string
  date: string
  venue: string
  sold: number
  total: number
  status: EventStatus
}

// ─── Mock data (заменится на реальный fetch после подключения Prisma) ─────────

const MOCK_EVENTS: Event[] = [
  { id: '1', title: 'Dimash World Tour — Алматы', date: '15 июня', venue: 'Арена Almaty', sold: 847, total: 5000, status: 'published' },
  { id: '2', title: 'Кайрат — Астана FC', date: '20 июня', venue: 'Центральный стадион', sold: 2100, total: 3000, status: 'published' },
  { id: '3', title: 'Ревизор — ГАТОБ им. Абая', date: '25 июня', venue: 'ГАТОБ', sold: 0, total: 800, status: 'moderation' },
  { id: '4', title: 'Stand-up Ночь — Бексейт Елемес', date: '1 июля', venue: 'Театр Лермонтова', sold: 0, total: 500, status: 'draft' },
]

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> = {
  published:  { label: 'Продаётся',       className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  moderation: { label: 'Проверяется',     className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  draft:      { label: 'Черновик',        className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  rejected:   { label: 'Отклонено',       className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  finished:   { label: 'Завершено',       className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  archive:    { label: 'Архив',           className: 'bg-zinc-500/10 text-zinc-500 border-zinc-700/20' },
}

type Tab = 'mine' | 'moderation' | 'archive'

const TABS: { id: Tab; label: string }[] = [
  { id: 'mine',       label: 'Мои события' },
  { id: 'moderation', label: 'На модерации' },
  { id: 'archive',    label: 'Архив' },
]

const TAB_STATUSES: Record<Tab, EventStatus[]> = {
  mine:       ['published', 'draft', 'rejected'],
  moderation: ['moderation'],
  archive:    ['finished', 'archive'],
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  label, value, delta, sub,
}: {
  label: string
  value: string
  delta?: string
  sub?: string
}) {
  return (
    <div className="rounded-3xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-5">
      <div className="text-sm text-[var(--color-text-tertiary)]">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
        {value}
      </div>
      {delta && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
          <span>↑</span>
          <span>{delta}</span>
        </div>
      )}
      {sub && !delta && (
        <div className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">{sub}</div>
      )}
    </div>
  )
}

// ─── Event Row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: Event }) {
  const cfg = STATUS_CONFIG[event.status]
  const pct = event.total > 0 ? Math.round((event.sold / event.total) * 100) : 0

  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="flex items-center gap-4 rounded-2xl px-4 py-3.5 transition hover:bg-[var(--color-background-secondary)]"
    >
      {/* Checkbox placeholder */}
      <div className="h-5 w-5 shrink-0 rounded-md border border-[var(--color-border-secondary)]" />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {event.title}
        </div>
        <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
          {event.date} · {event.venue} · {event.sold} / {event.total} билетов
        </div>
      </div>

      {/* Progress bar (only for published) */}
      {event.status === 'published' && (
        <div className="hidden w-24 shrink-0 sm:block">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-background-tertiary)]">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 text-right text-[10px] text-[var(--color-text-tertiary)]">
            {pct}%
          </div>
        </div>
      )}

      {/* Status badge */}
      <span className={`shrink-0 rounded-full border px-3 py-1 text-xs ${cfg.className}`}>
        {cfg.label}
      </span>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('mine')

  const filtered = MOCK_EVENTS.filter(e =>
    TAB_STATUSES[tab].includes(e.status)
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Dashboard
        </h1>
        <Link
          href="/dashboard/events/new"
          className="flex items-center gap-2 rounded-2xl border border-[var(--color-border-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] transition hover:bg-[var(--color-background-secondary)]"
        >
          <span>＋</span>
          <span>Новое событие</span>
        </Link>
      </div>

      {/* Metrics */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Продажи сегодня"  value="₸ 284K"  delta="+18% к вчера" />
        <MetricCard label="Билетов продано"   value="1 247"   delta="+34 за час" />
        <MetricCard label="Активных событий"  value="8"       sub="3 сегодня" />
        <MetricCard label="Check-in сегодня"  value="342"     sub="68% от продаж" />
      </section>

      {/* Events table */}
      <section className="rounded-3xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border-tertiary)] px-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'px-4 py-4 text-sm transition',
                tab === t.id
                  ? 'border-b-2 border-[var(--color-text-primary)] font-medium text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-[var(--color-border-tertiary)] p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--color-text-tertiary)]">
              Нет событий
            </div>
          ) : (
            filtered.map(event => <EventRow key={event.id} event={event} />)
          )}
        </div>
      </section>

    </div>
  )
}