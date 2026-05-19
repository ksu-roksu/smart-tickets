import { requireAuth } from '@/lib/auth/require-auth'
import DashboardShell from '@/components/dashboard/DashboardShell'
import ThemeWrapper from '@/components/dashboard/ThemeWrapper'

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await requireAuth()
  return (
    <ThemeWrapper>
      <DashboardShell ctx={ctx}>{children}</DashboardShell>
    </ThemeWrapper>
  )
}