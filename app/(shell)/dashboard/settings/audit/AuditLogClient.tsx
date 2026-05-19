'use client'

import { useMemo, useState } from 'react'

type AuditEntry = {
  id: string
  action: string
  entityType: string
  entityId: string
  actorName: string
  actorEmail: string
  actorRole: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
}

const ACTION_LABELS: Record<string, string> = {
  'team.invite_created': 'Приглашение отправлено',
  'team.invite_resent': 'Приглашение переотправлено',
  'team.invite_accepted': 'Приглашение принято',
  'team.invite_revoked': 'Приглашение отозвано',
  'team.role_updated': 'Роль изменена',
  'team.access_removed': 'Доступ удалён',
  'team.access_restored': 'Доступ восстановлен',
  'event.submit_for_review': 'Событие отправлено на модерацию',
  'event.published': 'Событие опубликовано',
  'event.cancelled': 'Событие отменено',
  'debug.manual': 'Отладочная запись',
}

const ACTION_STYLE: Record<string, { cls: string; dot: string; icon: string }> = {
  'team.invite_created': {
    cls: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
    dot: 'bg-blue-400',
    icon: '✉',
  },
  'team.invite_resent': {
    cls: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
    dot: 'bg-blue-400',
    icon: '↺',
  },
  'team.invite_accepted': {
    cls: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400',
    dot: 'bg-emerald-400',
    icon: '✓',
  },
  'team.invite_revoked': {
    cls: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    dot: 'bg-amber-400',
    icon: '✕',
  },
  'team.role_updated': {
    cls: 'border-purple-400/20 bg-purple-400/10 text-purple-300',
    dot: 'bg-purple-400',
    icon: '⟳',
  },
  'team.access_removed': {
    cls: 'border-red-400/20 bg-red-400/10 text-red-300',
    dot: 'bg-red-400',
    icon: '✕',
  },
  'team.access_restored': {
    cls: 'border-orange-500/25 bg-orange-500/10 text-orange-400',
    dot: 'bg-orange-400',
    icon: '↻',
  },
  'event.submit_for_review': {
    cls: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    dot: 'bg-amber-400',
    icon: '→',
  },
  'event.published': {
    cls: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400',
    dot: 'bg-emerald-400',
    icon: '●',
  },
  'event.cancelled': {
    cls: 'border-red-400/20 bg-red-400/10 text-red-300',
    dot: 'bg-red-400',
    icon: '◉',
  },
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

function formatAction(action: string) {
  return ACTION_LABELS[action] ?? action.replace(/\./g, ' › ')
}

function getActionStyle(action: string) {
  return (
    ACTION_STYLE[action] ?? {
      cls: 'border-white/[0.08] bg-white/[0.04] text-white/45',
      dot: 'bg-white/30',
      icon: '·',
    }
  )
}

function getDiffText(entry: AuditEntry): string | null {
  if (!entry.before || !entry.after) return null

  const parts: string[] = []
  const keys = new Set([...Object.keys(entry.before), ...Object.keys(entry.after)])

  for (const key of keys) {
    const beforeValue = entry.before[key]
    const afterValue = entry.after[key]

    if (beforeValue !== afterValue && key !== 'userEmail') {
      parts.push(`${key}: ${beforeValue ?? '—'} → ${afterValue ?? '—'}`)
    }
  }

  return parts.length ? parts.join(' · ') : null
}

export default function AuditLogClient({
  logs,
  isPlatformUser,
}: {
  logs: AuditEntry[]
  isPlatformUser: boolean
}) {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action))).sort()
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase().trim()

      const memberEmail = String(log.metadata?.memberEmail ?? '').toLowerCase()
      const memberName = String(log.metadata?.memberName ?? '').toLowerCase()

      const matchSearch =
        !q ||
        log.actorName.toLowerCase().includes(q) ||
        log.actorEmail.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        formatAction(log.action).toLowerCase().includes(q) ||
        memberEmail.includes(q) ||
        memberName.includes(q)

      const matchAction = actionFilter === 'ALL' || log.action === actionFilter

      return matchSearch && matchAction
    })
  }, [logs, search, actionFilter])

  const stats = useMemo(() => {
    const roleUpdates = logs.filter((l) => l.action === 'team.role_updated').length
    const accessChanges = logs.filter((l) =>
      ['team.access_removed', 'team.access_restored', 'team.invite_revoked'].includes(l.action),
    ).length
    const invites = logs.filter((l) => l.action.includes('invite')).length

    return {
      total: logs.length,
      filtered: filtered.length,
      roleUpdates,
      accessChanges,
      invites,
    }
  }, [logs, filtered.length])

  return (
    <div className="min-h-screen p-6" style={{ background: '#0d0d0d', color: 'white' }}>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Журнал действий</h1>
        <p className="mt-0.5 text-sm text-white/30">
          История всех действий в организации
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Всего записей" value={stats.total} delta={`${stats.filtered} в выборке`} />
        <MetricCard label="Роли изменены" value={stats.roleUpdates} delta="изменения доступов" />
        <MetricCard label="Приглашения" value={stats.invites} delta="созданы / отозваны" />
        <MetricCard label="Доступы" value={stats.accessChanges} delta="удалены / восстановлены" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-40 flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/20">
            🔍
          </span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, email, действию…"
            className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#111] py-2 pl-9 pr-4 text-sm text-white/70 placeholder:text-white/25 outline-none transition-all hover:border-white/[0.12] focus:border-orange-500/30 focus:bg-orange-500/[0.04]"
          />
        </div>

        <div className="relative">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-11 min-w-[240px] appearance-none rounded-xl border border-white/[0.07] bg-[#111] px-4 pr-10 text-sm font-medium text-white/65 outline-none transition-all hover:border-white/[0.12] focus:border-orange-500/30 focus:bg-orange-500/[0.04]"
          >
            <option value="ALL">Все действия</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {formatAction(action)}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
            ▾
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06]" style={{ background: '#111' }}>
  {filtered.length === 0 ? (
    <div className="px-4 py-16 text-center">
      <div className="mb-2 text-2xl">🧾</div>
      <div className="text-sm font-medium text-white/50">Записи не найдены</div>
      <div className="mt-1 text-xs text-white/25">Попробуйте изменить поиск или фильтр.</div>
    </div>
  ) : (
    <div className="divide-y divide-white/[0.04]">
      {filtered.map((log) => {
        const isOpen = expanded === log.id
        const style = getActionStyle(log.action)
        const diff = getDiffText(log)
        const target = String(
          log.metadata?.memberName ??
          log.metadata?.memberEmail ??
          log.metadata?.eventTitle ??
          ''
        )

        return (
          <div key={log.id}>
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : log.id)}
              className="w-full px-4 py-4 text-left transition-colors hover:bg-white/[0.03]"
            >
              <div className="flex items-start gap-4">
                <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs ${style.cls}`}>
                  {style.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${style.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {formatAction(log.action)}
                    </span>

                    {target && (
                      <span className="text-sm text-white/55">→ {target}</span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/30">
                    <span className="font-medium text-white/65">{log.actorName}</span>
                    <span>{log.actorEmail || '—'}</span>
                    {diff && <span className="text-white/35">{diff}</span>}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="whitespace-nowrap text-xs text-white/40">
                    {formatDate(log.createdAt)}
                  </div>
                  <div className="mt-1 text-xs text-white/20">
                    {isOpen ? '▲' : '▼'}
                  </div>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-white/[0.04] bg-white/[0.025] px-4 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {log.before && <JsonBlock title="До изменения" data={log.before} />}
                  {log.after && <JsonBlock title="После изменения" data={log.after} />}

                  {log.metadata && (
                    <div className="md:col-span-2">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/25">
                        Метаданные
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-lg border border-white/[0.06] bg-[#111] px-3 py-1 text-xs text-white/45"
                          >
                            <span className="text-white/25">{key}:</span> {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.ipAddress && (
                    <div className="text-xs text-white/30">IP: {log.ipAddress}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )}
</div>

<div className="mt-4 text-center text-xs text-white/25">
  Показано {filtered.length} из {logs.length} записей
</div>

      <div className="mt-4 text-center text-xs text-white/25">
        Показано {filtered.length} из {logs.length} записей
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  delta,
}: {
  label: string
  value: number
  delta: string
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: '#111' }}>
      <div className="mb-2 text-xs text-white/30">{label}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-emerald-400">{delta}</div>
    </div>
  )
}

function JsonBlock({
  title,
  data,
}: {
  title: string
  data: Record<string, unknown>
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/25">
        {title}
      </div>

      <pre className="max-h-72 overflow-auto rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3 text-xs leading-5 text-white/45">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}