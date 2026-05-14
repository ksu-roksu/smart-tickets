// app/events/page.tsx
// Каталог событий — серверный фетч данных + клиентская фильтрация/сортировка

import { Suspense } from 'react';
import { prisma } from '@/app/lib/prisma';
import CatalogClient from '@/app/components/catalog/CatalogClient';

// ─── Server Component — fetches all published events ─────────────────────────

export const revalidate = 60; // ISR: обновляем каждую минуту

async function getEvents() {
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      venue: true,
      ticketTypes: true,
    },
    orderBy: { date: 'asc' },
  });

  // Сериализуем Decimal + Date для клиента
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.category ?? undefined,
    imageUrl: e.imageUrl,
    date: e.date.toISOString(),
    venue: {
      id: e.venue.id,
      name: e.venue.name,
      city: e.venue.city,
      address: e.venue.address,
    },
    ticketTypes: e.ticketTypes.map((tt) => ({
      price: Number(tt.price),
      totalSeats: tt.totalSeats,
      soldSeats: tt.soldSeats,
    })),
  }));
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; category?: string; mood?: string }>;
}) {
  const [events, params] = await Promise.all([getEvents(), searchParams]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CatalogClient
        initialEvents={events}
        initialQuery={params.q ?? ''}
        initialCity={params.city ?? ''}
        initialCategory={params.category ?? ''}
      />
    </Suspense>
  );
}