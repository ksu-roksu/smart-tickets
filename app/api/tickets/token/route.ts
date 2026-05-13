import { NextRequest, NextResponse } from "next/server";
import { generateTicketToken, getTokenExpiresIn } from "@/app/lib/qr";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const ticketId = req.nextUrl.searchParams.get("ticketId");

  if (!ticketId) {
    return NextResponse.json({ error: "ticketId required" }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      ticketType: {
        include: {
          event: { include: { venue: true } }
        }
      }
    }
  });

  if (!ticket) {
    return NextResponse.json({ error: "Билет не найден" }, { status: 404 });
  }

  if (ticket.status !== "VALID") {
    return NextResponse.json({ error: "Билет недействителен" }, { status: 400 });
  }

  const token = generateTicketToken(ticket.id);
  const expiresIn = getTokenExpiresIn();

  return NextResponse.json({
    token,
    expiresIn,
    ticket: {
      id: ticket.id,
      eventTitle: ticket.ticketType.event.title,
      ticketType: ticket.ticketType.name,
      venue: ticket.ticketType.event.venue.name,
      date: ticket.ticketType.event.date,
      status: ticket.status,
    }
  });
}