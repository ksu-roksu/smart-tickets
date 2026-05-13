import { NextRequest, NextResponse } from "next/server";
import { verifyTicketToken } from "@/app/lib/qr";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ valid: false, error: "Токен не передан" }, { status: 400 });
  }

  // Извлекаем ticketId из токена ST-{ticketId}-{code}
  const parts = token.split("-");
  if (parts.length < 3 || parts[0] !== "ST") {
    return NextResponse.json({ valid: false, error: "Неверный формат" }, { status: 400 });
  }

  // ticketId это всё между ST- и последними 6 символами
  const ticketId = parts.slice(1, -1).join("-");
  const isValid = verifyTicketToken(ticketId, token);

  if (!isValid) {
    return NextResponse.json({ valid: false, error: "Токен устарел или неверен" });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      ticketType: {
        include: { event: { include: { venue: true } } }
      }
    }
  });

  if (!ticket || ticket.status !== "VALID") {
    return NextResponse.json({ valid: false, error: "Билет недействителен или уже использован" });
  }

  // Отмечаем билет как использованный
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "USED" }
  });

  return NextResponse.json({
    valid: true,
    ticket: {
      eventTitle: ticket.ticketType.event.title,
      ticketType: ticket.ticketType.name,
      venue: ticket.ticketType.event.venue.name,
    }
  });
}