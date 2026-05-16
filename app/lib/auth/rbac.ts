/**
 * Smart Tickets — RBAC Engine
 * 
 * Architecture:
 * - Role = preset bundle of permissions
 * - Permission = granular action+resource pair
 * - Authorization = role permissions + individual overrides (ALLOW/DENY)
 * - DENY always wins over ALLOW (explicit deny)
 * 
 * Usage:
 *   const can = buildAuthorizer(member)
 *   if (!can('PUBLISH', 'EVENTS')) throw new ForbiddenError()
 */

import type {
  OrgRole,
  PlatformRole,
  PermissionAction,
  PermissionResource,
} from '@prisma/client'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type Action = PermissionAction
export type Resource = PermissionResource

export interface PermissionEntry {
  action: Action
  resource: Resource
  effect: 'ALLOW' | 'DENY'
}

export interface AuthContext {
  userId: string
  organizationId?: string
  role?: OrgRole
  platformRole?: PlatformRole
  permissions?: PermissionEntry[]  // granular overrides
}

export type Authorizer = (action: Action, resource: Resource) => boolean

// ─────────────────────────────────────────────────────────────
// Role → Permission matrix
// Each role gets a preset list of ALLOW permissions.
// Individual overrides can add or DENY on top.
// ─────────────────────────────────────────────────────────────

type RolePermissions = Partial<Record<Resource, Action[]>>

