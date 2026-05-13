import Link from "next/link";

export default function Home() {
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
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition">
            Мои билеты
          </Link>
          <Link href="/dashboard/organizer" className="text-sm text-white/60 hover:text-white transition">
            Организатор
          </Link>
          <Link href="/sign-in" className="text-sm bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition">
            Войти
          </Link>
        </div>
      </nav>

      <section className="px-8 py-24 max-w-4xl mx-auto">
        <p className="text-sm text-white/40 uppercase tracking-widest mb-4">
          Smart Kazakhstan
        </p>
        <h1 className="text-6xl font-bold leading-tight mb-6">
          Билеты на лучшие<br />события Казахстана
        </h1>
        <p className="text-xl text-white/60 mb-10 max-w-xl">
          Концерты, спорт, кино — покупай билеты онлайн за несколько секунд.
        </p>
        <Link
          href="/events"
          className="inline-block bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-white/90 transition"
        >
          Смотреть события →
        </Link>
      </section>

      <section className="px-8 py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Категории</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "Концерты", emoji: "🎵", count: "12 событий" },
              { name: "Спорт", emoji: "⚽", count: "8 событий" },
              { name: "Кино", emoji: "🎬", count: "24 события" },
            ].map((cat) => (
              <div
                key={cat.name}
                className="border border-white/10 rounded-2xl p-6 hover:border-white/30 transition cursor-pointer"
              >
                <div className="text-3xl mb-3">{cat.emoji}</div>
                <div className="font-medium">{cat.name}</div>
                <div className="text-sm text-white/40 mt-1">{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}