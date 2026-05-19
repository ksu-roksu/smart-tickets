import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/require-auth'
import { safeAuditLog } from '@/lib/audit/safeAuditLog'

const ALLOWED_ROLES = ['ADMIN', 'EVENT_MANAGER', 'FINANCE', 'SCANNER', 'VIEWER'] as const

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission('team:manage')

    const body = await req.json()
    const memberId = String(body.memberId ?? '')
    const role = String(body.role ?? 'VIEWER')

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
      include: { user: true, organization: true },
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

    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Доступ владельца восстанавливается иначе.' },
        { status: 400 },
      )
    }

    if (member.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Доступ этого пользователя уже активен.' },
        { status: 400 },
      )
    }

    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: role as any, status: 'ACTIVE' },
      include: { user: true, organization: true },
    })

    await safeAuditLog({
      actorUserId: ctx.isPlatformUser ? null : ctx.userId,
      actorPlatformId: ctx.isPlatformUser ? ctx.userId : null,
      actorRole: ctx.role,
      organizationId: updated.organizationId,
      action: 'team.access_restored',   // ← единая конвенция
      entityType: 'OrganizationMember',
      entityId: updated.id,
      before: { role: member.role, status: member.status },
      after: { role: updated.role, status: updated.status },
      metadata: {
        memberEmail: updated.user.email,
        memberName: updated.user.name,
        organizationName: updated.organization.name,
      },
    })

    return NextResponse.json({
      member: {
        id: updated.id,
        name: updated.user.name ?? 'Без имени',
        email: updated.user.email,
        role: updated.role,
        status: updated.status,
        organization: updated.organization.name,
        joinedAt: updated.joinedAt.toLocaleDateString('ru-KZ', {
          day: 'numeric', month: 'long', year: 'numeric',
        }),
      },
    })
  } catch (error) {
    console.error('restore-member error:', error)
    return NextResponse.json(
      { error: 'Не удалось восстановить доступ. Попробуйте ещё раз.' },
      { status: 500 },
    )
  }
}