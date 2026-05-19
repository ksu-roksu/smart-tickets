import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/require-auth'
import { safeAuditLog } from '@/lib/audit/safeAuditLog'

const ALLOWED_ROLES = ['ADMIN', 'EVENT_MANAGER', 'FINANCE', 'SCANNER', 'VIEWER'] as const

function formatMember(member: {
  id: string
  role: string
  status: string
  joinedAt: Date
  user: {
    name: string | null
    email: string
  }
  organization: {
    name: string
  }
}) {
  return {
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
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission('team:manage')

    const body = await req.json()
    const memberId = String(body.memberId ?? '')
    const role = String(body.role ?? '')

    if (!memberId) {
      return NextResponse.json(
        { error: 'Не удалось определить участника команды.' },
        { status: 400 },
      )
    }

    if (!ALLOWED_ROLES.includes(role as any)) {
      return NextResponse.json(
        { error: 'Выбрана некорректная роль. Пожалуйста, выберите роль из списка.' },
        { status: 400 },
      )
    }

    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
      include: {
        user: true,
        organization: true,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Участник команды не найден.' },
        { status: 404 },
      )
    }

    if (!ctx.isPlatformUser && member.organizationId !== ctx.organizationId) {
      return NextResponse.json(
        { error: 'У вас нет доступа к управлению этой организацией.' },
        { status: 403 },
      )
    }

    if (member.userId === ctx.userId && !ctx.isPlatformUser) {
      return NextResponse.json(
        { error: 'Нельзя изменить собственную роль. Попросите другого владельца или администратора.' },
        { status: 400 },
      )
    }

    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Роль владельца нельзя изменить через это действие.' },
        { status: 400 },
      )
    }

    if (member.status === 'REMOVED') {
      return NextResponse.json(
        { error: 'У удалённого пользователя нельзя менять роль. Сначала восстановите доступ.' },
        { status: 400 },
      )
    }

    if (member.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'У пользователя с ограниченным доступом нельзя менять роль. Сначала разблокируйте доступ.' },
        { status: 400 },
      )
    }

    if (member.role === role) {
      return NextResponse.json({
        member: formatMember(member),
      })
    }

    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        role: role as any,
      },
      include: {
        user: true,
        organization: true,
      },
    })

    await safeAuditLog({
      actorUserId: ctx.isPlatformUser ? null : ctx.userId,
      actorPlatformId: ctx.isPlatformUser ? ctx.userId : null,
      actorRole: ctx.role,
      organizationId: updated.organizationId,
      action: 'team.role_updated',
      entityType: 'OrganizationMember',
      entityId: updated.id,
      before: {
        role: member.role,
        status: member.status,
        userEmail: member.user.email,
      },
      after: {
        role: updated.role,
        status: updated.status,
        userEmail: updated.user.email,
      },
      metadata: {
        memberEmail: updated.user.email,
        memberName: updated.user.name,
        organizationName: updated.organization.name,
      },
    })

    return NextResponse.json({
      member: formatMember(updated),
    })
  } catch (error) {
    console.error('update-role error:', error)

    return NextResponse.json(
      { error: 'Не удалось изменить роль. Попробуйте ещё раз или обратитесь к администратору.' },
      { status: 500 },
    )
  }
}