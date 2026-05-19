// lib/rbac/can.ts
// Единая функция проверки прав. Используй везде вместо if (role === 'ADMIN')

import { ROLE_PERMISSIONS, type AppRole, type Permission } from './permissions'

/**
 * Проверяет есть ли у роли нужное право.
 *
 * Примеры:
 *   can('OWNER', 'events:publish')     // true
 *   can('SCANNER', 'events:publish')   // false
 *   can('SUPER_ADMIN', 'anything')     // true (wildcard)
 *   can('VIEWER', 'team:view')         // true
 */
export function can(role: AppRole | string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as AppRole]
  if (!perms) return false
  if (perms[0] === '*') return true
  return (perms as Permission[]).includes(permission)
}

/**
 * Проверяет есть ли у роли хотя бы одно из прав.
 *
 * Пример:
 *   canAny('ADMIN', ['events:publish', 'events:edit'])  // true
 */
export function canAny(role: AppRole | string, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p))
}

/**
 * Проверяет есть ли у роли все перечисленные права.
 *
 * Пример:
 *   canAll('OWNER', ['finance:view', 'finance:export'])  // true
 *   canAll('FINANCE', ['finance:view', 'team:manage'])   // false
 */
export function canAll(role: AppRole | string, permissions: Permission[]): boolean {
  return permissions.every((p) => can(role, p))
}