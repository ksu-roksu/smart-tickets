import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/require-auth'
import { safeAuditLog } from '@/lib/audit/safeAuditLog'

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission('team:manage')

    const body = await req.json()
    const memberId = String(body.memberId ?? '')

    if (!memberId) {
      return NextResponse.json(
        { error: 'Не удалось определить участника команды.' },
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

    if (!ctx.isPlatformUser && member.userId === ctx.userId) {
      return NextResponse.json(
        { error: 'Нельзя удалить собственный доступ. Попросите другого владельца или администратора.' },
        { status: 400 },
      )
    }

    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Нельзя удалить владельца организации через это действие.' },
        { status: 400 },
      )
    }

    if (member.status === 'REMOVED') {
      return NextResponse.json(
        { error: 'Доступ этого пользователя уже удалён.' },
        { status: 400 },
      )
    }

    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        status: 'REMOVED',
        inviteTokenHash: null,
        inviteExpiresAt: null,
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
      action: member.status === 'INVITED' ? 'team.invite_revoked' : 'team.access_removed',
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
      ok: true,
      memberId: updated.id,
      status: updated.status,
    })
  } catch (error) {
    console.error('remove-member error:', error)

    return NextResponse.json(
      { error: 'Не удалось удалить доступ. Попробуйте ещё раз.' },
      { status: 500 },
    )
  }
}