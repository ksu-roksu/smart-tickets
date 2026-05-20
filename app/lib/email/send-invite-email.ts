export async function sendInviteEmail({
  to,
  name,
  inviteLink,
}: {
  to: string
  name?: string | null
  inviteLink: string
}) {
  console.log('[invite email mock]', {
    to,
    name,
    inviteLink,
  })

  return { success: true }
}