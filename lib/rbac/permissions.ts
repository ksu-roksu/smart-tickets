// lib/rbac/permissions.ts

export type OrgRole =
  | 'OWNER'
  | 'ADMIN'
  | 'EVENT_MANAGER'
  | 'FINANCE'
  | 'SCANNER'
  | 'VIEWER'

export type PlatformRole =
  | 'SUPER_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'SUPPORT'
  | 'FINANCE'
  | 'CONTENT_MODERATION'
  | 'FRAUD_RISK'

export type AppRole = OrgRole | PlatformRole | 'BUYER'

export type Permission =
  // Дашборд
  | 'dashboard:view'
  // Команда
  | 'team:view'
  | 'team:manage'
  // События
  | 'events:view'
  | 'events:create'
  | 'events:edit'
  | 'events:publish'
  | 'events:cancel'
  | 'events:delete'
  | 'events:moderate'
  // Билеты
  | 'tickets:view'
  // Заказы
  | 'orders:view'
  | 'orders:refund'
  | 'orders:export'
  | 'orders:manual_issue'
  // Финансы
  | 'finance:view'
  | 'finance:export'
  | 'finance:payout_request'
  // Выплаты
  | 'payouts:view'
  // Аналитика
  | 'analytics:view'
  // Настройки
  | 'settings:view'
  | 'settings:edit'
  // Check-in
  | 'checkin:scan'
  // Промокоды
  | 'promocodes:view'
  | 'promocodes:manage'
  // Площадки
  | 'venues:view'
  | 'venues:manage'
  // Поддержка
  | 'support:view'
  // Audit log
  | 'audit:view'
  // Платформенные (только Baisanat)
  | 'platform:orgs_view'
  | 'platform:orgs_manage'
  | 'platform:users_view'
  | 'platform:users_manage'
  | 'platform:fraud_view'
  | 'platform:fraud_manage'
  | 'platform:payouts_manage'
  | 'platform:feature_flags'
  | 'platform:support_notes'

const ROLE_PERMISSIONS: Record<AppRole, Permission[] | ['*']> = {
  // ── Платформенные роли ─────────────────────────────────────────────────
  SUPER_ADMIN: ['*'],

  PLATFORM_ADMIN: [
    'dashboard:view',
    'platform:orgs_view',
    'platform:orgs_manage',
    'platform:users_view',
    'platform:users_manage',
    'platform:fraud_view',
    'platform:fraud_manage',
    'platform:payouts_manage',
    'platform:feature_flags',
    'platform:support_notes',
    'audit:view',
    'team:view',
    'team:manage',
    'events:view',
    'events:edit',
    'events:publish',
    'events:cancel',
    'events:moderate',
    'tickets:view',
    'orders:view',
    'orders:refund',
    'finance:view',
    'finance:export',
    'payouts:view',
    'analytics:view',
    'support:view',
  ],

  SUPPORT: [
    'dashboard:view',
    'platform:support_notes',
    'platform:users_view',
    'orders:view',
    'orders:refund',
    'tickets:view',
    'events:view',
    'analytics:view',
    'audit:view',
    'support:view',
  ],

  CONTENT_MODERATION: [
    'dashboard:view',
    'platform:orgs_view',
    'events:view',
    'events:edit',
    'events:publish',
    'events:cancel',
    'events:moderate',
    'analytics:view',
  ],

  FRAUD_RISK: [
    'dashboard:view',
    'platform:fraud_view',
    'platform:fraud_manage',
    'platform:users_view',
    'orders:view',
    'tickets:view',
    'audit:view',
    'analytics:view',
  ],

  FINANCE: [
    'dashboard:view',
    'finance:view',
    'finance:export',
    'platform:payouts_manage',
    'orders:view',
    'orders:export',
    'payouts:view',
    'tickets:view',
    'analytics:view',
    'audit:view',
  ],

  // ── Роли организатора ──────────────────────────────────────────────────
  OWNER: [
    'dashboard:view',
    'team:view',
    'team:manage',
    'events:view',
    'events:create',
    'events:edit',
    'events:publish',
    'events:cancel',
    'events:delete',
    'tickets:view',
    'orders:view',
    'orders:refund',
    'orders:export',
    'orders:manual_issue',
    'finance:view',
    'finance:export',
    'finance:payout_request',
    'payouts:view',
    'analytics:view',
    'settings:view',
    'settings:edit',
    'checkin:scan',
    'promocodes:view',
    'promocodes:manage',
    'venues:view',
    'venues:manage',
    'audit:view',
  ],

  ADMIN: [
    'dashboard:view',
    'team:view',
    'team:manage',
    'events:view',
    'events:create',
    'events:edit',
    'events:publish',
    'events:cancel',
    'tickets:view',
    'orders:view',
    'orders:refund',
    'orders:export',
    'orders:manual_issue',
    'finance:view',
    'payouts:view',
    'analytics:view',
    'settings:view',
    'checkin:scan',
    'promocodes:view',
    'promocodes:manage',
    'venues:view',
    'venues:manage',
    'audit:view',
  ],

  EVENT_MANAGER: [
    'dashboard:view',
    'team:view',
    'events:view',
    'events:create',
    'events:edit',
    'events:publish',
    'events:cancel',
    'tickets:view',
    'orders:view',
    'analytics:view',
    'checkin:scan',
    'promocodes:view',
    'promocodes:manage',
    'venues:view',
    'venues:manage',
  ],

  SCANNER: [
    'dashboard:view',
    'checkin:scan',
    'events:view',
    'tickets:view',
  ],

  VIEWER: [
    'dashboard:view',
    'team:view',
    'events:view',
    'tickets:view',
    'orders:view',
    'analytics:view',
    'venues:view',
    'promocodes:view',
  ],

  BUYER: [],
}

export { ROLE_PERMISSIONS }