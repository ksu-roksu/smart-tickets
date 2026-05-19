import { can } from './can'
import type { Permission } from './permissions'
import type { AuthContext } from '@/lib/auth/context'

export function requirePermission(ctx: AuthContext, permission: Permission) {
  const allowed = can(ctx.role, permission)

  if (!allowed) {
    throw new Error(`Forbidden: missing permission ${permission}`)
  }

  return true
}