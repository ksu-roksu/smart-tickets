import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-8 py-12 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-3">Оплата прошла!</h1>
        <p className="text-white/60 mb-10">
          Ваш билет готов. Покажите QR-код на входе.
        </p>
        <div className="border border-white/20 rounded-2xl p-8 mb-8 bg-white/5">
          <div className="text-sm text-white/40 font-mono break-all mb-4">
            ID: {session_id?.slice(0, 32)}
          </div>
          <div className="text-white/60 text-sm">
            QR-код будет отправлен на вашу почту
          </div>
        </div>
        <Link
          href="/events"
          className="inline-block border border-white/20 text-white px-6 py-3 rounded-full hover:border-white/40 transition text-sm"
        >
          Смотреть другие события
        </Link>
      </div>
    </main>
  );
}
