'use client'

import { useMemo, useState } from 'react'

type TeamMember = {
  id: string
  name: string
  email: string
  role: string
  status: string
  organization: string
  joinedAt: string
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Владелец',
  ADMIN: 'Администратор',
  EVENT_MANAGER: 'Менеджер событий',
  FINANCE: 'Финансы',
  SCANNER: 'Сканер',
  VIEWER: 'Наблюдатель',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активен',
  INVITED: 'Приглашён',
  SUSPENDED: 'Ограничен',
  REMOVED: 'Удалён',
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  OWNER: 'Полный доступ к организации, команде, финансам и настройкам.',
  ADMIN: 'Управляет событиями, билетами, площадками и операционными процессами.',
  EVENT_MANAGER: 'Создаёт и редактирует события, билеты, промокоды и площадки.',
  FINANCE: 'Видит заказы, отчёты, выплаты и финансовые данные.',
  SCANNER: 'Доступ только к check-in и сканированию билетов.',
  VIEWER: 'Может смотреть данные без права редактирования.',
}

export default function TeamClient({
  members,
  canManageTeam,
  isPlatformUser,
}: {
  members: TeamMember[]
  canManageTeam: boolean
  isPlatformUser: boolean
}) {
  const [items, setItems] = useState(members)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'ALL' | string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmMember, setConfirmMember] = useState<TeamMember | null>(null)
  const [restoreMemberData, setRestoreMemberData] = useState<TeamMember | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return items.filter((member) => {
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.organization.toLowerCase().includes(q)

      const matchRole = role === 'ALL' || member.role === role
      return matchSearch && matchRole
    })
  }, [items, search, role])

  const activeCount = items.filter((m) => m.status === 'ACTIVE').length
  const invitedCount = items.filter((m) => m.status === 'INVITED').length
  const removedCount = items.filter((m) => m.status === 'REMOVED').length
  const uniqueOrgs = new Set(items.map((m) => m.organization)).size

  function addMember(member: TeamMember) {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === member.id)
      if (exists) return prev.map((item) => (item.id === member.id ? member : item))
      return [member, ...prev]
    })
  }

  async function changeRole(memberId: string, nextRole: string) {
    try {
      const res = await fetch('/api/dashboard/team/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: nextRole }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error ?? 'Не удалось изменить роль')
        return
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === memberId
            ? { ...item, role: data.member.role, status: data.member.status }
            : item,
        ),
      )
    } catch (error) {
      console.error(error)
      alert('Ошибка изменения роли')
    }
  }

  async function removeMember() {
    if (!confirmMember) return

    setRemovingId(confirmMember.id)

    try {
      const res = await fetch('/api/dashboard/team/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: confirmMember.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error ?? 'Не удалось удалить доступ')
        return
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === confirmMember.id ? { ...item, status: 'REMOVED' } : item,
        ),
      )

      setConfirmMember(null)
    } finally {
      setRemovingId(null)
    }
  }

  async function restoreMember(memberId: string, role: string) {
    const res = await fetch('/api/dashboard/team/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, role }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error ?? 'Не удалось восстановить доступ')
      return
    }

    setItems((prev) => prev.map((item) => (item.id === memberId ? data.member : item)))
    setRestoreMemberData(null)
  }

  return (
    <div className="min-h-screen p-6" >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Команда и доступы</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-tertiary)]">
            Управление ролями, участниками и безопасностью организации
          </p>
        </div>

        {canManageTeam && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 transition-colors hover:bg-orange-500/20"
          >
            + Пригласить
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Участников" value={items.length} delta={`${filtered.length} в выборке`} />
        <MetricCard label="Активных" value={activeCount} delta="с доступом сейчас" />
        <MetricCard label="Приглашений" value={invitedCount} delta="ожидают входа" />
        <MetricCard
          label={isPlatformUser ? 'Организаций' : 'Удалённых'}
          value={isPlatformUser ? uniqueOrgs : removedCount}
          delta={isPlatformUser ? 'в области видимости' : 'можно восстановить'}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
  <div className="relative min-w-40 flex-1">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">
      🔍
    </span>

    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Поиск по имени, email или организации…"
      className="h-11 w-full rounded-xl border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] py-2 pl-9 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none transition-all hover:border-[var(--dash-card-border)] focus:border-orange-500/30 focus:bg-orange-500/[0.04]"
    />
  </div>

  <div className="relative">
    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="h-11 min-w-[180px] appearance-none rounded-xl border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] px-4 pr-10 text-sm font-medium text-[var(--color-text-secondary)] outline-none transition-all hover:border-[var(--dash-card-border)] focus:border-orange-500/30 focus:bg-orange-500/[0.04]"
    >
      <option value="ALL">Все роли</option>
      <option value="OWNER">Владелец</option>
      <option value="ADMIN">Администратор</option>
      <option value="EVENT_MANAGER">Менеджер событий</option>
      <option value="FINANCE">Финансы</option>
      <option value="SCANNER">Сканер</option>
      <option value="VIEWER">Наблюдатель</option>
    </select>

    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-tertiary)]">
      ▾
    </span>
  </div>
