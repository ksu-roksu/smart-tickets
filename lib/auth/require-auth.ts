import { redirect } from 'next/navigation'
import { getAuthContext, type AuthContext } from './context'
import { can } from '@/lib/rbac/can'
import type { Permission } from '@/lib/rbac/permissions'

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext()
  if (!ctx) redirect('/sign-in')
  return ctx
}

export async function requirePermission(permission: Permission): Promise<AuthContext> {
  const ctx = await requireAuth()
  if (!can(ctx.role, permission)) redirect('/dashboard?error=forbidden')
  return ctx
}