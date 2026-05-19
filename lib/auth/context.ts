import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { AppRole } from '@/lib/rbac/permissions'

export type AuthContext = {
  userId: string
  clerkId: string
  email: string
  name: string | null
  role: AppRole
  organizationId: string | null
  organizationName: string | null
  isPlatformUser: boolean
}

function mapPlatformRole(role: string): AppRole {
  if (
    role === 'SUPER_ADMIN' ||
    role === 'PLATFORM_ADMIN' ||
    role === 'SUPPORT' ||
    role === 'FINANCE' ||
    role === 'CONTENT_MODERATION' ||
    role === 'FRAUD_RISK'
  ) {
    return role
  }

  return 'BUYER'
}

function mapOrgRole(role: string | null | undefined): AppRole {
  if (
    role === 'OWNER' ||
    role === 'ADMIN' ||
    role === 'EVENT_MANAGER' ||
    role === 'FINANCE' ||
    role === 'SCANNER' ||
    role === 'VIEWER'
  ) {
    return role
  }

  return 'BUYER'
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const platformUser = await prisma.platformUser.findUnique({
    where: { clerkId },
  })

  if (platformUser && platformUser.isActive) {
    return {
      userId: platformUser.id,
      clerkId,
      email: platformUser.email,
      name: platformUser.name,
      role: mapPlatformRole(platformUser.role),
      organizationId: null,
      organizationName: 'Baisanat Holding',
      isPlatformUser: true,
    }
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { organization: true },
        orderBy: { joinedAt: 'asc' },
        take: 1,
      },
    },
  })

  if (!user) return null

  const membership = user.memberships[0] ?? null

  return {
    userId: user.id,
    clerkId,
    email: user.email,
    name: user.name,
    role: mapOrgRole(membership?.role),
    organizationId: membership?.organizationId ?? null,
    organizationName: membership?.organization.name ?? null,
    isPlatformUser: false,
  }
}