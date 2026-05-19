// app/api/invite/accept/route.ts
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { safeAuditLog } from '@/lib/audit/safeAuditLog'

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Необходимо войти в аккаунт чтобы принять приглашение.' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const token = String(body.token ?? '').trim()

    if (!token) {
      return NextResponse.json(
        { error: 'Токен приглашения не указан.' },
        { status: 400 },
      )
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const member = await prisma.organizationMember.findFirst({
      where: { inviteTokenHash: tokenHash },
      include: { user: true, organization: true },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Приглашение не найдено или уже было отозвано.' },
        { status: 404 },
      )
    }

    if (member.inviteExpiresAt && member.inviteExpiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Срок действия приглашения истёк. Попросите организатора отправить новое.' },
        { status: 410 },
      )
    }

    if (member.status !== 'INVITED') {
      return NextResponse.json(
        { error: 'Это приглашение уже было использовано или отозвано.' },
        { status: 409 },
      )
    }

    // Находим реального пользователя по clerkId
    let realUser = await prisma.user.findUnique({ where: { clerkId } })

    // Если пользователь не найден по clerkId — ищем по email (pending user)
    if (!realUser) {
      realUser = await prisma.user.findUnique({ where: { email: member.user.email } })

      if (realUser && realUser.clerkId.startsWith('pending_')) {
        // Обновляем pending пользователя реальным clerkId
        realUser = await prisma.user.update({
          where: { id: realUser.id },
          data: { clerkId },
        })
      }
    }

    if (!realUser) {
      return NextResponse.json(
        { error: 'Аккаунт не найден. Убедитесь что вы вошли с правильным email.' },
        { status: 404 },
      )
    }

    // Принимаем приглашение
    const updated = await prisma.organizationMember.update({
      where: { id: member.id },
      data: {
        userId: realUser.id,
        status: 'ACTIVE',
        acceptedAt: new Date(),
        inviteTokenHash: null,
        inviteExpiresAt: null,
      },
      include: { organization: true },
    })

    await safeAuditLog({
      actorUserId: realUser.id,
      actorPlatformId: null,
      actorRole: updated.role,
      organizationId: updated.organizationId,
      action: 'team.invite_accepted',
      entityType: 'OrganizationMember',
      entityId: updated.id,
      before: { status: 'INVITED' },
      after: { status: 'ACTIVE', role: updated.role },
      metadata: {
        userEmail: realUser.email,
        organizationName: updated.organization.name,
      },
    })

    return NextResponse.json({
      ok: true,
      organizationId: updated.organizationId,
      organizationName: updated.organization.name,
      role: updated.role,
    })
  } catch (error) {
    console.error('accept-invite error:', error)
    return NextResponse.json(
      { error: 'Не удалось принять приглашение. Попробуйте ещё раз.' },
      { status: 500 },
    )
  }
}