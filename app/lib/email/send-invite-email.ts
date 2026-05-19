// lib/email/invite-email.tsx
// Шаблон письма-приглашения. Используется из invite/route.ts

export function InviteEmailHtml({
  orgName,
  role,
  inviteLink,
  invitedByName,
  expiresInDays = 7,
}: {
  orgName: string
  role: string
  inviteLink: string
  invitedByName?: string | null
  expiresInDays?: number
}) {
  const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Администратор',
    EVENT_MANAGER: 'Event manager',
    FINANCE: 'Финансы',
    SCANNER: 'Сканер',
    VIEWER: 'Наблюдатель',
  }

  const roleLabel = ROLE_LABELS[role] ?? role
  const inviterText = invitedByName
    ? `${invitedByName} приглашает вас`
    : 'Вас приглашают'

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Приглашение в ${orgName}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#1a1a1a;border-radius:20px;border:1px solid #2a2a2a;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #2a2a2a;">
              <div style="font-size:22px;font-weight:600;color:#ffffff;letter-spacing:-0.3px;">
                🎟 Smart Tickets
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">
                Приглашение в команду
              </p>
              <h1 style="margin:0 0 20px;font-size:24px;font-weight:600;color:#ffffff;line-height:1.3;">
                ${inviterText} присоединиться к&nbsp;<span style="color:#a78bfa;">${orgName}</span>
              </h1>

              <!-- Role card -->
              <div style="background:#252525;border:1px solid #333;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
                <div style="font-size:12px;color:#666;margin-bottom:6px;">Ваша роль</div>
                <div style="display:inline-block;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:20px;padding:4px 12px;font-size:13px;font-weight:500;color:#a5b4fc;">
                  ${roleLabel}
                </div>
              </div>

              <!-- CTA Button -->
              <a href="${inviteLink}"
                style="display:block;background:#ffffff;color:#000000;text-align:center;text-decoration:none;font-size:15px;font-weight:600;padding:14px 24px;border-radius:12px;margin-bottom:20px;">
                Принять приглашение
              </a>

              <!-- Link fallback -->
              <p style="margin:0 0 4px;font-size:12px;color:#555;">
                Или скопируйте ссылку в браузер:
              </p>
              <p style="margin:0;font-size:11px;color:#444;word-break:break-all;">
                ${inviteLink}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2a2a2a;">
              <p style="margin:0;font-size:12px;color:#444;line-height:1.6;">
                Ссылка действительна ${expiresInDays} дней. Если вы не ожидали это письмо — просто проигнорируйте его.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#333;">
                © 2026 Smart Kazakhstan · smart-tickets.kz
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}