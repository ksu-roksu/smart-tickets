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
    <div className="rounded-2xl border border-[var(--dash-card-border)] p-4" >
      <div className="mb-2 text-xs text-[var(--color-text-tertiary)]">{label}</div>
      <div className="text-2xl font-semibold text-[var(--color-text-primary)]">{value}</div>
      {delta && <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-600 dark:text-emerald-400">{delta}</div>}
      {muted && <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{muted}</div>}
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
    <div className="overflow-hidden rounded-2xl border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] p-4">
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
                fill={value === 0 ? 'var(--chart-bar-empty)' : active ? '#f97316' : 'var(--chart-bar)'}
              />

              {active && value > 0 && (
                <text x={x + barW / 2} y={Math.max(12, y - 8)} textAnchor="middle" fontSize="11" fill="var(--chart-label)">
                  {mode === 'amount' ? formatAmount(value) : value}
                </text>
              )}

              {index % 3 === 0 && (
                <text x={x + barW / 2} y={H + 24} textAnchor="middle" fontSize="10" fill="var(--chart-label-muted)">
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

function ProPreview({ title, description, tags }: { title: string; description: string; tags: string[] }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] transition-shadow hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-white dark:from-violet-500/[0.05] dark:via-transparent dark:to-transparent pointer-events-none" />
      <div className="relative p-6 text-center">
        <div className="mb-3 inline-flex rounded-full bg-violet-600 px-3 py-1 text-[11px] font-bold tracking-widest text-white shadow-sm shadow-violet-500/25">
          PRO
        </div>
        <h3 className="text-[15px] font-bold tracking-tight text-[var(--color-text-primary)]">{title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {tags.map(t => (
            <span key={t} className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">{t}</span>
          ))}
        </div>
        <button className="mt-4 rounded-xl bg-violet-600 px-5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-violet-700 active:scale-95">
          Подключить PRO →
        </button>
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
    <div className="min-h-screen p-6 bg-[var(--dash-bg)]" >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Аналитика</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-tertiary)]">
            Обзор выручки, продаж, посещаемости и эффективности событий
          </p>
        </div>

        <div className="flex rounded-2xl border border-[var(--dash-card-border)] bg-[var(--color-background-secondary)] p-1">
          {(['7', '30'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriod(item)}
              className={[
                'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                period === item
                  ? 'bg-[var(--dash-card-bg)] text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)]',
              ].join(' ')}
            >
              {item === '7' ? '7 дней' : '30 дней'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Бесплатно
        </span>
        <span className="text-xs text-[var(--color-text-tertiary)]">
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

      <section className="mb-6 rounded-2xl border border-[var(--dash-card-border)] p-5 bg-[var(--dash-card-bg)]" >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-[var(--color-text-primary)]">
              Продажи — последние {period === '7' ? '7' : '30'} дней
            </div>
            <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Всего: {formatAmount(periodAmount)} · {periodTickets} билетов · {periodOrders} заказов
            </div>
          </div>

          <div className="flex rounded-xl border border-white/[0.07] bg-[var(--dash-bg)] p-1">
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
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)]',
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
        <section className="rounded-2xl border border-[var(--dash-card-border)] p-5 bg-[var(--dash-card-bg)]" >
          <div className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">Эффективность событий</div>

          {topEvents.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-text-tertiary)]">Нет событий для отображения</div>
          ) : (
            <div className="space-y-3">
              {topEvents.map((event) => {
                const pct = event.total > 0 ? Math.round((event.sold / event.total) * 100) : 0

                return (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="block rounded-xl border border-white/[0.04] bg-[var(--dash-card-bg)] p-3 transition-colors hover:bg-[var(--color-background-secondary)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{event.title}</div>
                        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                          {event.date} · {event.venue} · {event.city}
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-[var(--color-text-secondary)]">
                        {event.sold} / {event.total}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border-tertiary)]">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-9 text-right text-[10px] text-[var(--color-text-tertiary)]">{pct}%</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--dash-card-border)] p-5 bg-[var(--dash-card-bg)]" >
          <div className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">Посещаемость</div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] p-4">
              <div className="text-xs text-[var(--color-text-tertiary)]">Всего билетов</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                {summary.checkinTotal.toLocaleString('ru-KZ')}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] p-4">
              <div className="text-xs text-[var(--color-text-tertiary)]">Прошли контроль</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {summary.checkinUsed.toLocaleString('ru-KZ')}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-[var(--color-text-tertiary)]">Доля прохода</span>
              <span className="text-[var(--color-text-secondary)]">{checkinPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border-tertiary)]">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${checkinPct}%` }} />
            </div>
          </div>
        </section>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-[var(--dash-card-border)] p-5 bg-[var(--dash-card-bg)]" >
          <div className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">Динамика продаж по типам билетов</div>

          {ticketTypes.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-text-tertiary)]">Нет данных по типам билетов</div>
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
                      <span className="truncate text-[var(--color-text-primary)]">{ticket.name}</span>
                      <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                        {ticket.quantity} шт · {formatAmount(ticket.amount)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border-tertiary)]">
                        <div className="h-full rounded-full bg-orange-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-9 text-right text-[10px] text-[var(--color-text-tertiary)]">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--dash-card-border)] p-5 bg-[var(--dash-card-bg)]" >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-[var(--color-text-primary)]">Воронка продаж</div>
              <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">Базовая модель воронки по заказам</div>
            </div>
            <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-2.5 py-1 text-[11px] font-medium text-orange-600 dark:text-orange-400">
              PRO-детализация
            </span>
          </div>

          <div className="space-y-3">
            {funnel.map((step) => {
              const pct = Math.round((step.value / maxFunnel) * 100)

              return (
                <div key={step.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[var(--color-text-secondary)]">{step.label}</span>
                    <span className="text-[var(--color-text-secondary)]">{step.value.toLocaleString('ru-KZ')}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border-tertiary)]">
                    <div className="h-full rounded-full bg-white/20" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border-tertiary)]" />
        <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
          Аналитика роста · PRO
        </span>
        <div className="h-px flex-1 bg-[var(--color-border-tertiary)]" />
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

      <section className="relative overflow-hidden rounded-2xl border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-500/[0.06] dark:via-transparent dark:to-indigo-500/[0.04] pointer-events-none" />
        <div className="relative p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold tracking-widest text-white shadow-sm shadow-blue-500/20">
                ENTERPRISE
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                Smart Tickets Analytics — отдельный SaaS-модуль
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Дашборды для спонсоров, API-доступ, BI-интеграции, ML-инсайты, продвинутая сегментация и кастомные отчёты для арен, фестивалей и брендов.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["API-доступ", "BI-интеграции", "ML-инсайты", "Белый лейбл", "SLA 99.9%"].map(f => (
                  <span key={f} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">{f}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 items-end">
              <button
                type="button"
                onClick={() => window.open("mailto:hello@smart-tickets.kz?subject=Enterprise Analytics", "_blank")}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95"
              >
                Обсудить Enterprise →
              </button>
              <span className="text-xs text-[var(--color-text-tertiary)]">Персональная демо · Индивидуальные условия</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}