const ORG_ROLE_PERMISSIONS: Record<OrgRole, RolePermissions> = {
  OWNER: {
    EVENTS:      ['READ', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH'],
    TICKETS:     ['READ', 'CREATE', 'UPDATE', 'BLOCK', 'REISSUE'],
    ORDERS:      ['READ', 'REFUND'],
    FINANCE:     ['READ', 'MANAGE'],
    PAYOUTS:     ['READ', 'MANAGE'],
    PROMO_CODES: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'],
    USERS:       ['READ'],
    TEAM:        ['READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'],
    SETTINGS:    ['READ', 'UPDATE', 'MANAGE'],
    ANALYTICS:   ['READ', 'EXPORT'],
    CHECK_IN:    ['READ', 'MANAGE'],
    VENUES:      ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    SEAT_MAPS:   ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    AUDIT_LOGS:  ['READ'],
  },

  ADMIN: {
    EVENTS:      ['READ', 'CREATE', 'UPDATE', 'PUBLISH'],
    TICKETS:     ['READ', 'CREATE', 'UPDATE', 'BLOCK', 'REISSUE'],
    ORDERS:      ['READ'],
    FINANCE:     ['READ'],
    PROMO_CODES: ['READ', 'CREATE', 'UPDATE', 'MANAGE'],
    TEAM:        ['READ', 'CREATE', 'UPDATE'],
    SETTINGS:    ['READ', 'UPDATE'],
    ANALYTICS:   ['READ'],
    CHECK_IN:    ['READ', 'MANAGE'],
    VENUES:      ['READ', 'CREATE', 'UPDATE'],
    SEAT_MAPS:   ['READ', 'CREATE', 'UPDATE'],
    AUDIT_LOGS:  ['READ'],
  },

  EVENT_MANAGER: {
    EVENTS:      ['READ', 'CREATE', 'UPDATE'],
    TICKETS:     ['READ', 'CREATE', 'UPDATE'],
    ORDERS:      ['READ'],
    ANALYTICS:   ['READ'],
    PROMO_CODES: ['READ', 'CREATE', 'UPDATE'],
    CHECK_IN:    ['READ'],
    VENUES:      ['READ'],
    SEAT_MAPS:   ['READ'],
  },

  FINANCE: {
    ORDERS:    ['READ', 'REFUND'],
    FINANCE:   ['READ', 'EXPORT'],
    PAYOUTS:   ['READ'],
    ANALYTICS: ['READ', 'EXPORT'],
    TICKETS:   ['READ'],
  },

  SCANNER: {
    CHECK_IN: ['READ', 'MANAGE'],
    TICKETS:  ['READ'],
    EVENTS:   ['READ'],
  },

  VIEWER: {
    EVENTS:    ['READ'],
    TICKETS:   ['READ'],
    ORDERS:    ['READ'],
    ANALYTICS: ['READ'],
  },
}

const PLATFORM_ROLE_PERMISSIONS: Record<PlatformRole, RolePermissions> = {
  SUPER_ADMIN: {
    EVENTS:      ['READ', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'APPROVE'],
    TICKETS:     ['READ', 'CREATE', 'UPDATE', 'DELETE', 'BLOCK', 'REISSUE'],
    ORDERS:      ['READ', 'REFUND'],
    FINANCE:     ['READ', 'MANAGE', 'EXPORT'],
    PAYOUTS:     ['READ', 'MANAGE'],
    PROMO_CODES: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'],
    USERS:       ['READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'],
    TEAM:        ['READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'],
    SETTINGS:    ['READ', 'UPDATE', 'MANAGE'],
    ANALYTICS:   ['READ', 'EXPORT'],
    CHECK_IN:    ['READ', 'MANAGE'],
    VENUES:      ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    SEAT_MAPS:   ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    AUDIT_LOGS:  ['READ', 'EXPORT'],
  },

  PLATFORM_ADMIN: {
    EVENTS:      ['READ', 'UPDATE', 'PUBLISH', 'APPROVE'],
    TICKETS:     ['READ', 'BLOCK', 'REISSUE'],
    ORDERS:      ['READ', 'REFUND'],
    FINANCE:     ['READ'],
    PAYOUTS:     ['READ'],
    USERS:       ['READ', 'UPDATE'],
    SETTINGS:    ['READ', 'UPDATE'],
    ANALYTICS:   ['READ', 'EXPORT'],
    CHECK_IN:    ['READ'],
    AUDIT_LOGS:  ['READ'],
  },

  SUPPORT: {
    ORDERS:  ['READ'],
    TICKETS: ['READ', 'REISSUE'],
    USERS:   ['READ', 'UPDATE'],
    EVENTS:  ['READ'],
  },

  FINANCE: {
    ORDERS:    ['READ', 'REFUND'],
    FINANCE:   ['READ', 'MANAGE', 'EXPORT'],
    PAYOUTS:   ['READ', 'MANAGE'],
    ANALYTICS: ['READ', 'EXPORT'],
    TICKETS:   ['READ'],
  },

  CONTENT_MODERATION: {
    EVENTS: ['READ', 'UPDATE', 'APPROVE', 'PUBLISH'],
    ANALYTICS: ['READ'],
  },

  FRAUD_RISK: {
    ORDERS:  ['READ'],
    TICKETS: ['READ', 'BLOCK'],
    USERS:   ['READ'],
    EVENTS:  ['READ'],
    AUDIT_LOGS: ['READ'],
  },
}

// ─────────────────────────────────────────────────────────────
// Core authorization logic
// ─────────────────────────────────────────────────────────────

/**
 * Build an authorizer function for a given auth context.
 * Checks role permissions first, then applies individual overrides.
 * DENY always wins.
 */
export function buildAuthorizer(ctx: AuthContext): Authorizer {
  return (action: Action, resource: Resource): boolean => {
    // 1. Get base permissions from role
    const rolePerms = getRolePermissions(ctx)
    const resourceActions = rolePerms[resource] ?? []
    let allowed = resourceActions.includes(action)

    // 2. Apply individual permission overrides
    if (ctx.permissions?.length) {
      for (const perm of ctx.permissions) {
        if (perm.resource === resource && perm.action === action) {
          if (perm.effect === 'DENY') return false  // DENY always wins
          if (perm.effect === 'ALLOW') allowed = true
        }
      }
    }

    return allowed
  }
}

function getRolePermissions(ctx: AuthContext): RolePermissions {
  if (ctx.platformRole) {
    return PLATFORM_ROLE_PERMISSIONS[ctx.platformRole] ?? {}
  }
  if (ctx.role) {
    return ORG_ROLE_PERMISSIONS[ctx.role] ?? {}
  }
  return {}
}

// ─────────────────────────────────────────────────────────────
// Navigation items — built from role (for sidebar rendering)
// ─────────────────────────────────────────────────────────────

export interface NavItem {
  key: string
  label: string
  href: string
  icon: string
  badge?: 'error' | 'warning'
  requiredPermission?: { action: Action; resource: Resource }
  children?: NavItem[]
}

export function buildNavigation(ctx: AuthContext): NavItem[] {
  const can = buildAuthorizer(ctx)

  const items: NavItem[] = []

  // Dashboard — always visible
  items.push({ key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'ti-layout-dashboard' })

  if (can('READ', 'ANALYTICS')) {
    items.push({ key: 'analytics', label: 'Аналитика', href: '/dashboard/analytics', icon: 'ti-chart-bar' })
  }

  if (can('READ', 'EVENTS')) {
    items.push({
      key: 'events',
      label: 'События',
      href: '/dashboard/events',
      icon: 'ti-calendar-event',
    })
  }

  if (can('READ', 'TICKETS')) {
    items.push({ key: 'tickets', label: 'Билеты', href: '/dashboard/tickets', icon: 'ti-ticket' })
  }

  if (can('READ', 'VENUES')) {
    items.push({ key: 'venues', label: 'Площадки', href: '/dashboard/venues', icon: 'ti-map-pin' })
  }

  if (can('READ', 'PROMO_CODES')) {
    items.push({ key: 'promo', label: 'Промокоды', href: '/dashboard/promo', icon: 'ti-tag' })
  }

  if (can('READ', 'ORDERS')) {
    items.push({
      key: 'orders',
      label: 'Заказы',
      href: '/dashboard/orders',
      icon: 'ti-shopping-cart',
      badge: 'warning',
    })
  }

  if (can('READ', 'FINANCE')) {
    items.push({ key: 'finance', label: 'Финансы', href: '/dashboard/finance', icon: 'ti-cash' })
  }

  if (can('READ', 'PAYOUTS')) {
    items.push({ key: 'payouts', label: 'Выплаты', href: '/dashboard/finance/payouts', icon: 'ti-building-bank' })
  }

  if (can('READ', 'CHECK_IN')) {
    items.push({ key: 'checkin', label: 'Check-in', href: '/dashboard/check-in', icon: 'ti-qrcode' })
  }

  if (can('READ', 'USERS') || can('READ', 'TEAM')) {
    items.push({ key: 'team', label: 'Команда', href: '/dashboard/team', icon: 'ti-users' })
  }

  if (can('READ', 'SETTINGS')) {
    items.push({ key: 'settings', label: 'Настройки', href: '/dashboard/settings', icon: 'ti-settings' })
  }

  if (can('READ', 'AUDIT_LOGS')) {
    items.push({ key: 'audit', label: 'Audit Log', href: '/dashboard/audit', icon: 'ti-shield-check' })
  }

  return items
}

// ─────────────────────────────────────────────────────────────
// Helpers — check object ownership
// ─────────────────────────────────────────────────────────────

/** BOLA protection: ensure org resource belongs to current org */
export function assertOrgOwnership(
  resourceOrgId: string,
  ctx: AuthContext,
): void {
  // Platform admins can access any org
  if (ctx.platformRole) return

  if (ctx.organizationId !== resourceOrgId) {
    throw new ForbiddenError('Cross-organization access denied')
  }
}

// ─────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────

export class ForbiddenError extends Error {
  readonly statusCode = 403
  constructor(message = 'Access denied') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class UnauthorizedError extends Error {
  readonly statusCode = 401
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}
