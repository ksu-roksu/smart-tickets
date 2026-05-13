import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketEmail({
  to,
  eventTitle,
  eventDate,
  venueName,
  ticketType,
  qrCode,
  orderId,
}: {
  to: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  ticketType: string;
  qrCode: string;
  orderId: string;
}) {
  await resend.emails.send({
    from: "Smart Tickets <onboarding@resend.dev>",
    to,
    subject: `Ваш билет на ${eventTitle}`,
    html: `
      <div style="max-width:480px;margin:40px auto;font-family:-apple-system,sans-serif;background:#111;border-radius:16px;overflow:hidden;">
        <div style="background:#000;padding:32px;">
          <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Smart Tickets</p>
          <h1 style="margin:8px 0 0;color:#fff;font-size:24px;">${eventTitle}</h1>
        </div>
        <div style="padding:32px;border-top:1px solid #222;border-bottom:1px solid #222;">
          <p style="margin:0;color:#666;font-size:12px;">ДАТА</p>
          <p style="margin:4px 0 16px;color:#fff;">${eventDate}</p>
          <p style="margin:0;color:#666;font-size:12px;">МЕСТО</p>
          <p style="margin:4px 0 16px;color:#fff;">${venueName}</p>
          <p style="margin:0;color:#666;font-size:12px;">ТИП БИЛЕТА</p>
          <p style="margin:4px 0 0;color:#fff;">${ticketType}</p>
        </div>
        <div style="padding:32px;text-align:center;border-bottom:1px solid #222;">
          <p style="margin:0 0 16px;color:#666;font-size:12px;text-transform:uppercase;">Покажите на входе</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode}&bgcolor=ffffff&color=000000" width="200" height="200" style="border-radius:8px;" />
          <p style="margin:16px 0 0;color:#444;font-size:11px;font-family:monospace;">${qrCode.slice(0, 16)}...</p>
        </div>
        <div style="padding:24px 32px;">
          <p style="margin:0;color:#444;font-size:12px;">Заказ #${orderId.slice(0, 8).toUpperCase()}<br>Сохраните это письмо.</p>
        </div>
      </div>
    `,
  });
}