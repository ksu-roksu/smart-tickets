import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orgId = 'cmp6wdho60001dewwizhl46dn'

  await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: {
      id: orgId,
      slug: 'smart-kazakhstan',
      name: 'Smart Kazakhstan',
      status: 'ACTIVE',
      tier: 'PRO',
      kybStatus: 'APPROVED',
    },
  })
  console.log('✅ Organization created')

  const updated = await prisma.event.updateMany({
    where: { organizationId: null },
    data: { organizationId: orgId },
  })
  console.log(`✅ Updated ${updated.count} events`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())