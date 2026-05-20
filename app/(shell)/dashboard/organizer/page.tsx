import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function OrganizerPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const events = await prisma.event.findMany({
    include: {
      venue: true,
      ticketTypes: true,
    },
    orderBy: { date: "asc" },
  });

  const totalSold = events.reduce((acc, event) =>
    acc + event.ticketTypes.reduce((a, t) => a + t.soldSeats, 0), 0
  );

  const totalRevenue = events.reduce((acc, event) =>
    acc + event.ticketTypes.reduce((a, t) => a + (t.soldSeats * Number(t.price)), 0), 0
  );

  return (
    <main className="min-h-screen bg-black text-[var(--color-text-primary)]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--dash-card-border)]">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Smart Tickets
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition">
            ← Личный кабинет
          </Link>
          <Link
            href="/dashboard/organizer/create"
            className="text-sm bg-white text-black px-4 py-2 rounded-full hover:bg-[var(--color-background-secondary)] transition"
          >
            + Создать событие
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">Панель организатора</h1>
        <p className="text-[var(--color-text-secondary)] mb-10">Smart Kazakhstan</p>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="border border-[var(--dash-card-border)] rounded-2xl p-6">
            <p className="text-[var(--color-text-secondary)] text-sm mb-1">Всего событий</p>
            <p className="text-4xl font-bold">{events.length}</p>
          </div>
          <div className="border border-[var(--dash-card-border)] rounded-2xl p-6">
            <p className="text-[var(--color-text-secondary)] text-sm mb-1">Продано билетов</p>
            <p className="text-4xl font-bold">{totalSold}</p>
          </div>
          <div className="border border-[var(--dash-card-border)] rounded-2xl p-6">
            <p className="text-[var(--color-text-secondary)] text-sm mb-1">Выручка</p>
            <p className="text-4xl font-bold">{totalRevenue.toLocaleString("ru-RU")} ₸</p>
          </div>
        </div>

        {/* Список событий */}
        <h2 className="text-xl font-bold mb-6">События</h2>
        <div className="flex flex-col gap-4">
          {events.map((event) => {
            const sold = event.ticketTypes.reduce((a, t) => a + t.soldSeats, 0);
            const total = event.ticketTypes.reduce((a, t) => a + t.totalSeats, 0);
            const revenue = event.ticketTypes.reduce((a, t) => a + (t.soldSeats * Number(t.price)), 0);
            const percent = total > 0 ? Math.round((sold / total) * 100) : 0;

            return (
              <div key={event.id} className="border border-[var(--dash-card-border)] rounded-2xl p-6 hover:border-[var(--dash-card-border)] transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {new Date(event.date).toLocaleDateString("ru-RU", {
                        day: "numeric", month: "long", year: "numeric"
                      })} · {event.venue.name}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    event.status === "PUBLISHED"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]"
                  }`}>
                    {event.status === "PUBLISHED" ? "Опубликовано" : "Черновик"}
                  </span>
                </div>

                {/* Прогресс бар */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                    <span>Продано {sold} из {total}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--color-background-secondary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Выручка: <span className="text-[var(--color-text-primary)] font-medium">{revenue.toLocaleString("ru-RU")} ₸</span>
                  </span>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
                  >
                    Открыть →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}