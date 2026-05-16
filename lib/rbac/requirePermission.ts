import { can } from './can'

export function requirePermission(
  ctx: { permissions: string[] },
  permission: string,
) {
  const allowed = can(ctx, permission)

  if (!allowed) {
    throw new Error(`Forbidden: missing permission ${permission}`)
  }
}