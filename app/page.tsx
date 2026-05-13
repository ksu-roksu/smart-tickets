import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function Home() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: { venue: true, ticketTypes: true },
    orderBy: { date: "asc" },
    take: 6,
  });

  const totalSold = await prisma.ticket.count({ where: { status: "VALID" } });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Навигация */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tighter">Smart<span className="text-[#FF4D00]">Tickets</span></span>
        </div>
        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-1 py-1">
          {["Алматы", "Астана", "Шымкент"].map((city) => (
            <button key={city} className={`px-4 py-1.5 rounded-full text-sm transition ${city === "Алматы" ? "bg-white text-black font-medium" : "text-white/50 hover:text-white"}`}>
              {city}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition">Мои билеты</Link>
          <Link href="/sign-in" className="text-sm bg-[#FF4D00] text-white px-4 py-2 rounded-full hover:bg-[#FF4D00]/80 transition font-medium">
            Войти
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-[#FF4D00] rounded-full animate-pulse"/>
            <span className="text-sm text-[#FF4D00] font-medium">{totalSold} билетов куплено сегодня</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            Лучшие события<br/>
            <span className="text-white/20">Казахстана</span>
          </h1>

          {/* Поиск */}
          <div className="flex gap-2 max-w-xl">
            <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-white/30 transition">
              <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Концерт, театр, спорт..."
                className="bg-transparent text-white placeholder-white/20 outline-none flex-1 text-sm"
              />
            </div>
            <Link href="/events" className="bg-[#FF4D00] text-white px-6 py-3 rounded-2xl font-medium hover:bg-[#FF4D00]/80 transition text-sm whitespace-nowrap">
              Найти →
            </Link>
          </div>
        </div>

        {/* Mood filter */}
        <div className="mb-10">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Какое настроение?</p>
          <div className="flex flex-wrap gap-2">
            {[
              { emoji: "🔥", label: "Зажечь" },
              { emoji: "😌", label: "Спокойно" },
              { emoji: "👨‍👩‍👧", label: "С семьёй" },
              { emoji: "💫", label: "Свидание" },
              { emoji: "🎉", label: "Праздник" },
              { emoji: "🎭", label: "Культура" },
            ].map((mood) => (
              <Link key={mood.label} href="/events" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full px-4 py-2 text-sm transition">
                <span>{mood.emoji}</span>
                <span className="text-white/70">{mood.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Главная карточка */}
          {events[0] && (
            <Link href={`/events/${events[0].id}`} className="md:col-span-2 relative rounded-3xl overflow-hidden group cursor-pointer min-h-[320px] flex flex-col justify-end p-6"
              style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
              <div className="absolute top-4 right-4">
                <span className="bg-[#FF4D00] text-white text-xs px-3 py-1 rounded-full font-medium">🔥 Хит продаж</span>
              </div>
              <div className="relative z-10">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                  {events[0].venue.city} · {new Date(events[0].date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                </p>
                <h2 className="text-3xl font-black tracking-tight mb-3">{events[0].title}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-white/60 text-sm">{events[0].venue.name}</span>
                  {events[0].ticketTypes.length > 0 && (
                    <span className="bg-white/10 text-white text-sm px-3 py-1 rounded-full">
                      от {Math.min(...events[0].ticketTypes.map(t => Number(t.price))).toLocaleString("ru-RU")} ₸
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="bg-white text-black text-sm px-5 py-2 rounded-full font-medium group-hover:bg-white/90 transition">
                    Купить билет
                  </span>
                  {events[0].ticketTypes.length > 0 && (
                    <span className="text-white/40 text-xs">
                      ⚡ Осталось {events[0].ticketTypes.reduce((a, t) => a + (t.totalSeats - t.soldSeats), 0)} мест
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Боковые карточки */}
          <div className="flex flex-col gap-4">
            {events[1] && (
              <Link href={`/events/${events[1].id}`} className="relative rounded-3xl overflow-hidden group cursor-pointer flex-1 min-h-[148px] flex flex-col justify-end p-5"
                style={{ background: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)" }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                <div className="relative z-10">
                  <p className="text-white/50 text-xs mb-1">{events[1].venue.city}</p>
                  <h3 className="font-bold text-base leading-tight">{events[1].title}</h3>
                  <p className="text-white/40 text-xs mt-1">{new Date(events[1].date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</p>
                </div>
              </Link>
            )}
            {events[2] && (
              <Link href={`/events/${events[2].id}`} className="relative rounded-3xl overflow-hidden group cursor-pointer flex-1 min-h-[148px] flex flex-col justify-end p-5"
                style={{ background: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)" }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                <div className="relative z-10">
                  <p className="text-white/50 text-xs mb-1">{events[2].venue.city}</p>
                  <h3 className="font-bold text-base leading-tight">{events[2].title}</h3>
                  <p className="text-white/40 text-xs mt-1">{new Date(events[2].date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</p>
                </div>
              </Link>
            )}
          </div>

          {/* Live статистика */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              <span className="text-xs text-white/40 uppercase tracking-widest">Прямо сейчас</span>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: "Концерты", count: 847, color: "#FF4D00", pct: 75 },
                { label: "Театр", count: 312, color: "#8B5CF6", pct: 40 },
                { label: "Спорт", count: 198, color: "#10B981", pct: 25 },
              ].map((cat) => (
                <div key={cat.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">{cat.label}</span>
                    <span className="text-white/40">{cat.count} продаж</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, background: cat.color }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Остальные события */}
          {events.slice(3, 6).map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}
              className="rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 p-5 flex flex-col justify-between group transition">
              <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-2">{event.venue.city}</p>
                <h3 className="font-bold text-base mb-1 group-hover:text-white/80 transition">{event.title}</h3>
                <p className="text-white/40 text-xs">{event.venue.name}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium">
                  {event.ticketTypes.length > 0
                    ? `от ${Math.min(...event.ticketTypes.map(t => Number(t.price))).toLocaleString("ru-RU")} ₸`
                    : "Цена уточняется"}
                </span>
                <span className="text-white/20 group-hover:text-white/50 transition text-sm">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/events" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white px-8 py-4 rounded-full transition text-sm">
            Все события →
          </Link>
        </div>
      </section>
    </main>
  );
}