// app/invite/[token]/InviteAcceptClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Владелец',
  ADMIN: 'Администратор',
  EVENT_MANAGER: 'Event manager',
  FINANCE: 'Финансы',
  SCANNER: 'Сканер',
  VIEWER: 'Наблюдатель',
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  OWNER: 'Полный доступ к организации, команде, финансам и настройкам.',
  ADMIN: 'Управляет событиями, билетами, площадками и операционными процессами.',
  EVENT_MANAGER: 'Создаёт и редактирует события, билеты, промокоды и площадки.',
  FINANCE: 'Видит заказы, отчёты, выплаты и финансовые данные.',
  SCANNER: 'Имеет доступ только к check-in и сканированию билетов.',
  VIEWER: 'Может смотреть данные без права редактирования.',
}

type InviteState = 'valid' | 'invalid' | 'expired' | 'already_used'

interface Props {
  state: InviteState
  orgName: string | null
  role: string | null
  token: string
  isAuthenticated?: boolean
  invitedEmail?: string
}

export default function InviteAcceptClient({
  state,
  orgName,
  role,
  token,
  isAuthenticated,
  invitedEmail,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(false)

  async function acceptInvite() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Не удалось принять приглашение.')
        return
      }

      setAccepted(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch {
      setError('Ошибка запроса. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  // Успешно принято
  if (accepted) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
            ✓
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Добро пожаловать в {orgName}!
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
            Переходим в панель управления...
          </p>
        </div>
      </PageLayout>
    )
  }

  // Невалидная ссылка
  if (state === 'invalid') {
    return (
      <PageLayout>
        <StateCard
          icon="✕"
          iconColor="red"
          title="Ссылка недействительна"
          description="Эта ссылка-приглашение не существует или была отозвана. Попросите организатора отправить новое приглашение."
        />
      </PageLayout>
    )
  }

  // Истекла
  if (state === 'expired') {
    return (
      <PageLayout>
        <StateCard
          icon="⏱"
          iconColor="amber"
          title="Ссылка истекла"
          description={`Приглашение в организацию ${orgName} истекло. Ссылки действуют 7 дней. Попросите организатора отправить новое приглашение.`}
        />
      </PageLayout>
    )
  }

  // Уже использована
  if (state === 'already_used') {
    return (
      <PageLayout>
        <StateCard
          icon="✓"
          iconColor="teal"
          title="Приглашение уже принято"
          description={`Вы уже являетесь участником организации ${orgName}.`}
          action={{ label: 'Перейти в панель управления', onClick: () => router.push('/dashboard') }}
        />
      </PageLayout>
    )
  }

  // Валидное приглашение
  return (
    <PageLayout>
      <div className="w-full max-w-md">
        {/* Хедер */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-background-secondary)] text-3xl">
            🎟
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Приглашение в команду
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
            Вас приглашают присоединиться к организации
          </p>
        </div>

        {/* Карточка организации */}
        <div className="mb-4 rounded-3xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-6">
          <div className="mb-4 border-b border-[var(--color-border-tertiary)] pb-4">
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Организация
            </div>
            <div className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]">
              {orgName}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Ваша роль
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                {ROLE_LABELS[role ?? ''] ?? role}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
              {ROLE_DESCRIPTIONS[role ?? ''] ?? ''}
            </p>
          </div>
        </div>

        {/* Email подсказка */}
        {invitedEmail && (
          <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Это приглашение предназначено для{' '}
            <span className="font-medium">{invitedEmail}</span>.{' '}
            {isAuthenticated
              ? 'Убедитесь что вы вошли с правильным аккаунтом.'
              : 'Войдите с этим email чтобы принять приглашение.'}
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Кнопки */}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={acceptInvite}
            disabled={loading}
            className="w-full rounded-2xl bg-[var(--color-text-primary)] py-3 text-sm font-medium text-[var(--color-background-primary)] transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Принимаем приглашение...' : 'Принять приглашение'}
          </button>
        ) : (
          <div className="space-y-3">
            <a
              href={`/sign-in?redirect_url=/invite/${token}`}
              className="flex w-full items-center justify-center rounded-2xl bg-[var(--color-text-primary)] py-3 text-sm font-medium text-[var(--color-background-primary)] transition hover:opacity-90"
            >
              Войти и принять приглашение
            </a>
            <a
              href={`/sign-up?redirect_url=/invite/${token}`}
              className="flex w-full items-center justify-center rounded-2xl border border-[var(--color-border-secondary)] py-3 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
            >
              Создать аккаунт
            </a>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background-tertiary)] px-4 py-16">
      {children}
    </div>
  )
}

function StateCard({
  icon,
  iconColor,
  title,
  description,
  action,
}: {
  icon: string
  iconColor: 'red' | 'amber' | 'teal'
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  const colorMap = {
    red: 'bg-red-500/10 text-red-300',
    amber: 'bg-amber-500/10 text-amber-300',
    teal: 'bg-emerald-500/10 text-emerald-400',
  }

  return (
    <div className="w-full max-w-md text-center">
      <div
        className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full text-3xl ${colorMap[iconColor]}`}
      >
        {icon}
      </div>
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-tertiary)]">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 rounded-2xl bg-[var(--color-text-primary)] px-6 py-3 text-sm font-medium text-[var(--color-background-primary)] transition hover:opacity-90"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}