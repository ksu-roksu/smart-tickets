import { ROLE_PERMISSIONS, Role, Permission } from './permissions'

export function can(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] ?? []
  return permissions.includes(permission)
}

export function canAny(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p))
}

export function canAll(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => can(role, p))
}