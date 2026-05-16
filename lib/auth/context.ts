import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { Role } from '@/lib/rbac/permissions'

export type AuthContext = {
  userId: string
  clerkId: string
  email: string
  name: string | null
  role: Role
  organizationId: string | null
  organizationName: string | null
  isPlatformUser: boolean
}

// Маппинг ролей из БД в наш RBAC
function mapRole(
  platformRole: string | null,
  orgRole: string | null,
  userRole: string,
): Role {
  if (platformRole === 'SUPER_ADMIN' || platformRole === 'PLATFORM_ADMIN') return 'SUPER_ADMIN'
  if (platformRole === 'CONTENT_MODERATION' || platformRole === 'FRAUD_RISK') return 'MODERATOR'
  if (platformRole === 'SUPPORT' || platformRole === 'FINANCE') return 'ADMIN'
  if (orgRole === 'OWNER' || orgRole === 'ADMIN') return 'ORGANIZER'
  if (orgRole === 'EVENT_MANAGER' || orgRole === 'FINANCE') return 'ORGANIZER'
  if (userRole === 'ADMIN') return 'ADMIN'
  if (userRole === 'ORGANIZER') return 'ORGANIZER'
  return 'BUYER'
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  // 1. Проверяем PlatformUser (внутренние сотрудники)
  const platformUser = await prisma.platformUser.findUnique({
    where: { clerkId },
  })

  if (platformUser) {
    return {
      userId: platformUser.id,
      clerkId,
      email: platformUser.email,
      name: platformUser.name,
      role: mapRole(platformUser.role, null, ''),
      organizationId: null,
      organizationName: 'Smart Tickets',
      isPlatformUser: true,
    }
  }

  // 2. Обычный пользователь
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
    role: mapRole(null, membership?.role ?? null, user.role),
    organizationId: membership?.organizationId ?? null,
    organizationName: membership?.organization.name ?? null,
    isPlatformUser: false,
  }
}