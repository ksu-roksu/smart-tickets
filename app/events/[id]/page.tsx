import Link from "next/link";

const MOCK_EVENTS: Record<string, {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  category: string;
  description: string;
  image: string;
  ticketTypes: { name: string; price: string; available: number }[];
}> = {
  "1": {
    id: "1",
    title: "Dimash Qudaibergen",
    date: "15 июня 2025",
    time: "19:00",
    venue: "Алматы Арена",
    city: "Алматы",
    category: "Концерт",
    description: "Грандиозный сольный концерт Димаша Кудайбергена — одного из самых известных казахстанских артистов в мире. Шоу мирового уровня с потрясающим звуком и светом.",
    image: "🎤",
    ticketTypes: [
      { name: "Партер", price: "35 000", available: 120 },
      { name: "Трибуна A", price: "20 000", available: 340 },
      { name: "Трибуна B", price: "15 000", available: 560 },
    ],
  },
  "2": {
    id: "2",
    title: "Imagine Dragons",
    date: "22 июля 2025",
    time: "20:00",
    venue: "Национальный стадион",
    city: "Астана",
    category: "Концерт",
    description: "Легендарная американская рок-группа Imagine Dragons впервые в Казахстане. Грандиозное шоу на открытом стадионе.",
    image: "🎸",
    ticketTypes: [
      { name: "VIP Партер", price: "60 000", available: 50 },
      { name: "Партер", price: "35 000", available: 200 },
      { name: "Трибуна", price: "25 000", available: 800 },
    ],
  },
  "3": {
    id: "3",
    title: "Футбол: Казахстан — Турция",
    date: "10 июня 2025",
    time: "18:00",
    venue: "Центральный стадион",
    city: "Алматы",
    category: "Спорт",
    description: "Отборочный матч чемпионата мира. Сборная Казахстана принимает сборную Турции на Центральном стадионе Алматы.",
    image: "⚽",
    ticketTypes: [
      { name: "VIP ложа", price: "15 000", available: 30 },
      { name: "Сектор A", price: "8 000", available: 400 },
      { name: "Сектор B", price: "5 000", available: 1200 },
    ],
  },
  "4": {
    id: "4",
    title: "Stand Up: Нурлан Сабуров",
    date: "5 июня 2025",
    time: "19:30",
    venue: "Театр им. Ауэзова",
    city: "Алматы",
    category: "Концерт",
    description: "Новая программа Нурлана Сабурова — самого популярного стенд-ап комика Казахстана. Два часа смеха и острых наблюдений.",
    image: "🎭",
    ticketTypes: [
      { name: "Первый ряд", price: "15 000", available: 20 },
      { name: "Партер", price: "10 000", available: 150 },
      { name: "Балкон", price: "8 000", available: 80 },
    ],
  },
};

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = MOCK_EVENTS[id];

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Событие не найдено</p>
          <Link href="/events" className="text-white underline">← Назад к событиям</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Навигация */}
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
        {/* Заголовок */}
        <div className="mb-10">
          <div className="text-6xl mb-6">{event.image}</div>
          <p className="text-sm text-white/40 uppercase tracking-widest mb-3">
            {event.category} · {event.city}
          </p>
          <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
          <div className="flex items-center gap-6 text-white/60">
            <span>📅 {event.date} в {event.time}</span>
            <span>📍 {event.venue}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Описание */}
          <div className="col-span-2">
            <h2 className="text-xl font-bold mb-4">О событии</h2>
            <p className="text-white/60 leading-relaxed">{event.description}</p>
          </div>

          {/* Билеты */}
          <div>
            <h2 className="text-xl font-bold mb-4">Билеты</h2>
            <div className="flex flex-col gap-3">
              {event.ticketTypes.map((ticket) => (
                <div
                  key={ticket.name}
                  className="border border-white/10 rounded-xl p-4 hover:border-white/30 transition"
                >
                  <div className="font-medium mb-1">{ticket.name}</div>
                  <div className="text-white/40 text-xs mb-3">
                    Осталось: {ticket.available}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{ticket.price} ₸</span>
                    <button className="bg-white text-black text-xs px-3 py-1.5 rounded-full hover:bg-white/90 transition">
                      Купить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}