</div>

      <div className="overflow-hidden rounded-2xl border border-[var(--dash-card-border)]" >
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--dash-card-border)]" >
            <tr>
              {['УЧАСТНИК', 'РОЛЬ', isPlatformUser ? 'ОРГАНИЗАЦИЯ' : 'ДАТА', 'СТАТУС', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="mb-2 text-2xl">👥</div>
                  <div className="text-sm font-medium text-[var(--color-text-secondary)]">Участники не найдены</div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Попробуйте изменить поиск или фильтр.
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((member) => (
                <tr
                  key={member.id}
                  className="group border-b border-[var(--dash-card-border)] transition-colors hover:bg-[var(--color-background-secondary)] last:border-none"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} email={member.email} />
                      <div>
                        <div className="font-medium text-[var(--color-text-primary)]">{member.name}</div>
                        <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{member.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
  {canManageTeam && member.role !== 'OWNER' && member.status !== 'REMOVED' ? (
    <div className="relative inline-block">
      <select
        value={member.role}
        onChange={(e) => changeRole(member.id, e.target.value)}
        className="min-w-[190px] appearance-none rounded-xl border border-[var(--dash-card-border)] bg-[var(--color-background-secondary)] px-3 py-2 pr-9 text-xs font-semibold text-[var(--color-text-primary)] outline-none transition-all hover:border-[var(--dash-card-border)] focus:border-orange-500/30 focus:bg-orange-500/[0.06]"
      >
        <option value="ADMIN">Администратор</option>
        <option value="EVENT_MANAGER">Менеджер событий</option>
        <option value="FINANCE">Финансы</option>
        <option value="SCANNER">Сканер</option>
        <option value="VIEWER">Наблюдатель</option>
      </select>

      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-tertiary)]">
        ▾
      </span>
    </div>
  ) : (
    <RoleBadge role={member.role} />
  )}

  <div className="mt-1 max-w-md text-xs text-[var(--color-text-tertiary)]">
    {ROLE_DESCRIPTIONS[member.role] ?? 'Пользовательская роль'}
  </div>
</td>

                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {isPlatformUser ? member.organization : member.joinedAt}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={member.status} />
                  </td>

                  <td className="px-4 py-3 text-right">
                    {canManageTeam && member.role !== 'OWNER' && (
                      member.status === 'REMOVED' ? (
                        <button
                          type="button"
                          onClick={() => setRestoreMemberData(member)}
                          className="rounded-xl border border-orange-500/25 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 transition-colors hover:bg-orange-500/20"
                        >
                          Восстановить
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmMember(member)}
                          className="opacity-0 rounded-lg border border-[var(--dash-card-border)] px-3 py-1 text-xs text-[var(--color-text-tertiary)] transition-all hover:border-red-400/30 hover:bg-red-50 dark:bg-red-400/10 hover:text-red-300 group-hover:opacity-100"
                        >
                          {member.status === 'INVITED' ? 'Отозвать' : 'Удалить'}
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <InviteModal
          onClose={() => setIsModalOpen(false)}
          onCreated={addMember}
          onRestoreNeeded={(memberId) => {
            const member = items.find((m) => m.id === memberId)
            if (member) setRestoreMemberData(member)
            setIsModalOpen(false)
          }}
        />
      )}

      {confirmMember && (
        <ConfirmRemoveModal
          member={confirmMember}
          loading={removingId === confirmMember.id}
          onClose={() => setConfirmMember(null)}
          onConfirm={removeMember}
        />
      )}

      {restoreMemberData && (
        <RestoreMemberModal
          member={restoreMemberData}
          onClose={() => setRestoreMemberData(null)}
          onConfirm={restoreMember}
        />
      )}
    </div>
  )
}

