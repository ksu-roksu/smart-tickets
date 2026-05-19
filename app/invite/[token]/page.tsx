// app/invite/[token]/page.tsx
import crypto from 'crypto'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import InviteAcceptClient from './InviteAcceptClient'

interface Props {
  params: { token: string }
}

export default async function InvitePage({ params }: Props) {
  const { token } = params
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const member = await prisma.organizationMember.findFirst({
    where: { inviteTokenHash: tokenHash },
    include: { organization: true, user: true },
  })

  // Инвайт не найден
  if (!member) {
    return (
      <InviteAcceptClient
        state="invalid"
        orgName={null}
        role={null}
        token={token}
      />
    )
  }

  // Инвайт истёк
  if (member.inviteExpiresAt && member.inviteExpiresAt < new Date()) {
    return (
      <InviteAcceptClient
        state="expired"
        orgName={member.organization.name}
        role={member.role}
        token={token}
      />
    )
  }

  // Инвайт уже принят или отозван
  if (member.status !== 'INVITED') {
    return (
      <InviteAcceptClient
        state="already_used"
        orgName={member.organization.name}
        role={member.role}
        token={token}
      />
    )
  }

  // Проверяем залогинен ли пользователь
  const { userId: clerkId } = await auth()

  return (
    <InviteAcceptClient
      state="valid"
      orgName={member.organization.name}
      role={member.role}
      token={token}
      isAuthenticated={!!clerkId}
      invitedEmail={member.user.email}
    />
  )
}