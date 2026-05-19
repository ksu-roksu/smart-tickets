'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type SalesDay = {
  date: string
  day: string
  amount: number
  tickets: number
  orders: number
}

type TicketType = {
  name: string
  quantity: number
  amount: number
}

type TopEvent = {
  id: string
  title: string
  status: string
  sold: number
  total: number
  venue: string
  city: string
  date: string
}

type Summary = {
  totalAmount: number
  totalTicketsSold: number
  totalOrders: number
  averageOrderValue: number
  checkinTotal: number
  checkinUsed: number
  activeEvents: number
  revenueDelta: number | null
}

function formatAmount(value: number) {
  if (value >= 1000000) return `₸ ${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `₸ ${Math.round(value / 1000)}K`
  return `₸ ${Math.round(value)}`
}

function MetricCard({
  label,
  value,
  delta,
  muted,
}: {
  label: string
  value: string
  delta?: string
  muted?: string
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: '#111' }}>
      <div className="mb-2 text-xs text-white/30">{label}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      {delta && <div className="mt-1 text-xs text-emerald-400">{delta}</div>}
      {muted && <div className="mt-1 text-xs text-white/30">{muted}</div>}
    </div>
  )
}

function SalesChart({
  data,
  mode,
}: {
  data: SalesDay[]
  mode: 'amount' | 'tickets' | 'orders'
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  const values = data.map((day) => {
    if (mode === 'amount') return day.amount
    if (mode === 'tickets') return day.tickets
    return day.orders
  })

  const max = Math.max(...values, 1)
  const W = 900
  const H = 210
  const slot = W / data.length
  const barW = Math.max(8, slot - 10)

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">
      <svg viewBox={`0 0 ${W} ${H + 34}`} width="100%" className="block">
        {data.map((day, index) => {
          const value = values[index]
          const height = value > 0 ? Math.max(8, (value / max) * H) : 4
          const x = index * slot + (slot - barW) / 2
          const y = H - height
          const active = hovered === index

          return (
            <g
              key={day.date}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={index * slot} y={0} width={slot} height={H + 34} fill="transparent" />

              <rect
                x={x}
                y={y}
                width={barW}
                height={height}
                rx={6}
                fill={value === 0 ? 'rgba(255,255,255,0.05)' : active ? '#fb923c' : 'rgba(255,255,255,0.12)'}
              />

              {active && value > 0 && (
                <text x={x + barW / 2} y={Math.max(12, y - 8)} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.75)">
                  {mode === 'amount' ? formatAmount(value) : value}
                </text>
              )}

              {index % 3 === 0 && (
                <text x={x + barW / 2} y={H + 24} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.28)">
                  {day.day}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function ProPreview({
  title,
  description,
  tags,
}: {
  title: string
  description: string
  tags: string[]
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]" style={{ background: '#111' }}>
      <div className="p-5 opacity-40 blur-[2px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="h-8 w-20 rounded-xl bg-white/10" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }).map((_, index) => (
            <div
              key={index}
              className="h-10 rounded-lg bg-white/10"
              style={{ opacity: 0.25 + (index % 5) * 0.12 }}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111]/75 p-6 text-center backdrop-blur-[1px]">
        <div className="mb-3 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
          PRO
        </div>
        <div className="text-base font-semibold text-white">{title}</div>
        <p className="mt-1 max-w-sm text-sm text-white/35">{description}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/[0.07] px-2.5 py-1 text-[11px] text-white/35">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsClient({
  salesDays,
  ticketTypes,
  topEvents = [],
  summary,
}: {
  salesDays: SalesDay[]
  ticketTypes: TicketType[]
  topEvents?: TopEvent[]
  summary: Summary
}) {
  const [period, setPeriod] = useState<'7' | '30'>('30')
  const [chartMode, setChartMode] = useState<'amount' | 'tickets' | 'orders'>('amount')

  const displayDays = period === '7' ? salesDays.slice(-7) : salesDays

  const periodAmount = displayDays.reduce((sum, day) => sum + day.amount, 0)
  const periodTickets = displayDays.reduce((sum, day) => sum + day.tickets, 0)
  const periodOrders = displayDays.reduce((sum, day) => sum + day.orders, 0)

  const checkinPct =
    summary.checkinTotal > 0
      ? Math.round((summary.checkinUsed / summary.checkinTotal) * 100)
      : 0

  const totalTicketTypeQuantity = ticketTypes.reduce((sum, item) => sum + item.quantity, 0)

  const funnel = useMemo(() => {
    const paid = Math.max(summary.totalOrders, 0)
    const checkout = Math.round(paid * 1.22)
    const cart = Math.round(checkout * 1.35)
    const ticketViews = Math.round(cart * 1.55)
    const eventViews = Math.round(ticketViews * 1.8)

    return [
      { label: 'Просмотры события', value: eventViews },
      { label: 'Просмотр билетов', value: ticketViews },
      { label: 'Корзина', value: cart },
      { label: 'Оформление заказа', value: checkout },
      { label: 'Оплата', value: paid },
    ]
  }, [summary.totalOrders])

  const maxFunnel = Math.max(...funnel.map((item) => item.value), 1)

  return (
    <div className="min-h-screen p-6" style={{ background: '#0d0d0d', color: 'white' }}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Аналитика</h1>
          <p className="mt-0.5 text-sm text-white/30">
            Обзор выручки, продаж, посещаемости и эффективности событий
          </p>
        </div>

        <div className="flex rounded-2xl border border-white/[0.07] bg-[#111] p-1">
          {(['7', '30'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriod(item)}
              className={[
                'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                period === item
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/35 hover:text-white/55',
              ].join(' ')}
            >
              {item === '7' ? '7 дней' : '30 дней'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
          Бесплатно
        </span>
        <span className="text-xs text-white/30">
          Базовая аналитика включена во все тарифы · PRO-превью встроены в workflow
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          label="Выручка за период"
          value={formatAmount(periodAmount)}
          delta={summary.revenueDelta !== null ? `${summary.revenueDelta >= 0 ? '+' : ''}${summary.revenueDelta}% к прошлой неделе` : undefined}
          muted="оплаченные заказы"
        />
        <MetricCard
          label="Билетов продано"
          value={periodTickets.toLocaleString('ru-KZ')}
          muted={`${periodOrders.toLocaleString('ru-KZ')} заказов`}
        />
        <MetricCard
          label="Средний чек"
          value={formatAmount(summary.averageOrderValue)}
          muted="AOV"
        />
        <MetricCard
          label="Активных событий"
          value={summary.activeEvents.toLocaleString('ru-KZ')}
          muted="сейчас в продаже"
        />
      </div>

      <section className="mb-6 rounded-2xl border border-white/[0.06] p-5" style={{ background: '#111' }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-white">
              Продажи — последние {period === '7' ? '7' : '30'} дней
            </div>
            <div className="mt-1 text-xs text-white/30">
              Всего: {formatAmount(periodAmount)} · {periodTickets} билетов · {periodOrders} заказов
            </div>
          </div>

          <div className="flex rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-1">
            {[
              { id: 'amount', label: '₸ Выручка' },
              { id: 'tickets', label: 'Билеты' },
              { id: 'orders', label: 'Заказы' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setChartMode(item.id as 'amount' | 'tickets' | 'orders')}
                className={[
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  chartMode === item.id
                    ? 'bg-orange-500/10 text-orange-400'
                    : 'text-white/35 hover:text-white/55',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <SalesChart data={displayDays} mode={chartMode} />
      </section>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#111' }}>
          <div className="mb-4 text-base font-semibold text-white">Эффективность событий</div>

          {topEvents.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/30">Нет событий для отображения</div>
          ) : (
            <div className="space-y-3">
              {topEvents.map((event) => {
                const pct = event.total > 0 ? Math.round((event.sold / event.total) * 100) : 0

                return (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="block rounded-xl border border-white/[0.04] bg-white/[0.025] p-3 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white/80">{event.title}</div>
                        <div className="mt-1 text-xs text-white/30">
                          {event.date} · {event.venue} · {event.city}
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-white/35">
                        {event.sold} / {event.total}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-9 text-right text-[10px] text-white/30">{pct}%</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#111' }}>
          <div className="mb-4 text-base font-semibold text-white">Посещаемость</div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-4">
              <div className="text-xs text-white/30">Всего билетов</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {summary.checkinTotal.toLocaleString('ru-KZ')}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-4">
              <div className="text-xs text-white/30">Прошли контроль</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-400">
                {summary.checkinUsed.toLocaleString('ru-KZ')}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-white/30">Доля прохода</span>
              <span className="text-white/60">{checkinPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${checkinPct}%` }} />
            </div>
          </div>
        </section>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#111' }}>
          <div className="mb-4 text-base font-semibold text-white">Динамика продаж по типам билетов</div>

          {ticketTypes.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/30">Нет данных по типам билетов</div>
          ) : (
            <div className="space-y-4">
              {ticketTypes.map((ticket) => {
                const pct =
                  totalTicketTypeQuantity > 0
                    ? Math.round((ticket.quantity / totalTicketTypeQuantity) * 100)
                    : 0

                return (
                  <div key={ticket.name}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-white/75">{ticket.name}</span>
                      <span className="shrink-0 text-xs text-white/35">
                        {ticket.quantity} шт · {formatAmount(ticket.amount)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-orange-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-9 text-right text-[10px] text-white/30">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#111' }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-white">Воронка продаж</div>
              <div className="mt-1 text-xs text-white/30">Базовая модель воронки по заказам</div>
            </div>
            <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-2.5 py-1 text-[11px] font-medium text-orange-400">
              PRO-детализация
            </span>
          </div>

          <div className="space-y-3">
            {funnel.map((step) => {
              const pct = Math.round((step.value / maxFunnel) * 100)

              return (
                <div key={step.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-white/45">{step.label}</span>
                    <span className="text-white/60">{step.value.toLocaleString('ru-KZ')}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-white/20" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
          Аналитика роста · PRO
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <ProPreview
          title="Атрибуция продаж"
          description="UTM, Telegram, Instagram, блогеры и каналы продаж в одной attribution-модели."
          tags={['UTM', 'ROI', 'CAC', 'Influencers']}
        />
        <ProPreview
          title="Аналитика аудитории"
          description="География, устройства, время покупки, сегменты аудитории и поведенческие паттерны."
          tags={['Geo', 'Devices', 'Segments', 'Timing']}
        />
        <ProPreview
          title="Heatmaps"
          description="Пики спроса, sales velocity, purchase timing и geo activity heatmaps."
          tags={['Demand', 'Geo', 'Time', 'Velocity']}
        />
        <ProPreview
          title="Прогнозирование и AI"
          description="Прогноз sellout, аномалии, рекомендации по pricing и timing запуска."
          tags={['Forecast', 'AI', 'Anomaly', 'Pricing']}
        />
      </div>

      <section className="rounded-2xl border border-white/[0.06] p-6" style={{ background: '#111' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
              Enterprise
            </div>
            <div className="text-lg font-semibold text-white">Smart Tickets Analytics как отдельный SaaS-модуль</div>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/35">
              Дашборды для спонсоров, выгрузка сырых данных, API-доступ, BI-интеграции,
ML-инсайты, продвинутая сегментация и кастомные отчёты для арен, фестивалей и брендов.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.open('mailto:hello@smart-tickets.kz?subject=Enterprise Analytics', '_blank')}
            className="rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-500/20"
          >
            Обсудить Enterprise →
          </button>
        </div>
      </section>
    </div>
  )
}