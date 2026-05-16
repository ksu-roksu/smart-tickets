'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, SECTION_LABELS } from '@/lib/dashboard/navigation'
import { can } from '@/lib/rbac/can'
import type { AuthContext } from '@/lib/auth/context'

export default function DashboardSidebar({ ctx }: { ctx: AuthContext }) {
  const pathname = usePathname()

  const items = NAV_ITEMS.filter((item) => {
    if (item.platformOnly && !ctx.isPlatformUser) return false
    if (!item.permission) return true
    return can(ctx.role, item.permission)
  })

  // Группируем по секциям
  const sections = Object.keys(SECTION_LABELS) as Array<keyof typeof SECTION_LABELS>

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 py-5 lg:block">
      {/* Логотип + организация */}
      <div className="mb-6 px-3">
        <div className="text-xs text-[var(--color-text-tertiary)]">Smart Tickets</div>
        <div className="mt-0.5 text-base font-semibold text-[var(--color-text-primary)]">
          {ctx.organizationName || 'Кабинет'}
        </div>
      </div>

      {/* Индикатор пользователя */}
      <div className="mb-6 px-3">
        <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-background-secondary)] px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="truncate text-xs text-[var(--color-text-secondary)]">
            {ctx.name || ctx.email}
          </span>
        </div>
      </div>

      {/* Навигация по секциям */}
      <nav className="space-y-5">
        {sections.map((section) => {
          const sectionItems = items.filter((i) => i.section === section)
          if (sectionItems.length === 0) return null

          return (
            <div key={section}>
              <div className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-tertiary)]">
                {SECTION_LABELS[section]}
              </div>
              <div className="space-y-0.5">
                {sectionItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        'flex items-center justify-between rounded-xl px-3 py-2 text-sm transition',
                        active
                          ? 'bg-[var(--color-background-secondary)] font-medium text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)] hover:text-[var(--color-text-primary)]',
                      ].join(' ')}
                    >
                      <span>{item.labelRu}</span>
                      {/* Badge placeholder — подключим реальные данные позже */}
                      {item.badge && (
                        <span className="rounded-full bg-[var(--color-background-tertiary)] px-2 py-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                          –
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}