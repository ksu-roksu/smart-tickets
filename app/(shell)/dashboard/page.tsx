'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

type SalesDay = {
  day: string
  date: string
  amount: number
  tickets: number
  isToday: boolean
}

type ChartSummary = {
  totalAmount: number
  totalTickets: number
  bestDay: { day: string; amount: number }
  todayAmount: number
  yesterdayAmount: number
  deltaPercent: number | null
}

const MOCK_EVENTS: Event[] = [
  { id: '1', title: 'Dimash World Tour — Алматы', date: '15 июня', venue: 'Арена Almaty', sold: 847, total: 5000, status: 'published' },
  { id: '2', title: 'Кайрат — Астана FC', date: '20 июня', venue: 'Центральный стадион', sold: 2100, total: 3000, status: 'published' },
  { id: '3', title: 'Ревизор — ГАТОБ им. Абая', date: '25 июня', venue: 'ГАТОБ', sold: 0, total: 800, status: 'moderation' },
  { id: '4', title: 'Stand-up Ночь — Бексейт Елемес', date: '1 июля', venue: 'Театр Лермонтова', sold: 0, total: 500, status: 'draft' },
]

const MOCK_SALES: SalesDay[] = [
  { day: 'Ср', date: '2026-05-12', amount: 184000, tickets: 92, isToday: false },
  { day: 'Чт', date: '2026-05-13', amount: 210000, tickets: 105, isToday: false },
  { day: 'Пт', date: '2026-05-14', amount: 156000, tickets: 78, isToday: false },
  { day: 'Сб', date: '2026-05-15', amount: 298000, tickets: 149, isToday: false },
  { day: 'Вс', date: '2026-05-16', amount: 412000, tickets: 206, isToday: false },
  { day: 'Пн', date: '2026-05-17', amount: 387000, tickets: 193, isToday: false },
  { day: 'Вт', date: '2026-05-18', amount: 284000, tickets: 142, isToday: true },
]

const MOCK_SUMMARY: ChartSummary = {
  totalAmount: 1931000,
  totalTickets: 965,
  bestDay: { day: 'Вс', amount: 412000 },
  todayAmount: 284000,
  yesterdayAmount: 387000,
  deltaPercent: -27,
}

const STATUS_CONFIG: Record<EventStatus, { label: string; dot: string; bg: string; text: string }> = {
  published:  { label: 'Продаётся',   dot: 'bg-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', text: 'text-emerald-400' },
  moderation: { label: 'Проверяется', dot: 'bg-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20',     text: 'text-amber-400' },
  draft:      { label: 'Черновик',    dot: 'bg-sky-400',     bg: 'bg-sky-400/10 border-sky-400/20',         text: 'text-sky-400' },
  rejected:   { label: 'Отклонено',   dot: 'bg-red-400',     bg: 'bg-red-400/10 border-red-400/20',         text: 'text-red-400' },
  finished:   { label: 'Завершено',   dot: 'bg-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20',        text: 'text-blue-400' },
  archive:    { label: 'Архив',       dot: 'bg-zinc-500',    bg: 'bg-zinc-500/10 border-zinc-500/20',        text: 'text-zinc-500' },
}

type Tab = 'mine' | 'moderation' | 'archive'

const TABS: { id: Tab; label: string }[] = [
  { id: 'mine', label: 'Мои события' },
  { id: 'moderation', label: 'На модерации' },
  { id: 'archive', label: 'Архив' },
]

const TAB_STATUSES: Record<Tab, EventStatus[]> = {
  mine: ['published', 'draft', 'rejected'],
  moderation: ['moderation'],
  archive: ['finished', 'archive'],
}

