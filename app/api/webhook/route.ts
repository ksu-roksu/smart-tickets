import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";
import { sendTicketEmail } from "@/app/lib/email";
import { randomUUID } from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { ticketTypeId, quantity } = session.metadata!;

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: { event: { include: { venue: true } } },
    });

    if (!ticketType) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const qrCode = randomUUID();

  const order = await prisma.order.create({
      data: {
        totalAmount: Number(ticketType.price) * Number(quantity),
        currency: "KZT",
        status: "PAID",
        stripeId: session.id,
        tickets: {
          create: Array.from({ length: Number(quantity) }).map(() => ({
            ticketTypeId,
            qrCode: randomUUID(),
            status: "VALID",
          })),
        },
      },
    });

    await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: { soldSeats: { increment: Number(quantity) } },
    });

    // Отправляем email с билетом
    console.log("Customer email:", session.customer_details?.email);
console.log("Order created:", order.id);
    if (session.customer_details?.email) {
      const eventDate = new Date(ticketType.event.date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      await sendTicketEmail({
        to: session.customer_details.email,
        eventTitle: ticketType.event.title,
        eventDate,
        venueName: `${ticketType.event.venue.name}, ${ticketType.event.venue.city}`,
        ticketType: ticketType.name,
        qrCode,
        orderId: order.id,
      });
    }

    console.log(`✅ Order ${order.id} created, email sent`);
  }

  return NextResponse.json({ received: true });
}