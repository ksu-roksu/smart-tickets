// app/dashboard/settings/audit/page.tsx
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/require-auth'
import AuditLogClient from './AuditLogClient'

export default async function AuditLogPage() {
  const ctx = await requirePermission('audit:view')

  const logs = await prisma.auditLog.findMany({
    where: ctx.isPlatformUser
      ? {}
      : { organizationId: ctx.organizationId ?? '__none__' },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      actorUser: { select: { name: true, email: true } },
      actorPlatform: { select: { name: true, email: true } },
    },
  })

  const mapped = logs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    actorName: log.actorUser?.name ?? log.actorPlatform?.name ?? 'Система',
    actorEmail: log.actorUser?.email ?? log.actorPlatform?.email ?? '',
    actorRole: log.actorRole ?? '',
    before: log.before as Record<string, unknown> | null,
    after: log.after as Record<string, unknown> | null,
    metadata: log.metadata as Record<string, unknown> | null,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt.toISOString(),
  }))

  return <AuditLogClient logs={mapped} isPlatformUser={ctx.isPlatformUser} />
}