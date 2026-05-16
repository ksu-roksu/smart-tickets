/**
 * app/api/dashboard/events/route.ts
 * POST — создание события из wizard
 * GET  — список событий для dashboard/черновиков
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { normalizeEventPayload, validateEventInput, type EventWizardInput } from '@/lib/dashboard/eventPayload'

async function resolveUser(clerkUserId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId }, select: { id: true } })
  if (!user) return null

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    select: { organizationId: true, role: true },
  })

  return { userId: user.id, organizationId: membership?.organizationId ?? null, role: membership?.role ?? null }
}

function userMessageFromError(error: unknown) {
  const text = error instanceof Error ? error.message : String(error)
  if (text.includes('Unknown argument')) return 'Backend получил поле, которого нет в Prisma schema. Проверьте mapping payload → Prisma.'
  if (text.includes('Foreign key constraint')) return 'Не удалось связать событие с площадкой или организацией. Проверьте venueId/organizationId.'
  if (text.includes('Unique constraint')) return 'Такой slug или уникальное значение уже существует. Попробуйте сохранить ещё раз.'
  return 'Не удалось сохранить событие. Посмотрите детали в консоли сервера.'
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) return NextResponse.json({ error: 'Нужно войти в аккаунт' }, { status: 401 })

    const ctx = await resolveUser(clerkUserId)
    if (!ctx) return NextResponse.json({ error: 'Пользователь не найден в базе. Нужно синхронизировать Clerk user с User.' }, { status: 401 })

    const body = await req.json()
    const publish = Boolean(body.publish)
    const mode = publish ? 'review' : 'draft'
    const data = body as EventWizardInput

    const validation = validateEventInput(data, mode)
    if (validation.length) {
      return NextResponse.json({ error: 'Заполните обязательные поля', fieldErrors: validation }, { status: 422 })
    }

    let venueId: string | undefined = data.venueId || undefined

    if (!data.isOnlineEvent && data.isNewVenue && !venueId) {
      const venue = await prisma.venue.create({
        data: {
          name: String(data.venueName ?? '').trim(),
          address: String(data.venueAddress ?? '').trim(),
          city: data.venueCity || 'Алматы',
          country: 'KZ',
          organizationId: ctx.organizationId,
        },
      })
      venueId = venue.id
    }

    if (!venueId) {
      const fallback = await prisma.venue.findFirst({ select: { id: true }, orderBy: { createdAt: 'asc' } })
      if (!fallback) {
        const venue = await prisma.venue.create({
          data: {
            name: data.isOnlineEvent ? 'Онлайн' : 'Площадка не указана',
            address: '',
            city: data.venueCity || 'Алматы',
            country: 'KZ',
            organizationId: ctx.organizationId,
          },
        })
        venueId = venue.id
      } else {
        venueId = fallback.id
      }
    }

    const normalized = normalizeEventPayload(data, mode)

    const event = await prisma.event.create({
      data: {
        organizationId: ctx.organizationId,
        venueId,
        ...normalized.event,
      },
    })

    if (normalized.tickets.length) {
      await prisma.ticketType.createMany({
        data: normalized.tickets.map(ticket => ({ ...ticket, eventId: event.id })),
      })
    }

    try {
      await prisma.auditLog.create({
        data: {
          actorUserId: ctx.userId,
          organizationId: ctx.organizationId,
          action: publish ? 'event.submit_for_review' : 'event.create_draft',
          entityType: 'Event',
          entityId: event.id,
          after: { title: event.title, status: event.status },
          ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
          userAgent: req.headers.get('user-agent') ?? undefined,
        },
      })
    } catch {
      // audit log не должен ломать основной сценарий сохранения
    }

    return NextResponse.json({ data: event }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/dashboard/events]', error)
    return NextResponse.json(
      {
        error: userMessageFromError(error),
        technicalDetails: process.env.NODE_ENV === 'development' ? [error instanceof Error ? error.message : String(error)] : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) return NextResponse.json({ error: 'Нужно войти в аккаунт' }, { status: 401 })

    const ctx = await resolveUser(clerkUserId)
    if (!ctx) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 })

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') ?? undefined
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

    const where = {
      ...(ctx.organizationId ? { organizationId: ctx.organizationId } : {}),
      ...(status ? { status: status as any } : {}),
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          date: true,
          startAt: true,
          soldCount: true,
          totalCapacity: true,
          imageUrl: true,
          coverUrl: true,
          updatedAt: true,
          venue: { select: { name: true, city: true } },
        },
      }),
      prisma.event.count({ where }),
    ])

    return NextResponse.json({ data: events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('[GET /api/dashboard/events]', error)
    return NextResponse.json({ error: 'Не удалось загрузить события' }, { status: 500 })
  }
}
