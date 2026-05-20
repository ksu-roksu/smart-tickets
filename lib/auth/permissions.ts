import { can } from '@/lib/auth/permissions'

if (!can(ctx.role as OrgRole, 'events.publish')) {
  return NextResponse.json({ error: 'Недостаточно прав.' }, { status: 403 })
}

type OrgRole = 'OWNER' | 'ADMIN' | 'EVENT_MANAGER' | 'FINANCE' | 'SCANNER' | 'VIEWER'

const ROLE_PERMISSIONS: Record<OrgRole, string[]> = {
  OWNER:         ['*'],  // всё
  ADMIN:         ['events.*', 'orders.*', 'team.*', 'finance.view', 'analytics.view', 'settings.*'],
  EVENT_MANAGER: ['events.*', 'orders.view', 'analytics.view'],
  FINANCE:       ['finance.*', 'orders.view', 'analytics.view'],
  SCANNER:       ['check_in.*'],
  VIEWER:        ['events.view', 'orders.view', 'analytics.view'],
}

export function can(role: OrgRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? []
  if (perms.includes('*')) return true

  const [resource, action] = permission.split('.')
  return (
    perms.includes(permission) ||
    perms.includes(`${resource}.*`)
  )
}