function MetricCard({ label, value, delta }: { label: string; value: number; delta: string }) {
  return (
    <div className="rounded-2xl border border-[var(--dash-card-border)] p-4" >
      <div className="mb-2 text-xs text-[var(--color-text-tertiary)]">{label}</div>
      <div className="text-2xl font-semibold text-[var(--color-text-primary)]">{value}</div>
      <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{delta}</div>
    </div>
  )
}

function Avatar({ name, email }: { name: string; email: string }) {
  const initials = name
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || email[0]?.toUpperCase()

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 text-xs font-semibold text-orange-600 dark:text-orange-400">
      {initials}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex rounded-lg border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-300">
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; dot: string; cls: string }> = {
    ACTIVE: { label: 'Активен', dot: 'bg-emerald-400', cls: 'border-emerald-200 dark:border-emerald-400/20 bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400' },
    INVITED: { label: 'Приглашён', dot: 'bg-amber-400', cls: 'border-amber-200 dark:border-amber-400/20 bg-amber-50 dark:bg-amber-400/10 text-amber-300' },
    SUSPENDED: { label: 'Ограничен', dot: 'bg-zinc-400', cls: 'border-zinc-400/20 bg-zinc-400/10 text-zinc-400' },
    REMOVED: { label: 'Удалён', dot: 'bg-zinc-500', cls: 'border-zinc-500/20 bg-zinc-500/10 text-zinc-500' },
  }

  const s = config[status] ?? config.SUSPENDED

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function InviteModal({
  onClose,
  onCreated,
  onRestoreNeeded,
}: {
  onClose: () => void
  onCreated: (member: TeamMember) => void
  onRestoreNeeded: (memberId: string) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('VIEWER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [resent, setResent] = useState(false)
  const [removedMemberId, setRemovedMemberId] = useState<string | null>(null)

  async function submit() {
    setError('')
    setInviteLink('')
    setResent(false)
    setCopied(false)
    setRemovedMemberId(null)
    setLoading(true)

    try {
      const res = await fetch('/api/dashboard/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      })

      const text = await res.text()
      let data: any = {}

      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        setError(`API вернул не JSON. Статус: ${res.status}`)
        return
      }

      if (!res.ok) {
        if (data.code === 'member_removed') {
          setRemovedMemberId(data.memberId)
        }
        setError(data.error ?? `Ошибка API: ${res.status}`)
        return
      }

      setInviteLink(data.inviteLink ?? '')
      setResent(data.resent === true)
      onCreated(data.member)
    } catch (err) {
      console.error('Invite error:', err)
      setError('Ошибка запроса. Проверьте terminal/server log.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Пригласить участника</h2>
            <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
              Добавьте пользователя в организацию и назначьте роль.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--dash-card-border)] bg-[var(--color-background-secondary)] px-3 py-1 text-sm text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            className="w-full rounded-xl border border-[var(--dash-card-border)] bg-[var(--color-background-secondary)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--dash-card-border)] focus:outline-none"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-xl border border-[var(--dash-card-border)] bg-[var(--color-background-secondary)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--dash-card-border)] focus:outline-none"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--dash-card-border)] focus:outline-none"
          >
            <option value="ADMIN">Администратор</option>
            <option value="EVENT_MANAGER">Менеджер событий</option>
            <option value="FINANCE">Финансы</option>
            <option value="SCANNER">Сканер</option>
            <option value="VIEWER">Наблюдатель</option>
          </select>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 dark:border-red-400/20 bg-red-50 dark:bg-red-400/10 px-4 py-3 text-sm text-red-300">
            <div>{error}</div>

            {removedMemberId && (
              <button
                type="button"
                onClick={() => onRestoreNeeded(removedMemberId)}
                className="mt-2 text-xs font-medium text-orange-600 dark:text-orange-400 underline hover:no-underline"
              >
                Восстановить доступ →
              </button>
            )}
          </div>
        )}

        {inviteLink && (
          <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-400/20 bg-emerald-50 dark:bg-emerald-400/10 px-4 py-3">
            <div className="text-sm font-medium text-emerald-300">
              {resent ? 'Новая ссылка создана — предыдущая деактивирована' : 'Приглашение создано'}
            </div>

            {resent && (
              <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Этот пользователь уже был приглашён
              </div>
            )}

            <div className="mt-2 break-all text-xs text-[var(--color-text-tertiary)]">
              {inviteLink}
            </div>

            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(inviteLink)
                setCopied(true)
                setTimeout(() => setCopied(false), 1800)
              }}
              className={[
                'mt-3 rounded-xl border px-3 py-1.5 text-xs font-medium transition',
                copied
                  ? 'border-emerald-400/30 bg-emerald-400/20 text-emerald-200'
                  : 'border-emerald-200 dark:border-emerald-400/20 text-emerald-300 hover:bg-emerald-50 dark:bg-emerald-400/10',
              ].join(' ')}
            >
              {copied ? 'Скопировано' : 'Скопировать ссылку'}
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--dash-card-border)] bg-[var(--color-background-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
          >
            Закрыть
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-2.5 text-sm font-semibold text-orange-600 dark:text-orange-400 transition-colors hover:bg-orange-500/20 disabled:opacity-50"
          >
            {loading ? 'Создаём...' : inviteLink ? 'Создать новую ссылку' : 'Отправить приглашение'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmRemoveModal({
  member,
  loading,
  onClose,
  onConfirm,
}: {
  member: TeamMember
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const isInvite = member.status === 'INVITED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-red-200 dark:border-red-400/20 bg-[var(--dash-card-bg)] p-6 shadow-2xl">
        <div className="mb-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-red-200 dark:border-red-400/20 bg-red-50 dark:bg-red-400/10 text-red-300">
            !
          </div>

          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {isInvite ? 'Отозвать приглашение?' : 'Удалить доступ?'}
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-tertiary)]">
            {isInvite
              ? `Приглашение для ${member.name} будет отозвано.`
              : `Доступ для ${member.name} будет удалён.`}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--dash-card-border)] bg-[var(--color-background-secondary)] px-4 py-3">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{member.name}</div>
          <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
            {member.email} · {ROLE_LABELS[member.role] ?? member.role}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-[var(--dash-card-border)] bg-[var(--color-background-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl border border-red-400/25 bg-red-50 dark:bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/20 disabled:opacity-50"
          >
            {loading ? 'Удаляем...' : isInvite ? 'Отозвать' : 'Удалить доступ'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RestoreMemberModal({
  member,
  onClose,
  onConfirm,
}: {
  member: TeamMember
  onClose: () => void
  onConfirm: (memberId: string, role: string) => void
}) {
  const [role, setRole] = useState(
    member.role === 'OWNER' || member.role === 'REMOVED' ? 'VIEWER' : member.role,
  )
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    await onConfirm(member.id, role)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-orange-500/20 bg-[var(--dash-card-bg)] p-6 shadow-2xl">
        <div className="mb-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/25 bg-orange-500/10 text-orange-600 dark:text-orange-400">
            ↻
          </div>

          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Восстановить доступ?</h2>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-tertiary)]">
            Пользователь снова получит доступ к организации. Перед восстановлением выберите актуальную роль.
          </p>
        </div>

        <div className="mb-4 rounded-xl border border-[var(--dash-card-border)] bg-[var(--color-background-secondary)] px-4 py-3">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{member.name}</div>
          <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{member.email}</div>
        </div>

        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Роль после восстановления
        </label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-xl border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--dash-card-border)] focus:outline-none"
        >
          <option value="ADMIN">Администратор</option>
          <option value="EVENT_MANAGER">Event manager</option>
          <option value="FINANCE">Финансы</option>
          <option value="SCANNER">Сканер</option>
          <option value="VIEWER">Наблюдатель</option>
        </select>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-[var(--dash-card-border)] bg-[var(--color-background-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-2.5 text-sm font-semibold text-orange-600 dark:text-orange-400 transition-colors hover:bg-orange-500/20 disabled:opacity-50"
          >
            {loading ? 'Восстанавливаем...' : 'Восстановить'}
          </button>
        </div>
      </div>
    </div>
  )
}