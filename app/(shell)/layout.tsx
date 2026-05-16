import { requireAuth } from '@/lib/auth/require-auth'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await requireAuth()
  return <DashboardShell ctx={ctx}>{children}</DashboardShell>
}