'use client'

import { useState } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: 'var(--dash-bg)' }}>
      <div className="flex min-h-screen">

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <DashboardSidebar ctx={ctx} />
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <DashboardSidebar ctx={ctx} onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <DashboardTopbar ctx={ctx} onMenuOpen={() => setSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>

      </div>
    </div>
  )
}