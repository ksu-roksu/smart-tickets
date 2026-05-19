import { prisma } from '@/lib/prisma'

type SafeAuditLogInput = {
  actorUserId?: string | null
  actorPlatformId?: string | null
  actorRole?: string | null
  organizationId?: string | null
  action: string
  entityType: string
  entityId: string
  before?: unknown
  after?: unknown
  metadata?: unknown
}

export async function safeAuditLog(input: SafeAuditLogInput) {
  console.log('AUDIT TRY:', JSON.stringify(input, null, 2))

  try {
    const created = await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        actorPlatformId: input.actorPlatformId ?? null,
        actorRole: input.actorRole ?? null,
        organizationId: input.organizationId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before as any,
        after: input.after as any,
        metadata: input.metadata as any,
      },
    })

    console.log('AUDIT CREATED:', created.id)
  } catch (error) {
    console.error('AUDIT FAILED FULL:')
    console.error(error)
  }
}