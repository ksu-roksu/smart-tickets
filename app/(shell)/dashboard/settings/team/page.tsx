import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/require-auth'
import TeamClient from './TeamClient'

export default async function TeamPage() {
  const ctx = await requirePermission('team:view')

  const members = ctx.isPlatformUser
    ? await prisma.organizationMember.findMany({
        orderBy: { joinedAt: 'desc' },
        take: 100,
        include: {
          user: true,
          organization: true,
        },
      })
    : await prisma.organizationMember.findMany({
        where: {
          organizationId: ctx.organizationId ?? '__none__',
        },
        orderBy: { joinedAt: 'desc' },
        include: {
          user: true,
          organization: true,
        },
      })

  const mapped = members.map((member) => ({
    id: member.id,
    name: member.user.name ?? 'Без имени',
    email: member.user.email,
    role: member.role,
    status: member.status,
    organization: member.organization.name,
    joinedAt: member.joinedAt.toLocaleDateString('ru-KZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }))

  return (
  <TeamClient
    members={mapped}
    canManageTeam={CAN_MANAGE.includes(ctx.role ?? '')}
    isPlatformUser={ctx.isPlatformUser}
  />
)
}