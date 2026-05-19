// app/(shell)/dashboard/orders/page.tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type Order = {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  currency: string
  buyerName: string | null
  buyerEmail: string
  buyerPhone: string | null
  eventTitle: string | null
  ticketSummary: string
  ticketCount: number
  paymentProvider: string | null
  createdAt: string
  paidAt: string | null
}

type OrdersResponse = {
  orders: Order[]
  total: number
  page: number
  pages: number
  newToday: number
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; className: string }> = {
  PENDING: { label: 'Ожидает', dot: 'bg-zinc-400', className: 'bg-zinc-400/10 border-zinc-400/20 text-zinc-400' },
  AWAITING_PAYMENT: { label: 'К оплате', dot: 'bg-amber-400', className: 'bg-amber-400/10 border-amber-400/20 text-amber-400' },
  PAID: { label: 'Оплачен', dot: 'bg-emerald-400', className: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' },
  TICKET_ISSUED: { label: 'Выдан', dot: 'bg-sky-400', className: 'bg-sky-400/10 border-sky-400/20 text-sky-400' },
  FAILED: { label: 'Ошибка', dot: 'bg-red-400', className: 'bg-red-400/10 border-red-400/20 text-red-400' },
  CANCELLED: { label: 'Отменён', dot: 'bg-zinc-500', className: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500' },
  REFUND_REQUESTED: { label: 'Возврат', dot: 'bg-orange-400', className: 'bg-orange-400/10 border-orange-400/20 text-orange-400' },
  REFUNDED: { label: 'Возвращён', dot: 'bg-zinc-400', className: 'bg-zinc-400/10 border-zinc-400/20 text-zinc-400' },
  PARTIALLY_REFUNDED: { label: 'Частич. возврат', dot: 'bg-orange-300', className: 'bg-orange-400/10 border-orange-400/20 text-orange-300' },
  DISPUTED: { label: 'Спор', dot: 'bg-red-400', className: 'bg-red-400/10 border-red-400/20 text-red-400' },
  EXPIRED: { label: 'Истёк', dot: 'bg-zinc-500', className: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500' },
}

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Все' },
  { value: 'PAID', label: 'Оплачен' },
  { value: 'AWAITING_PAYMENT', label: 'К оплате' },
  { value: 'TICKET_ISSUED', label: 'Выдан' },
  { value: 'REFUND_REQUESTED', label: 'Возврат' },
  { value: 'CANCELLED', label: 'Отменён' },
  { value: 'FAILED', label: 'Ошибка' },
]

function fmtAmount(v: number) {
  return v.toLocaleString('ru-KZ') + ' ₸'
}

function fmtShortAmount(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₸`
  if (v >= 1000) return `${Math.round(v / 1000)} тыс. ₸`
  return `${Math.round(v)} ₸`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-KZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function paymentLabel(provider: string | null) {
  if (!provider) return '—'
  if (provider === 'STRIPE') return 'Stripe'
  if (provider === 'KASPI') return 'Kaspi Pay'
  return 'Вручную'
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    dot: 'bg-zinc-400',
    className: 'bg-zinc-400/10 border-zinc-400/20 text-zinc-400',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${cfg.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function exportCSV(orders: Order[]) {
  const headers = ['№ заказа', 'Статус', 'Покупатель', 'Email', 'Телефон', 'Событие', 'Билеты', 'Сумма', 'Дата']
  const rows = orders.map(o => [
    o.orderNumber,
    STATUS_CONFIG[o.status]?.label ?? o.status,
    o.buyerName ?? '',
    o.buyerEmail,
    o.buyerPhone ?? '',
    o.eventTitle ?? '',
    o.ticketSummary,
    o.totalAmount,
    formatDate(o.createdAt),
  ])

  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const canRefund = ['PAID', 'TICKET_ISSUED'].includes(order.status)

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-white/[0.07] p-6" style={{ background: '#111' }}>
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-white/25">Заказ</span>
          <button onClick={onClose} className="text-lg leading-none text-white/30 hover:text-white/60">✕</button>
        </div>

        <div className="font-mono text-2xl font-bold text-white">
          #{order.orderNumber.slice(-8).toUpperCase()}
        </div>

        <div className="mt-2">
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-6 space-y-0">
          {([
            ['Событие', order.eventTitle ?? '—'],
            ['Покупатель', order.buyerName ?? 'Без имени'],
            ['Email', order.buyerEmail],
            ['Телефон', order.buyerPhone ?? '—'],
            ['Билеты', order.ticketSummary || `${order.ticketCount} билет(ов)`],
            ['Сумма', fmtAmount(order.totalAmount)],
            ['Оплата', paymentLabel(order.paymentProvider)],
            ['Создан', formatDate(order.createdAt)],
            ['Оплачен', order.paidAt ? formatDate(order.paidAt) : '—'],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 border-b border-white/[0.05] py-3 text-sm">
              <span className="shrink-0 text-white/35">{k}</span>
              <span className="text-right font-medium text-white/80">{v}</span>
            </div>
          ))}
        </div>

        {canRefund && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="mb-3 text-[10px] uppercase tracking-widest text-white/25">Действия</div>
            <button
              type="button"
              onClick={() => alert('Функция возврата будет доступна после подключения платёжного провайдера')}
              className="w-full rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              Оформить возврат
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [data, setData] = useState<OrdersResponse | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: debouncedSearch,
        status,
        page: String(page),
      })

      const res = await fetch(`/api/dashboard/orders?${params}`)
      const json = await res.json()

      if (!json.error) setData(json)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, page])

  useEffect(() => {
    load()
  }, [load])

  const kpi = useMemo(() => {
    const orders = data?.orders ?? []
    const revenue = orders.reduce((s, o) => s + o.totalAmount, 0)
    const paid = orders.filter(o => ['PAID', 'TICKET_ISSUED'].includes(o.status)).length
    const refunds = orders.filter(o => ['REFUND_REQUESTED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(o.status)).length

    return {
      total: data?.total ?? 0,
      revenue,
      avg: orders.length ? Math.round(revenue / orders.length) : 0,
      paidRate: orders.length ? Math.round((paid / orders.length) * 100) : 0,
      refunds,
    }
  }, [data])

  return (
    <div className="min-h-screen p-6" style={{ background: '#0d0d0d', color: 'white' }}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Заказы</h1>
          <p className="mt-0.5 text-sm text-white/30">
            Управление покупками, оплатами, выдачей билетов и возвратами
          </p>
        </div>

        <button
          type="button"
          onClick={() => data && exportCSV(data.orders)}
          disabled={!data || data.orders.length === 0}
          className="flex items-center gap-2 rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↓ Экспорт CSV
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Всего заказов', value: kpi.total.toLocaleString('ru-KZ'), delta: data?.newToday ? `+${data.newToday} сегодня` : 'Пока без новых', up: true },
          { label: 'Выручка', value: fmtShortAmount(kpi.revenue), delta: 'по текущей выборке', up: true },
          { label: 'Средний чек', value: fmtAmount(kpi.avg), delta: 'расчёт по странице', up: true },
          { label: 'Оплачено', value: `${kpi.paidRate}%`, delta: `${kpi.refunds} возвратов`, up: kpi.refunds === 0 },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-white/[0.06] p-4" style={{ background: '#111' }}>
            <div className="mb-2 text-xs text-white/30">{k.label}</div>
            <div className="text-2xl font-semibold text-white">{k.value}</div>
            <div className={`mt-1 text-xs ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-40 flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/20">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по номеру, email, имени, телефону…"
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white/70 placeholder:text-white/20 focus:border-white/15 focus:outline-none"
          />
        </div>

        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
              status === f.value
                ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                : 'border-white/[0.07] text-white/35 hover:bg-white/[0.04] hover:text-white/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06]" style={{ background: '#111' }}>
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.06]" style={{ background: '#0d0d0d' }}>
            <tr>
              {['ЗАКАЗ', 'СОБЫТИЕ', 'КЛИЕНТ', 'БИЛЕТЫ', 'СУММА', 'ОПЛАТА', 'ДАТА', 'СТАТУС'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-white/20">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.04] last:border-none">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 animate-pulse rounded bg-white/[0.05]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !data || data.orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="mb-2 text-2xl">📋</div>
                  <div className="text-sm font-medium text-white/50">
                    {search || status !== 'ALL' ? 'Заказы не найдены' : 'Заказов пока нет'}
                  </div>
                  <div className="mt-1 text-xs text-white/25">
                    После запуска продаж здесь появятся покупки, оплаты и возвраты.
                  </div>
                </td>
              </tr>
            ) : (
              data.orders.map(order => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className="group cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] last:border-none"
                >
                  <td className="px-4 py-3">
                    <span className="rounded-lg border border-white/[0.08] bg-white/[0.05] px-2 py-0.5 font-mono text-sm font-semibold text-white/80">
                      #{order.orderNumber.slice(-8).toUpperCase()}
                    </span>
                  </td>

                  <td className="max-w-[240px] px-4 py-3">
                    <div className="truncate font-medium text-white/75">
                      {order.eventTitle ?? '—'}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-white/70">{order.buyerName ?? 'Без имени'}</div>
                    <div className="mt-0.5 text-xs text-white/30">{order.buyerEmail}</div>
                  </td>

                  <td className="px-4 py-3 text-white/45">
                    {order.ticketSummary || `${order.ticketCount} билет(ов)`}
                  </td>

                  <td className="px-4 py-3 font-medium text-white/70">
                    {fmtAmount(order.totalAmount)}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-xs text-white/35">
                      {paymentLabel(order.paymentProvider)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-white/30">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3 text-xs text-white/25">
            <span>
              Страница {data.page} из {data.pages}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-white/[0.07] px-2.5 py-1 text-white/30 transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-20"
              >
                ‹
              </button>

              {Array.from({ length: data.pages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                    page === n
                      ? 'border-orange-500/25 bg-orange-500/10 text-orange-400'
                      : 'border-white/[0.07] text-white/30 hover:bg-white/[0.04]'
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="rounded-lg border border-white/[0.07] px-2.5 py-1 text-white/30 transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-20"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && <OrderDrawer order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}