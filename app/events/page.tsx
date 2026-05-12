import Link from "next/link";

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Dimash Qudaibergen",
    date: "15 июня 2025",
    venue: "Алматы Арена",
    city: "Алматы",
    category: "Концерт",
    price: "15 000",
    image: "🎤",
  },
  {
    id: "2",
    title: "Imagine Dragons",
    date: "22 июля 2025",
    venue: "Национальный стадион",
    city: "Астана",
    category: "Концерт",
    price: "25 000",
    image: "🎸",
  },
  {
    id: "3",
    title: "Футбол: Казахстан — Турция",
    date: "10 июня 2025",
    venue: "Центральный стадион",
    city: "Алматы",
    category: "Спорт",
    price: "5 000",
    image: "⚽",
  },
  {
    id: "4",
    title: "Stand Up: Нурлан Сабуров",
    date: "5 июня 2025",
    venue: "Театр им. Ауэзова",
    city: "Алматы",
    category: "Концерт",
    price: "8 000",
    image: "🎭",
  },
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Навигация */}
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

        {/* Фильтры */}
        <div className="flex gap-3 mb-10">
          {["Все", "Концерты", "Спорт", "Кино"].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                filter === "Все"
                  ? "bg-white text-black border-white"
                  : "border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Сетка событий */}
        <div className="grid grid-cols-2 gap-6">
          {MOCK_EVENTS.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="border border-white/10 rounded-2xl p-6 hover:border-white/30 transition cursor-pointer group">
                <div className="text-5xl mb-4">{event.image}</div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-2">
                  {event.category} · {event.city}
                </div>
                <h2 className="text-xl font-bold mb-1 group-hover:text-white/80 transition">
                  {event.title}
                </h2>
                <p className="text-white/40 text-sm mb-4">
                  {event.date} · {event.venue}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">
                    от {event.price} ₸
                  </span>
                  <span className="text-sm text-white/40 group-hover:text-white/60 transition">
                    Купить →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}