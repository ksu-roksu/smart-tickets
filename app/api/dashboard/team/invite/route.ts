import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/require-auth'
import { safeAuditLog } from '@/lib/audit/safeAuditLog'
import { sendInviteEmail } from '@/lib/email/send-invite-email'

const ALLOWED_ROLES = ['ADMIN', 'EVENT_MANAGER', 'FINANCE', 'SCANNER', 'VIEWER'] as const

function createInviteToken() {
  const inviteToken = crypto.randomBytes(32).toString('hex')
  const inviteTokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex')

  const inviteExpiresAt = new Date()
  inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7)

  return { inviteToken, inviteTokenHash, inviteExpiresAt }
}

function formatMember(member: {
  id: string
  role: string
  status: string
  joinedAt: Date
  user: { name: string | null; email: string }
  organization: { name: string }
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
    const email = String(body.email ?? '').trim().toLowerCase()
    const name = String(body.name ?? '').trim()
    const role = String(body.role ?? 'VIEWER')

    if (!ctx.organizationId && !ctx.isPlatformUser) {
      return NextResponse.json(
        { error: 'Организация не найдена. Обновите страницу и попробуйте ещё раз.' },
        { status: 400 },
      )
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Введите корректный email пользователя.' },
        { status: 400 },
      )
    }

    if (!ALLOWED_ROLES.includes(role as any)) {
      return NextResponse.json(
        { error: 'Выбрана некорректная роль. Пожалуйста, выберите роль из списка.' },
        { status: 400 },
      )
    }

    const organizationId = ctx.organizationId

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Невозможно определить организацию для приглашения.' },
        { status: 400 },
      )
    }

    // Получаем имя того, кто приглашает — для письма
    const invitedByUser = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { name: true },
    })

    const user = await prisma.user.upsert({
      where: { email },
      update: { name: name || undefined },
      create: {
        email,
        name: name || null,
        clerkId: `pending_${crypto.randomUUID()}`,
        role: 'ORGANIZER',
      },
    })

    const existingMember = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId } },
      include: { user: true, organization: true },
    })

    if (existingMember?.status === 'ACTIVE') {
      return NextResponse.json(
        { code: 'member_active', error: 'Этот пользователь уже есть в команде организации.' },
        { status: 409 },
      )
    }

    if (existingMember?.status === 'REMOVED') {
      return NextResponse.json(
        {
          code: 'member_removed',
          memberId: existingMember.id,
          error: 'Этот пользователь ранее был удалён из команды. Восстановите доступ вместо нового приглашения.',
        },
        { status: 409 },
      )
    }

    if (existingMember?.status === 'SUSPENDED') {
      return NextResponse.json(
        {
          code: 'member_suspended',
          memberId: existingMember.id,
          error: 'Доступ этого пользователя сейчас ограничен. Сначала разблокируйте его или измените статус.',
        },
        { status: 409 },
      )
    }

    // ── Повторное приглашение ──────────────────────────────────────────────
    if (existingMember?.status === 'INVITED') {
      const { inviteToken, inviteTokenHash, inviteExpiresAt } = createInviteToken()

      const updated = await prisma.organizationMember.update({
        where: { id: existingMember.id },
        data: { role: role as any, inviteTokenHash, inviteExpiresAt, invitedAt: new Date() },
        include: { user: true, organization: true },
      })

      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/invite/${inviteToken}`

      // Отправляем email (не блокируем ответ если упадёт)
      sendInviteEmail({
        toEmail: updated.user.email,
        orgName: updated.organization.name,
        role: updated.role,
        inviteLink,
        invitedByName: invitedByUser?.name,
      }).catch((err) => console.error('sendInviteEmail (resent) error:', err))

      await safeAuditLog({
        actorUserId: ctx.isPlatformUser ? null : ctx.userId,
        actorPlatformId: ctx.isPlatformUser ? ctx.userId : null,
        actorRole: ctx.role,
        organizationId: updated.organizationId,
        action: 'team.invite_resent',
        entityType: 'OrganizationMember',
        entityId: updated.id,
        before: { role: existingMember.role, status: existingMember.status },
        after: { role: updated.role, status: updated.status },
        metadata: {
          memberEmail: updated.user.email,
          memberName: updated.user.name,
          organizationName: updated.organization.name,
        },
      })

      return NextResponse.json({
        resent: true,
        inviteLink,
        member: formatMember(updated),
      })
    }

    // ── Новое приглашение ──────────────────────────────────────────────────
    const { inviteToken, inviteTokenHash, inviteExpiresAt } = createInviteToken()

    const member = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId,
        role: role as any,
        status: 'INVITED',
        invitedByUserId: ctx.userId,
        invitedAt: new Date(),
        inviteTokenHash,
        inviteExpiresAt,
      },
      include: { user: true, organization: true },
    })

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/invite/${inviteToken}`

    // Отправляем email (не блокируем ответ если упадёт)
    sendInviteEmail({
      toEmail: member.user.email,
      orgName: member.organization.name,
      role: member.role,
      inviteLink,
      invitedByName: invitedByUser?.name,
    }).catch((err) => console.error('sendInviteEmail error:', err))

    await safeAuditLog({
      actorUserId: ctx.isPlatformUser ? null : ctx.userId,
      actorPlatformId: ctx.isPlatformUser ? ctx.userId : null,
      actorRole: ctx.role,
      organizationId: member.organizationId,
      action: 'team.invite_created',
      entityType: 'OrganizationMember',
      entityId: member.id,
      after: { role: member.role, status: member.status },
      metadata: {
        memberEmail: member.user.email,
        memberName: member.user.name,
        organizationName: member.organization.name,
      },
    })

    return NextResponse.json({
      inviteLink,
      member: formatMember(member),
    })
  } catch (error) {
    console.error('invite error:', error)
    return NextResponse.json(
      { error: 'Не удалось отправить приглашение. Попробуйте ещё раз.' },
      { status: 500 },
    )
  }
}