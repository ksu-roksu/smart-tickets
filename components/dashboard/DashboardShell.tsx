import DashboardSidebar from './DashboardSidebar'
import DashboardTopbar from './DashboardTopbar'
import type { AuthContext } from '@/lib/auth/context'

export default function DashboardShell({
  children,
  ctx,
}: {
  children: React.ReactNode
  ctx: AuthContext
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-screen">
        <DashboardSidebar ctx={ctx} />

        <div className="min-w-0 flex-1">
          <DashboardTopbar ctx={ctx} />

          <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}