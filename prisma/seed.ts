const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const venue1 = await prisma.venue.upsert({
    where: { id: "venue-1" },
    update: {},
    create: {
      id: "venue-1",
      name: "Алматы Арена",
      address: "пр. Сейфуллина, 480",
      city: "Алматы",
      country: "KZ",
      capacity: 12000,
    },
  });

  const venue2 = await prisma.venue.upsert({
    where: { id: "venue-2" },
    update: {},
    create: {
      id: "venue-2",
      name: "Национальный стадион",
      address: "пр. Туран, 57",
      city: "Астана",
      country: "KZ",
      capacity: 30000,
    },
  });

  const venue3 = await prisma.venue.upsert({
    where: { id: "venue-3" },
    update: {},
    create: {
      id: "venue-3",
      name: "Театр им. Ауэзова",
      address: "пр. Абая, 103",
      city: "Алматы",
      country: "KZ",
      capacity: 800,
    },
  });

  const event1 = await prisma.event.upsert({
    where: { id: "event-1" },
    update: {},
    create: {
      id: "event-1",
      title: "Dimash Qudaibergen",
      description: "Грандиозный сольный концерт Димаша Кудайбергена.",
      date: new Date("2025-06-15T19:00:00"),
      doorsOpen: new Date("2025-06-15T18:00:00"),
      venueId: venue1.id,
      status: "PUBLISHED",
      imageUrl: "🎤",
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: "event-2" },
    update: {},
    create: {
      id: "event-2",
      title: "Imagine Dragons",
      description: "Легендарная рок-группа впервые в Казахстане.",
      date: new Date("2025-07-22T20:00:00"),
      doorsOpen: new Date("2025-07-22T18:30:00"),
      venueId: venue2.id,
      status: "PUBLISHED",
      imageUrl: "🎸",
    },
  });

  const event3 = await prisma.event.upsert({
    where: { id: "event-3" },
    update: {},
    create: {
      id: "event-3",
      title: "Stand Up: Нурлан Сабуров",
      description: "Новая программа самого популярного комика Казахстана.",
      date: new Date("2025-06-05T19:30:00"),
      doorsOpen: new Date("2025-06-05T19:00:00"),
      venueId: venue3.id,
      status: "PUBLISHED",
      imageUrl: "🎭",
    },
  });

  await prisma.ticketType.createMany({
    skipDuplicates: true,
    data: [
      { id: "tt-1", eventId: event1.id, name: "Партер", price: 35000, currency: "KZT", totalSeats: 500, soldSeats: 380 },
      { id: "tt-2", eventId: event1.id, name: "Трибуна A", price: 20000, currency: "KZT", totalSeats: 1000, soldSeats: 660 },
      { id: "tt-3", eventId: event1.id, name: "Трибуна B", price: 15000, currency: "KZT", totalSeats: 2000, soldSeats: 1440 },
      { id: "tt-4", eventId: event2.id, name: "VIP Партер", price: 60000, currency: "KZT", totalSeats: 200, soldSeats: 150 },
      { id: "tt-5", eventId: event2.id, name: "Партер", price: 35000, currency: "KZT", totalSeats: 1000, soldSeats: 800 },
      { id: "tt-6", eventId: event2.id, name: "Трибуна", price: 25000, currency: "KZT", totalSeats: 5000, soldSeats: 4200 },
      { id: "tt-7", eventId: event3.id, name: "Первый ряд", price: 15000, currency: "KZT", totalSeats: 50, soldSeats: 30 },
      { id: "tt-8", eventId: event3.id, name: "Партер", price: 10000, currency: "KZT", totalSeats: 300, soldSeats: 150 },
      { id: "tt-9", eventId: event3.id, name: "Балкон", price: 8000, currency: "KZT", totalSeats: 200, soldSeats: 120 },
    ],
  });

  console.log("✅ Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());