import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { ticketTypeId, quantity = 1 } = await req.json();

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: { event: { include: { venue: true } } },
    });

    if (!ticketType) {
      return NextResponse.json({ error: "Билет не найден" }, { status: 404 });
    }

    const available = ticketType.totalSeats - ticketType.soldSeats;
    if (available < quantity) {
      return NextResponse.json({ error: "Недостаточно билетов" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "kzt",
            product_data: {
              name: `${ticketType.event.title} — ${ticketType.name}`,
              description: `${ticketType.event.venue.name}, ${new Date(ticketType.event.date).toLocaleDateString("ru-RU")}`,
            },
            unit_amount: Number(ticketType.price) * 100,
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${ticketType.event.id}`,
      metadata: {
        ticketTypeId,
        quantity: String(quantity),
        eventId: ticketType.event.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}