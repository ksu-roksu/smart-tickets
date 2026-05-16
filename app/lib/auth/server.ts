/**
 * Smart Tickets — Server Auth Context
 * 
 * Resolves Clerk session → User → Organization membership → AuthContext
 * Use in every API route handler and Server Component that needs auth.
 * 
 * Usage in API route:
 *   const ctx = await getAuthContext(req, { requireOrgId: true })
 *   const can = buildAuthorizer(ctx)
 *   if (!can('PUBLISH', 'EVENTS')) throw new ForbiddenError()
 * 
 * Usage in Server Component:
 *   const ctx = await getServerAuthContext()
 */

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import {
  buildAuthorizer,
  ForbiddenError,
  UnauthorizedError,
  type AuthContext,
  type Authorizer,
} from './rbac'
import type { OrgRole, PlatformRole } from '@prisma/client'

// ─────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────

interface GetAuthContextOptions {
  /** Require user to belong to an organization */
  requireOrgId?: boolean | string   // true = any org, string = specific org ID
  /** Minimum org role required */
  requireRole?: OrgRole
  /** Require platform role */
  requirePlatformRole?: PlatformRole
  /** Skip DB lookup (faster, but no permissions) */
  clerkOnly?: boolean
}

// ─────────────────────────────────────────────────────────────
// Main resolver
// ─────────────────────────────────────────────────────────────

export async function getAuthContext(
  options: GetAuthContextOptions = {},
): Promise<AuthContext & { can: Authorizer }> {
  const { userId: clerkUserId } = await auth()

  if (!clerkUserId) throw new UnauthorizedError()

  // Fast path: skip DB
  if (options.clerkOnly) {
    const ctx: AuthContext = { userId: clerkUserId }
    return { ...ctx, can: buildAuthorizer(ctx) }
  }

  // Look up internal user
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, email: true },
  })
  if (!user) throw new UnauthorizedError('User not found in database')

  // Check if platform user first
  const platformUser = await prisma.platformUser.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, role: true, permissions: true, isActive: true },
  })

  if (platformUser) {
    if (!platformUser.isActive) throw new ForbiddenError('Account suspended')

    if (options.requirePlatformRole && platformUser.role !== options.requirePlatformRole) {
      throw new ForbiddenError(`Requires platform role: ${options.requirePlatformRole}`)
    }

    const ctx: AuthContext = {
      userId: user.id,
      platformRole: platformUser.role as PlatformRole,
      permissions: platformUser.permissions as AuthContext['permissions'],
    }
    return { ...ctx, can: buildAuthorizer(ctx) }
  }

  // Org membership lookup
  let membership = null
  let targetOrgId = typeof options.requireOrgId === 'string' ? options.requireOrgId : undefined

  if (targetOrgId || options.requireOrgId) {
    // If no specific org requested, get first active membership
    const query = targetOrgId
      ? { userId: user.id, organizationId: targetOrgId, status: 'ACTIVE' as const }
      : { userId: user.id, status: 'ACTIVE' as const }

    membership = await prisma.organizationMember.findFirst({
      where: query,
      include: { permissions: true },
      orderBy: { joinedAt: 'asc' },
    })

    if (options.requireOrgId && !membership) {
      throw new ForbiddenError('Not a member of this organization')
    }
  }

  if (options.requireRole && membership) {
    if (!hasRoleLevel(membership.role as OrgRole, options.requireRole)) {
      throw new ForbiddenError(`Requires role: ${options.requireRole}`)
    }
  }

  const ctx: AuthContext = {
    userId: user.id,
    organizationId: membership?.organizationId,
    role: membership?.role as OrgRole | undefined,
    permissions: membership?.permissions as AuthContext['permissions'],
  }

  return { ...ctx, can: buildAuthorizer(ctx) }
}

// ─────────────────────────────────────────────────────────────
// Role hierarchy — higher index = more permissions
// ─────────────────────────────────────────────────────────────

const ROLE_HIERARCHY: OrgRole[] = [
  'VIEWER',
  'SCANNER',
  'FINANCE',
  'EVENT_MANAGER',
  'ADMIN',
  'OWNER',
]

function hasRoleLevel(userRole: OrgRole, requiredRole: OrgRole): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole)
}

// ─────────────────────────────────────────────────────────────
// API route helper — wraps handler with auth + error handling
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

type RouteHandler = (
  req: NextRequest,
  ctx: AuthContext & { can: Authorizer },
  params?: Record<string, string>,
) => Promise<NextResponse>

export function withAuth(
  handler: RouteHandler,
  options: GetAuthContextOptions = {},
) {
  return async (req: NextRequest, { params }: { params?: Record<string, string> } = {}) => {
    try {
      const ctx = await getAuthContext(options)
      return await handler(req, ctx, params)
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      console.error('[withAuth] Unhandled error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Audit log helper — call after every critical action
// ─────────────────────────────────────────────────────────────

interface AuditOptions {
  ctx: AuthContext
  action: string        // e.g. "event.publish"
  entityType: string    // e.g. "Event"
  entityId: string
  before?: object
  after?: object
  req?: NextRequest
}

export async function createAuditLog(opts: AuditOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: opts.ctx.platformRole ? undefined : opts.ctx.userId,
        actorPlatformId: opts.ctx.platformRole ? opts.ctx.userId : undefined,
        actorRole: opts.ctx.role ?? opts.ctx.platformRole,
        organizationId: opts.ctx.organizationId,
        action: opts.action,
        entityType: opts.entityType,
        entityId: opts.entityId,
        before: opts.before ? (opts.before as object) : undefined,
        after: opts.after ? (opts.after as object) : undefined,
        ipAddress: opts.req?.headers.get('x-forwarded-for') ?? undefined,
        userAgent: opts.req?.headers.get('user-agent') ?? undefined,
      },
    })
  } catch (error) {
    // Audit log failure should never break the main flow
    console.error('[AuditLog] Failed to write audit log:', error)
  }
}

// ─────────────────────────────────────────────────────────────
// BOLA guard — object-level authorization
// ─────────────────────────────────────────────────────────────

/** 
 * Use before returning any org-scoped resource from an API.
 * Prevents BOLA: user changing ?eventId= to access another org's data.
 */
export function assertBelongsToOrg(
  resourceOrgId: string,
  ctx: AuthContext,
): void {
  // Platform users bypass org isolation
  if (ctx.platformRole) return

  if (!ctx.organizationId || ctx.organizationId !== resourceOrgId) {
    throw new ForbiddenError('Resource does not belong to your organization')
  }
}
