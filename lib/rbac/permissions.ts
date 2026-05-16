export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER' | 'BUYER'

export type Permission =
  | 'events:create'
  | 'events:edit_own'
  | 'events:edit_any'
  | 'events:delete_own'
  | 'events:delete_any'
  | 'events:publish'
  | 'events:moderate'
  | 'tickets:view_own'
  | 'tickets:view_any'
  | 'tickets:refund'
  | 'orders:view_own'
  | 'orders:view_any'
  | 'analytics:view_own'
  | 'analytics:view_all'
  | 'users:manage'
  | 'payouts:view_own'
  | 'payouts:manage'
  | 'audit:view'
  | 'checkin:manage'
  | 'promocodes:manage'
  | 'venues:manage'
  | 'support:view'
  | 'support:manage'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'events:create', 'events:edit_own', 'events:edit_any',
    'events:delete_own', 'events:delete_any', 'events:publish', 'events:moderate',
    'tickets:view_own', 'tickets:view_any', 'tickets:refund',
    'orders:view_own', 'orders:view_any',
    'analytics:view_own', 'analytics:view_all',
    'users:manage',
    'payouts:view_own', 'payouts:manage',
    'audit:view',
    'checkin:manage',
    'promocodes:manage',
    'venues:manage',
    'support:view', 'support:manage',
  ],
  ADMIN: [
    'events:edit_any', 'events:delete_any', 'events:publish', 'events:moderate',
    'tickets:view_any', 'tickets:refund',
    'orders:view_any',
    'analytics:view_all',
    'payouts:manage',
    'audit:view',
    'checkin:manage',
    'support:view', 'support:manage',
  ],
  MODERATOR: [
    'events:moderate',
    'tickets:view_any',
    'orders:view_any',
    'support:view',
  ],
  ORGANIZER: [
    'events:create', 'events:edit_own', 'events:delete_own',
    'tickets:view_own',
    'orders:view_own',
    'analytics:view_own',
    'payouts:view_own',
    'checkin:manage',
    'promocodes:manage',
    'venues:manage',
  ],
  BUYER: [
    'tickets:view_own',
    'orders:view_own',
  ],
}