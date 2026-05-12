import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: {
      venue: true,
      ticketTypes: true,
    },
    orderBy: { date: "asc" },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Smart Tickets
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/events" className="text-sm text-white/60 hover:text-white transition">
            События
          </Link>
          <Link href="/sign-in" className="text-sm bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition">
            Войти
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">События</h1>
        <p className="text-white/40 mb-10">Концерты, спорт и развлечения в Казахстане</p>

        <div className="grid grid-cols-2 gap-6">
          {events.map((event) => {
            const minPrice = event.ticketTypes.length > 0
              ? Math.min(...event.ticketTypes.map((t) => Number(t.price)))
              : null;

            const dateStr = new Date(event.date).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="border border-white/10 rounded-2xl p-6 hover:border-white/30 transition cursor-pointer group">
                  <div className="text-5xl mb-4">{event.imageUrl}</div>
                  <div className="text-xs text-white/40 uppercase tracking-widest mb-2">
                    {event.venue.city}
                  </div>
                  <h2 className="text-xl font-bold mb-1 group-hover:text-white/80 transition">
                    {event.title}
                  </h2>
                  <p className="text-white/40 text-sm mb-4">
                    {dateStr} · {event.venue.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {minPrice ? `от ${minPrice.toLocaleString("ru-RU")} ₸` : "Цена уточняется"}
                    </span>
                    <span className="text-sm text-white/40 group-hover:text-white/60 transition">
                      Купить →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}