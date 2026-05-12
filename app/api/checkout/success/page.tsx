import Link from "next/link";
import QRCode from "react-qr-code";

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
          <div className="bg-white p-4 rounded-xl inline-block mb-6">
            <QRCode
              value={session_id || "smart-tickets-qr"}
              size={180}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <div className="text-sm text-white/40 font-mono break-all">
            {session_id?.slice(0, 24)}...
          </div>
        </div>

        <Link
          href="/events"
          className="w-full border border-white/20 text-white px-6 py-3 rounded-full hover:border-white/40 transition text-sm"
        >
          Смотреть другие события
        </Link>
      </div>
    </main>
  );
}