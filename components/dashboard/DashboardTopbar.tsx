import Link from 'next/link'
import ThemeToggle from '@/app/components/ThemeToggle'
import type { AuthContext } from '@/lib/auth/context'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Супер-админ',
  ADMIN: 'Администратор',
  MODERATOR: 'Модератор',
  ORGANIZER: 'Организатор',
  BUYER: 'Покупатель',
  OWNER: 'Владелец',
}

export default function DashboardTopbar({ ctx }: { ctx: AuthContext }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border-tertiary)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[var(--color-text-tertiary)]">Организация</div>
          <div className="text-sm font-semibold text-[var(--color-text-primary)]">
            {ctx.organizationName || 'Smart Tickets'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[var(--color-border-secondary)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
            {ROLE_LABELS[ctx.role] ?? ctx.role}
          </span>
          <Link
            href="/"
            className="rounded-full border border-[var(--color-border-secondary)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            На сайт <ThemeToggle />
          </Link>
        </div>
      </div>
    </header>
  )
}