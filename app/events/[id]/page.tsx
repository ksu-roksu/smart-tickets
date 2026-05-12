import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      ticketTypes: true,
    },
  });

  if (!event) notFound();

  const dateStr = new Date(event.date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeStr = new Date(event.date).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Smart Tickets
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/events" className="text-sm text-white/60 hover:text-white transition">
            ← Все события
          </Link>
          <Link href="/sign-in" className="text-sm bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition">
            Войти
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-10">
          <div className="text-6xl mb-6">{event.imageUrl}</div>
          <p className="text-sm text-white/40 uppercase tracking-widest mb-3">
            {event.venue.city}
          </p>
          <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
          <div className="flex items-center gap-6 text-white/60">
            <span>📅 {dateStr} в {timeStr}</span>
            <span>📍 {event.venue.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <h2 className="text-xl font-bold mb-4">О событии</h2>
            <p className="text-white/60 leading-relaxed">{event.description}</p>

            <div className="mt-8 p-4 border border-white/10 rounded-xl">
              <h3 className="text-sm font-medium mb-3">Адрес</h3>
              <p className="text-white/60 text-sm">{event.venue.name}</p>
              <p className="text-white/40 text-sm">{event.venue.address}, {event.venue.city}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Билеты</h2>
            <div className="flex flex-col gap-3">
              {event.ticketTypes.map((ticket) => {
                const available = ticket.totalSeats - ticket.soldSeats;
                return (
                  <div
                    key={ticket.id}
                    className="border border-white/10 rounded-xl p-4 hover:border-white/30 transition"
                  >
                    <div className="font-medium mb-1">{ticket.name}</div>
                    <div className="text-white/40 text-xs mb-3">
                      Осталось: {available}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        {Number(ticket.price).toLocaleString("ru-RU")} ₸
                      </span>
                      <button className="bg-white text-black text-xs px-3 py-1.5 rounded-full hover:bg-white/90 transition">
                        Купить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}