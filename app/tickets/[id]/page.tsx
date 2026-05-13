import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import RotatingQR from "@/app/components/RotatingQR";
import Link from "next/link";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      ticketType: {
        include: {
          event: { include: { venue: true } }
        }
      }
    }
  });

  if (!ticket) notFound();

  const dateStr = new Date(ticket.ticketType.event.date).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = new Date(ticket.ticketType.event.date).toLocaleTimeString("ru-RU", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-tight">Smart Tickets</Link>
        <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition">
          ← Мои билеты
        </Link>
      </nav>

      <div className="max-w-sm mx-auto px-8 py-12">
        {/* Билет */}
        <div className="border border-white/20 rounded-3xl overflow-hidden">
          {/* Шапка */}
          <div className="bg-white/5 px-6 py-5 border-b border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Smart Tickets</p>
            <h1 className="text-xl font-bold">{ticket.ticketType.event.title}</h1>
            <p className="text-sm text-white/60 mt-1">{ticket.ticketType.name}</p>
          </div>

          {/* Инфо */}
          <div className="px-6 py-4 border-b border-white/10 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/40 mb-1">ДАТА</p>
              <p className="text-sm font-medium">{dateStr}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">ВРЕМЯ</p>
              <p className="text-sm font-medium">{timeStr}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-white/40 mb-1">МЕСТО</p>
              <p className="text-sm font-medium">{ticket.ticketType.event.venue.name}</p>
              <p className="text-xs text-white/40">{ticket.ticketType.event.venue.city}</p>
            </div>
          </div>

          {/* QR код — rotating */}
          <div className="px-6 py-6 flex flex-col items-center">
            <RotatingQR ticketId={ticket.id} />
          </div>

          {/* Статус */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/40 font-mono">
              #{ticket.id.slice(0, 8).toUpperCase()}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              ticket.status === "VALID"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {ticket.status === "VALID" ? "✓ Действителен" : ticket.status}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}