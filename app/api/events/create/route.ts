import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { title, description, date, doorsOpen, venueName, venueAddress, venueCity, imageUrl, ticketTypes } = await req.json();
    const venue = await prisma.venue.create({
      data: { name: venueName, address: venueAddress || "", city: venueCity, country: "KZ" },
    });
    const event = await prisma.event.create({
      data: {
        title, description,
        date: new Date(date),
        doorsOpen: doorsOpen ? new Date(doorsOpen) : null,
        venueId: venue.id,
        imageUrl: imageUrl || "🎤",
        status: "PUBLISHED",
        ticketTypes: {
          create: ticketTypes.map((t: { name: string; price: string; totalSeats: string }) => ({
            name: t.name,
            price: parseFloat(t.price),
            currency: "KZT",
            totalSeats: parseInt(t.totalSeats),
            soldSeats: 0,
          })),
        },
      },
    });
    return NextResponse.json({ id: event.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
