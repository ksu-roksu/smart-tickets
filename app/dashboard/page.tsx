import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  // Ищем заказы по stripeId — временно показываем последние заказы
  const recentOrders = await prisma.order.findMany({
    where: { status: "PAID" },
    include: {
      tickets: {
        include: {
          ticketType: {
            include: {
              event: {
                include: { venue: true }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 10,
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
          <Link href="/dashboard/organizer" className="text-sm text-white/60 hover:text-white transition">
            Панель организатора
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">
          Привет, {user?.firstName || "гость"}!
        </h1>
        <p className="text-white/40 mb-10">Ваши билеты и заказы</p>

        {recentOrders.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl">
            <p className="text-white/40 mb-4">У вас пока нет билетов</p>
            <Link
              href="/events"
              className="inline-block bg-white text-black px-6 py-3 rounded-full text-sm hover:bg-white/90 transition"
            >
              Смотреть события
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="border border-white/10 rounded-2xl p-6 hover:border-white/20 transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-white/40 font-mono">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    Оплачено
                  </span>
                </div>
                {order.tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ticket.ticketType.event.title}</p>
                      <p className="text-sm text-white/40">
                        {ticket.ticketType.name} · {ticket.ticketType.event.venue.name}
                      </p>
                      <p className="text-sm text-white/40">
                        {new Date(ticket.ticketType.event.date).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {Number(ticket.ticketType.price).toLocaleString("ru-RU")} ₸
                      </p>
                      <span className="text-xs text-green-400">
                        {ticket.status === "VALID" ? "✓ Действителен" : ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