function formatAmount(v: number) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${Math.round(v / 1000)}K`
  return String(Math.round(v))
}

function fmt(v: number) {
  return v.toLocaleString('ru-KZ') + ' ₸'
}

function StatusBadge({ status }: { status: EventStatus }) {
  const s = STATUS_CONFIG[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function MetricCard({ label, value, delta, up = true }: {
  label: string
  value: string
  delta: string
  up?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: '#111' }}>
      <div className="mb-2 text-xs text-white/30">{label}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className={`mt-1 text-xs ${up ? 'text-emerald-400' : 'text-red-400'}`}>{delta}</div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#111' }}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="h-4 w-32 animate-pulse rounded bg-white/[0.05]" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/[0.04]" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="h-8 w-20 animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      </div>

      <div className="flex h-28 items-end gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-lg bg-white/[0.04]"
            style={{ height: `${35 + (i * 11) % 55}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function SalesChart() {
  const [data, setData] = useState<SalesDay[] | null>(null)
  const [summary, setSummary] = useState<ChartSummary | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [mode, setMode] = useState<'amount' | 'tickets'>('amount')
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/sales-chart')
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setData(MOCK_SALES)
          setSummary(MOCK_SUMMARY)
          return
        }

        const hasData = d.days?.some((day: SalesDay) => day.amount > 0)

        setData(hasData ? d.days : MOCK_SALES)
        setSummary(d.summary?.totalAmount > 0 ? d.summary : MOCK_SUMMARY)
      })
      .catch(() => {
        setError(true)
        setData(MOCK_SALES)
        setSummary(MOCK_SUMMARY)
      })
  }, [])

  if (!data || !summary) return <ChartSkeleton />

  const values = data.map(d => mode === 'amount' ? d.amount : d.tickets)
  const max = Math.max(...values, 1)
  const hoveredDay = hovered !== null ? data[hovered] : null
  const hoveredVal = hovered !== null ? values[hovered] : null

  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#111' }}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">Продажи за 7 дней</div>
          <div className="mt-0.5 text-xs text-white/30">
            {hoveredDay && hoveredVal !== null
              ? `${hoveredDay.day}: ${mode === 'amount' ? `₸ ${formatAmount(hoveredVal)}` : `${hoveredVal} билетов`}`
              : error
                ? 'Показаны демо-данные'
                : summary.deltaPercent !== null
                  ? `Сегодня ${summary.deltaPercent >= 0 ? '+' : ''}${summary.deltaPercent}% к вчера`
                  : 'Данных за сегодня пока нет'}
          </div>
        </div>

        <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          {(['amount', 'tickets'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === m
                  ? 'bg-orange-500/10 text-orange-400'
                  : 'text-white/30 hover:bg-white/[0.04] hover:text-white/50'
              }`}
            >
              {m === 'amount' ? '₸ Выручка' : 'Билеты'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-32 items-end gap-2">
        {data.map((d, i) => {
          const v = values[i]
          const h = Math.max(8, Math.round((v / max) * 100))
          const isHovered = hovered === i

          return (
            <div
              key={d.date}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-24 w-full items-end">
                {isHovered && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/[0.07] bg-black/70 px-2 py-1 text-[10px] text-white/60">
                    {mode === 'amount' ? `₸ ${formatAmount(v)}` : v}
                  </div>
                )}
                <div
                  className={`w-full rounded-lg transition-all ${
                    d.isToday
                      ? 'bg-orange-500/60'
                      : isHovered
                        ? 'bg-orange-400/50'
                        : 'bg-white/[0.06]'
                  }`}
                  style={{ height: `${h}%` }}
                />
              </div>

              <div className={`text-xs ${d.isToday ? 'text-orange-400' : 'text-white/25'}`}>
                {d.day}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 border-t border-white/[0.05] pt-4">
        <div>
          <div className="text-xs text-white/25">Итого за неделю</div>
          <div className="mt-1 text-sm font-medium text-white/70">₸ {formatAmount(summary.totalAmount)}</div>
        </div>
        <div>
          <div className="text-xs text-white/25">Билетов</div>
          <div className="mt-1 text-sm font-medium text-white/70">{summary.totalTickets.toLocaleString('ru-KZ')}</div>
        </div>
        <div>
          <div className="text-xs text-white/25">Лучший день</div>
          <div className="mt-1 text-sm font-medium text-emerald-400">
            {summary.bestDay.day} — ₸ {formatAmount(summary.bestDay.amount)}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventRow({ event }: { event: Event }) {
  const pct = event.total > 0 ? Math.round((event.sold / event.total) * 100) : 0

  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="group grid grid-cols-[1.2fr_1fr_120px_120px_120px] items-center gap-4 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.03] last:border-none"
    >
      <div>
        <div className="truncate text-sm font-medium text-white/75">{event.title}</div>
        <div className="mt-0.5 text-xs text-white/30">{event.date} · {event.venue}</div>
      </div>

      <div className="text-sm text-white/45">
        {event.sold.toLocaleString('ru-KZ')} / {event.total.toLocaleString('ru-KZ')} билетов
      </div>

      <div>
        {event.status === 'published' ? (
          <>
            <div className="h-[3px] rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-right text-[10px] text-white/25">{pct}%</div>
          </>
        ) : (
          <span className="text-xs text-white/20">—</span>
        )}
      </div>

      <div>
        <StatusBadge status={event.status} />
      </div>

      <div className="text-right opacity-0 transition-opacity group-hover:opacity-100">
        <span className="rounded-lg border border-white/[0.07] px-2 py-1 text-xs text-white/30">
          Открыть →
        </span>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('mine')
  const filtered = MOCK_EVENTS.filter(e => TAB_STATUSES[tab].includes(e.status))

  return (
    <div className="min-h-screen p-6" style={{ background: '#0d0d0d', color: 'white' }}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Обзор</h1>
          <p className="mt-0.5 text-sm text-white/30">
            Главный экран организатора: продажи, события и операционный статус
          </p>
        </div>

        <Link
          href="/dashboard/events/new"
          className="flex items-center gap-2 rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
        >
          + Новое событие
        </Link>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Продажи сегодня" value="284 000 ₸" delta="+18% к вчера" />
        <MetricCard label="Билетов продано" value="1 247" delta="+34 за час" />
        <MetricCard label="Активных событий" value="8" delta="3 сегодня" />
        <MetricCard label="Check-in сегодня" value="342" delta="68% от продаж" />
      </section>

      <div className="mb-6">
        <SalesChart />
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/[0.06]" style={{ background: '#111' }}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4" style={{ background: '#0d0d0d' }}>
          <div className="flex gap-2">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-white/35 hover:text-white/55'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-white/25">
            {filtered.length} событий
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[1.2fr_1fr_120px_120px_120px] gap-4 border-b border-white/[0.06] px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/20">
              <div>Событие</div>
              <div>Продажи</div>
              <div>Заполнение</div>
              <div>Статус</div>
              <div></div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mb-2 text-2xl">🎟️</div>
                <div className="text-sm font-medium text-white/50">Событий нет</div>
                <div className="mt-1 text-xs text-white/25">
                  Здесь появятся события после создания или модерации.
                </div>
              </div>
            ) : (
              filtered.map(event => <EventRow key={event.id} event={event} />)
            )}
          </div>
        </div>
      </section>
    </div>
  )
}