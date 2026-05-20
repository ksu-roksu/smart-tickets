'use client'

import Link from 'next/link'
import { Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from './ThemeWrapper'
import type { AuthContext } from '@/lib/auth/context'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Супер-админ',
  ADMIN: 'Администратор',
  MODERATOR: 'Модератор',
  ORGANIZER: 'Организатор',
  BUYER: 'Покупатель',
  OWNER: 'Владелец',
}

export default function DashboardTopbar({
  ctx,
  onMenuOpen,
}: {
  ctx: AuthContext
  onMenuOpen?: () => void
}) {
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 lg:px-8"
      style={{
        background: 'var(--dash-topbar-bg)',
        borderBottom: '1px solid var(--dash-topbar-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuOpen}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
        style={{ background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)' }}
        aria-label="Открыть меню"
      >
        <Menu size={18} style={{ color: 'var(--dash-nav-text)' }} />
      </button>

      {/* Org name */}
      <div className="flex-1 min-w-0">
        <div className="text-xs" style={{ color: 'var(--dash-muted)' }}>Организация</div>
        <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {ctx.organizationName || 'Smart Tickets'}
        </div>
      </div>

      {/* Role badge */}
      <span className="hidden sm:inline-flex text-xs px-3 py-1 rounded-full"
        style={{
          border: '1px solid var(--dash-card-border)',
          color: 'var(--dash-muted)',
        }}
      >
        {ROLE_LABELS[ctx.role] ?? ctx.role}
      </span>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
        style={{ background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)' }}
        aria-label="Сменить тему"
      >
        {theme === 'dark'
          ? <Sun size={16} style={{ color: 'var(--dash-muted)' }} />
          : <Moon size={16} style={{ color: 'var(--dash-muted)' }} />
        }
      </button>

      {/* To site */}
      <Link
        href="/"
        className="hidden sm:flex items-center h-9 px-4 rounded-xl text-sm transition-colors"
        style={{
          border: '1px solid var(--dash-card-border)',
          color: 'var(--dash-nav-text)',
        }}
      >
        На сайт
      </Link>
    </header>
  )
}