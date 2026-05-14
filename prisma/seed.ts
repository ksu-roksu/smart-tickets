// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TOTAL_EVENTS = 2000;
const BATCH_SIZE = 250;

const CITIES = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Караганда',
  'Актау',
  'Атырау',
  'Павлодар',
  'Тараз',
];

type CategoryKey =
  | 'concert'
  | 'theatre'
  | 'sport'
  | 'kids'
  | 'exhibition'
  | 'standup'
  | 'festival';

const CATEGORY_DATA: Record<CategoryKey, {
  titles: string[];
  tags: string[];
  images: string[];
  venues: string[];
}> = {
  concert: {
    titles: [
      'Димаш Кудайберген',
      'Ricky Martin',
      'Megadeth',
      'Enrique Iglesias',
      'Thirty Seconds to Mars',
      'Jah Khalib',
      'Moldanazar',
      'Zivert',
      'Imagine Dragons Tribute',
      'Almaty Jazz Night',
      'Electro Live Show',
      'Summer Music Night',
    ],
    tags: ['music', 'live', 'pop', 'rock', 'edm', 'kz', 'world', 'vip', 'party'],
    images: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    ],
    venues: ['Arena', 'Stadium', 'Music Hall'],
  },
  theatre: {
    titles: [
      'Гамлет',
      'Лебединое озеро',
      'Щелкунчик',
      'Анна Каренина',
      'Мастер и Маргарита',
      'Король Лир',
      'Ромео и Джульетта',
      'Абай',
      'Қыз Жібек',
      'Евгений Онегин',
    ],
    tags: ['drama', 'comedy', 'musical', 'ballet', 'opera', 'premiere', 'classic', 'culture'],
    images: [
      'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80',
      'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1200&q=80',
    ],
    venues: ['Театр', 'Opera House', 'Drama Hall'],
  },
  sport: {
    titles: [
      'ФК Кайрат — ФК Астана',
      'ФК Ордабасы — ФК Кайрат',
      'UFC Fight Night',
      'Almaty Marathon',
      'Basketball Cup',
      'Hockey Night',
      'Boxing Grand Prix',
      'Astana Open',
      'Triathlon Race',
    ],
    tags: ['football', 'mma', 'boxing', 'hockey', 'basketball', 'marathon', 'derby', 'esports', 'sport'],
    images: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80',
      'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&q=80',
    ],
    venues: ['Central Stadium', 'Sport Arena', 'Fight Club'],
  },
  kids: {
    titles: [
      'Шрек — Мюзикл',
      'Снежная королева',
      'Щенячий патруль',
      'Холодное сердце',
      'Magic Kids Show',
      'Цирковое шоу',
      'Научное шоу',
      'Детский мастер-класс',
      'Кукольный театр',
    ],
    tags: ['age0', 'age3', 'age6', 'age12', 'circus', 'musical', 'workshop', 'free', 'family', 'kids'],
    images: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80',
      'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1200&q=80',
    ],
    venues: ['Kids Hall', 'Family Center', 'Theatre Kids'],
  },
  exhibition: {
    titles: [
      'Nomad Spirit',
      'Digital Art Expo',
      'Photo Exhibition',
      'Modern Kazakhstan',
      'History Museum Night',
      'Immersive Art',
      'Kazakh Fashion Week',
      'КітапФест',
    ],
    tags: ['art', 'photo', 'history', 'immersive', 'new', 'free', 'culture', 'gallery'],
    images: [
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
    ],
    venues: ['Gallery', 'Museum', 'Expo Center'],
  },
  standup: {
    titles: [
      'Stand Up Night',
      'Жасай и Friends',
      'Open Mic',
      'Ночь стендапа',
      'Comedy Club',
      'Black Humor Night',
      'Kazakhstan Stand Up',
      'Late Night Humor',
    ],
    tags: ['dark', 'openmic', 'popular', 'kz', 'new', '18plus', 'funny'],
    images: [
      'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=1200&q=80',
    ],
    venues: ['Comedy Hall', 'Bar Stage', 'Congress Hall'],
  },
  festival: {
    titles: [
      'Park Live',
      'Street Food Festival',
      'Рахат Fest',
      'Open Air Weekend',
      'City Celebration',
      'Summer Festival',
      'Halloween Fest',
      'Family Weekend',
      'Food Market',
    ],
    tags: ['music', 'food', 'culture', 'outdoor', 'family', 'free', 'festival', 'party'],
    images: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
    ],
    venues: ['Open Air Park', 'City Square', 'Festival Ground'],
  },
};

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickTags(tags: string[]): string[] {
  const shuffled = [...tags].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, randomInt(2, Math.min(5, tags.length)));
}

function futureDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + randomInt(1, 330));
  d.setHours(randomInt(10, 22), random([0, 15, 30, 45]), 0, 0);
  return d;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function main() {
  console.log('🌱 START SEED');

await prisma.$executeRawUnsafe(`
  TRUNCATE TABLE
    "Ticket",
    "Order",
    "TicketType",
    "Event",
    "Venue"
  RESTART IDENTITY CASCADE;
`);

  const venues: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    capacity: number;
  }[] = [];

  let venueIndex = 1;

  for (const city of CITIES) {
    for (let i = 1; i <= 12; i++) {
      const category = random(Object.keys(CATEGORY_DATA) as CategoryKey[]);
      const venueName = random(CATEGORY_DATA[category].venues);

      venues.push({
        id: `venue_${venueIndex}`,
        name: `${city} ${venueName} ${i}`,
        address: `ул. Центральная, ${i}`,
        city,
        country: 'KZ',
        capacity: randomInt(300, 50000),
      });

      venueIndex++;
    }
  }

  await prisma.venue.createMany({
    data: venues,
  });

  console.log(`✅ ${venues.length} venues created`);

  const categories = Object.keys(CATEGORY_DATA) as CategoryKey[];

  const events: any[] = [];
  const ticketTypes: any[] = [];

  for (let i = 1; i <= TOTAL_EVENTS; i++) {
    const category = random(categories);
    const cfg = CATEGORY_DATA[category];
    const city = random(CITIES);
    const cityVenues = venues.filter((v) => v.city === city);
    const venue = random(cityVenues);

    const tags = pickTags(cfg.tags);

    if (category === 'kids') {
      if (!tags.some((t) => ['age0', 'age3', 'age6', 'age12'].includes(t))) {
        tags.push(random(['age0', 'age3', 'age6', 'age12']));
      }
    }

    if (category === 'festival' || category === 'sport') {
      if (!tags.includes('outdoor') && Math.random() > 0.35) tags.push('outdoor');
    }

    const isFree = tags.includes('free') || Math.random() < 0.05;
    const isOutdoor = tags.includes('outdoor');
    const eventId = `event_${i}`;

    const title = `${random(cfg.titles)} ${city} #${i}`;

    let ageMin: number | null = null;
    let ageMax: number | null = null;

    if (category === 'kids') {
      if (tags.includes('age0')) {
        ageMin = 0;
        ageMax = 3;
      } else if (tags.includes('age3')) {
        ageMin = 3;
        ageMax = 6;
      } else if (tags.includes('age6')) {
        ageMin = 6;
        ageMax = 12;
      } else if (tags.includes('age12')) {
        ageMin = 12;
        ageMax = null;
      }
    }

    events.push({
      id: eventId,
      title,
      description: `${title}. Категория: ${category}. Город: ${city}. Теги: ${tags.join(', ')}.`,
      category,
      tags,
      date: futureDate(),
      doorsOpen: null,
      ageMin,
      ageMax,
      durationMin: category === 'kids' ? randomInt(45, 120) : randomInt(60, 240),
      isOutdoor,
      isFeatured: i <= 30 || Math.random() < 0.04,
      venueId: venue.id,
      imageUrl: random(cfg.images),
      coverUrl: random(cfg.images),
      status: 'PUBLISHED',
      slug: `event-${i}-${category}-${city.toLowerCase()}`,
    });

    const ticketCount = randomInt(1, 4);

    for (let t = 1; t <= ticketCount; t++) {
      const totalSeats = randomInt(50, 8000);
      const soldSeats = randomInt(0, Math.floor(totalSeats * 0.96));

      ticketTypes.push({
        id: `ticket_type_${i}_${t}`,
        eventId,
        name:
          t === 1
            ? isFree
              ? 'Вход свободный'
              : 'Стандарт'
            : t === 2
              ? 'VIP'
              : t === 3
                ? 'Fan Zone'
                : 'Premium',
        price: isFree ? 0 : randomInt(1000, 150000),
        currency: 'KZT',
        totalSeats,
        soldSeats,
      });
    }
  }

  for (const [index, batch] of chunk(events, BATCH_SIZE).entries()) {
    await prisma.event.createMany({
      data: batch,
    });

    console.log(`✅ Events batch ${index + 1}/${Math.ceil(events.length / BATCH_SIZE)}`);
  }

  for (const [index, batch] of chunk(ticketTypes, BATCH_SIZE).entries()) {
    await prisma.ticketType.createMany({
      data: batch,
    });

    console.log(`✅ Tickets batch ${index + 1}/${Math.ceil(ticketTypes.length / BATCH_SIZE)}`);
  }

  console.log(`🎉 DONE: ${events.length} events, ${ticketTypes.length} ticket types`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });