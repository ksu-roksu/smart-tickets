// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Очищаем в правильном порядке (FK constraints) ──────────────────────────
  await prisma.ticket.deleteMany();
  await prisma.order.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venue.deleteMany();

  // ─── Venues ──────────────────────────────────────────────────────────────────

  const venues = await prisma.venue.createMany({
    data: [
      // Алматы
      { id: 'v1',  name: 'Площадь Астана',              address: 'пр. Достык / ул. Сатпаева',          city: 'Алматы', capacity: 50000 },
      { id: 'v2',  name: 'Первомайские пруды',           address: 'Илийский район, с. Туймебаев',        city: 'Алматы', capacity: 40000 },
      { id: 'v3',  name: 'Almaty Arena',                 address: 'ул. Тимирязева, 42',                  city: 'Алматы', capacity: 22000 },
      { id: 'v4',  name: 'Дворец Республики',            address: 'пр. Достык, 56',                      city: 'Алматы', capacity: 3000  },
      { id: 'v5',  name: 'Центральный стадион',          address: 'пр. Абая, 44',                        city: 'Алматы', capacity: 25000 },
      { id: 'v6',  name: 'Парк Первого Президента',      address: 'ул. Аль-Фараби, 93',                  city: 'Алматы', capacity: 10000 },
      { id: 'v7',  name: 'Театр им. Абая (ГАТОБ)',       address: 'пл. Абая, 1',                         city: 'Алматы', capacity: 900   },
      { id: 'v8',  name: 'Балуан Шолак',                 address: 'ул. Сейфуллина, 28',                  city: 'Алматы', capacity: 5000  },
      { id: 'v9',  name: 'Арбат (ул. Панфилова)',        address: 'ул. Панфилова (пешеходная зона)',      city: 'Алматы', capacity: 20000 },
      { id: 'v10', name: 'Парк им. М. Ганди',            address: 'ул. Фурманова / Гоголя',              city: 'Алматы', capacity: 8000  },
      { id: 'v11', name: 'Озеро Сайран',                 address: 'мкр. Аlatau, западное побережье',     city: 'Алматы', capacity: 15000 },
      { id: 'v12', name: 'Алматинский ипподром',         address: 'ул. Байтерекова, 196',                city: 'Алматы', capacity: 12000 },
      { id: 'v13', name: 'Стадион Спартак',              address: 'ул. Жандосова, 59',                   city: 'Алматы', capacity: 8000  },
      { id: 'v14', name: 'ASP Arena (Конаев)',            address: 'г. Конаев, ул. Алматинская',          city: 'Алматы', capacity: 7000  },
      { id: 'v15', name: 'Парк 28 гвардейцев-панфиловцев', address: 'ул. Гоголя / Панфилова',           city: 'Алматы', capacity: 20000 },
      // Астана
      { id: 'v16', name: 'Барыс Арена',                  address: 'ул. Тауелсіздік, 5',                  city: 'Астана', capacity: 12000 },
      { id: 'v17', name: 'Дворец мира и согласия',       address: 'пр. Мир, 1',                          city: 'Астана', capacity: 2000  },
      { id: 'v18', name: 'Конгресс-холл',                address: 'пр. Мангилик Ел, 55',                 city: 'Астана', capacity: 5000  },
      { id: 'v19', name: 'Площадь перед резиденцией',    address: 'Левый берег, Акорда',                 city: 'Астана', capacity: 30000 },
      // Шымкент
      { id: 'v20', name: 'Стадион Кайрат',               address: 'пр. Тауке хана, 1',                   city: 'Шымкент', capacity: 15000 },
      { id: 'v21', name: 'Центральный парк Шымкента',    address: 'пр. Кунаева',                         city: 'Шымкент', capacity: 10000 },
    ],
  });

  console.log('✅ Venues created');

  // ─── Helper ───────────────────────────────────────────────────────────────────

  type EventSeed = {
    id: string;
    title: string;
    description: string;
    category: string;
    date: Date;
    venueId: string;
    imageUrl: string;
    status: 'PUBLISHED';
    tickets: { name: string; price: number; totalSeats: number; soldSeats: number }[];
  };

  const events: EventSeed[] = [

    // ═══════════════════════════════════════════════════════════════════════════
    // РЕАЛЬНЫЕ СОБЫТИЯ 2026
    // ═══════════════════════════════════════════════════════════════════════════

    // ── Наурыз 2026 (уже прошёл, но оставим как историю — status PUBLISHED) ──
    {
      id: 'e001',
      title: 'Наурыз мейрамы — Главный концерт',
      description: 'Масштабное празднование Наурыза на площади Астана. Концерт с участием Ернара Айдара, группы "Дос-Мұқасан", "KешYOU", световое шоу Dream Light. Более 200 мероприятий по всему городу.',
      category: 'concert',
      date: new Date('2026-03-21T11:00:00+06:00'),
      venueId: 'v1',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Вход свободный', price: 0, totalSeats: 50000, soldSeats: 50000 },
      ],
    },

    // ── КітапФест 2026 ──
    {
      id: 'e002',
      title: 'КітапФест 2026 — Книжный фестиваль',
      description: 'Ежегодный книжный фестиваль на Арбате. 40 издательств, встречи с известными писателями, мастер-классы, юрта Smart Yurt с элементами ИИ. Вход свободный.',
      category: 'exhibition',
      date: new Date('2026-03-21T10:00:00+06:00'),
      venueId: 'v9',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Вход свободный', price: 0, totalSeats: 20000, soldSeats: 18000 },
      ],
    },

    // ── Рахат Fest 2026 ──
    {
      id: 'e003',
      title: 'РАХАТ FEST 2026',
      description: 'Один из самых ярких ежегодных музыкальных фестивалей под открытым небом в Алматы. Открывает летний сезон. Живая музыка, фудкорт, зоны активности для всей семьи. 13:00–22:00.',
      category: 'festival',
      date: new Date('2026-05-23T13:00:00+06:00'),
      venueId: 'v2',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Стандарт',   price: 5000,  totalSeats: 5000,  soldSeats: 3200 },
        { name: 'Комфорт',    price: 12000, totalSeats: 2000,  soldSeats: 1100 },
        { name: 'VIP',        price: 35000, totalSeats: 500,   soldSeats: 280  },
      ],
    },

    // ── Ricky Martin ──
    {
      id: 'e004',
      title: 'Ricky Martin — Live in Almaty',
      description: 'Мировой тур латиноамериканской поп-иконы. Стадион Спартак, Алматы. Один из самых ожидаемых концертов года.',
      category: 'concert',
      date: new Date('2026-07-18T19:00:00+06:00'),
      venueId: 'v13',
      imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Фан-зона',  price: 40000, totalSeats: 3000,  soldSeats: 2700 },
        { name: 'Трибуна A', price: 55000, totalSeats: 2000,  soldSeats: 1400 },
        { name: 'VIP',       price: 90000, totalSeats: 500,   soldSeats: 420  },
      ],
    },

    // ── Park Live Almaty 2026 ──
    {
      id: 'e005',
      title: 'Park Live Almaty 2026 — Gorillaz, Jack White, The Offspring',
      description: 'Крупнейший музыкальный фестиваль Центральной Азии. 3 дня живой музыки мирового уровня. Хедлайнеры: Jack White, Gorillaz, The Offspring. Первомайские пруды, 21–23 августа.',
      category: 'festival',
      date: new Date('2026-08-21T14:00:00+06:00'),
      venueId: 'v2',
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: '1 день',        price: 30000, totalSeats: 15000, soldSeats: 11000 },
        { name: '3 дня (абон.)', price: 65000, totalSeats: 10000, soldSeats: 7800  },
        { name: 'VIP 3 дня',     price: 150000, totalSeats: 1000, soldSeats: 820   },
      ],
    },

    // ── Enrique Iglesias ──
    {
      id: 'e006',
      title: 'Enrique Iglesias — Final World Tour',
      description: 'Легендарный тур прощания Энрике Иглесиаса. Центральный стадион Алматы. "Hero", "Bailamos", "Tonight" — все главные хиты живьём.',
      category: 'concert',
      date: new Date('2026-09-05T20:00:00+06:00'),
      venueId: 'v5',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Фан-зона',  price: 45000, totalSeats: 8000,  soldSeats: 5200 },
        { name: 'Трибуна',   price: 60000, totalSeats: 10000, soldSeats: 6100 },
        { name: 'VIP',       price: 120000, totalSeats: 800,  soldSeats: 650  },
      ],
    },

    // ── Almaty Marathon 2026 ──
    {
      id: 'e007',
      title: 'Almaty Marathon 2026',
      description: 'Самое масштабное беговое событие Центральной Азии. Марафон 42 км, полумарафон 21 км, забег 10 км, скандинавская ходьба. Маршрут по главным улицам у подножия Заилийского Алатау.',
      category: 'sport',
      date: new Date('2026-09-27T08:00:00+06:00'),
      venueId: 'v1',
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Забег 10 км',         price: 20000, totalSeats: 5000,  soldSeats: 3100 },
        { name: 'Полумарафон 21 км',   price: 20000, totalSeats: 3000,  soldSeats: 2200 },
        { name: 'Марафон 42 км',       price: 25000, totalSeats: 2000,  soldSeats: 1700 },
        { name: 'Скандинавская ходьба',price: 17000, totalSeats: 1000,  soldSeats: 600  },
      ],
    },

    // ── Megadeth ──
    {
      id: 'e008',
      title: 'Megadeth — Live in Almaty',
      description: 'Легенды трэш-метала впервые в Казахстане! Стадион Спартак. Культовые треки "Peace Sells", "Symphony of Destruction", "Holy Wars".',
      category: 'concert',
      date: new Date('2026-06-28T17:00:00+06:00'),
      venueId: 'v13',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Фан-зона', price: 40000, totalSeats: 3000, soldSeats: 2100 },
        { name: 'Трибуна',  price: 50000, totalSeats: 3000, soldSeats: 1800 },
        { name: 'VIP',      price: 85000, totalSeats: 500,  soldSeats: 390  },
      ],
    },

    // ── Cirque du Soleil OVO ──
    {
      id: 'e009',
      title: 'Cirque du Soleil — OVO',
      description: 'Культовое шоу мирового цирка о мире насекомых. Almaty Arena. Акробатика, воздушные гимнасты, невероятные декорации и живая музыка.',
      category: 'concert',
      date: new Date('2026-06-10T19:00:00+06:00'),
      venueId: 'v3',
      imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Категория C', price: 25000, totalSeats: 5000, soldSeats: 3800 },
        { name: 'Категория B', price: 45000, totalSeats: 5000, soldSeats: 3200 },
        { name: 'Категория A', price: 70000, totalSeats: 3000, soldSeats: 2100 },
        { name: 'VIP',         price: 120000, totalSeats: 500, soldSeats: 410  },
      ],
    },

    // ── Ленинград (Конаев) ──
    {
      id: 'e010',
      title: 'Ленинград — концерт',
      description: 'Группа Сергея Шнурова с горячим шоу в ASP Arena, Конаев. Все хиты — "Экспонат", "В Питере пить", "Почему ты". Только 18+.',
      category: 'concert',
      date: new Date('2026-06-06T20:00:00+06:00'),
      venueId: 'v14',
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Стандарт', price: 15000, totalSeats: 3000, soldSeats: 2100 },
        { name: 'VIP',      price: 40000, totalSeats: 500,  soldSeats: 380  },
      ],
    },

    // ─── PGL Astana 2026 (CS2) ──
    {
      id: 'e011',
      title: 'PGL Astana 2026 — CS2 Major',
      description: 'Крупнейший киберспортивный турнир по CS2 в Казахстане. Барыс Арена, Астана. Лучшие команды мира борются за титул чемпиона мира.',
      category: 'sport',
      date: new Date('2026-05-15T12:00:00+06:00'),
      venueId: 'v16',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'День 1 (групповой этап)', price: 8000,  totalSeats: 5000, soldSeats: 4200 },
        { name: 'Финальный день',           price: 20000, totalSeats: 5000, soldSeats: 4800 },
        { name: 'Абонемент все дни',        price: 45000, totalSeats: 1000, soldSeats: 870  },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // РЕАЛИСТИЧНЫЕ ТЕСТОВЫЕ СОБЫТИЯ — АЛМАТЫ
    // ═══════════════════════════════════════════════════════════════════════════

    // ── Димаш Кудайберген ──
    {
      id: 'e012',
      title: 'Димаш Кудайберген — Сольный концерт',
      description: 'Главный голос Казахстана возвращается на родную сцену. Almaty Arena. Программа включает новые треки и легендарные "SOS d\'un terrien en détresse", "Sinful".',
      category: 'concert',
      date: new Date('2026-08-03T20:00:00+06:00'),
      venueId: 'v3',
      imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Партер',   price: 35000, totalSeats: 3000, soldSeats: 2980 },
        { name: 'Балкон',   price: 20000, totalSeats: 5000, soldSeats: 4500 },
        { name: 'VIP',      price: 85000, totalSeats: 300,  soldSeats: 292  },
      ],
    },

    // ── Гамлет в ГАТОБ ──
    {
      id: 'e013',
      title: 'Гамлет — ГАТОБ им. Абая',
      description: 'Легендарная трагедия Шекспира в постановке Государственного академического театра оперы и балета. Новая режиссёрская версия с оригинальной музыкой.',
      category: 'theatre',
      date: new Date('2026-06-15T19:00:00+06:00'),
      venueId: 'v7',
      imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Партер (ряды 1-5)',  price: 8000, totalSeats: 200, soldSeats: 156 },
        { name: 'Партер (ряды 6-15)', price: 5500, totalSeats: 400, soldSeats: 210 },
        { name: 'Балкон',             price: 3500, totalSeats: 300, soldSeats: 90  },
      ],
    },

    // ── Шрек мюзикл ──
    {
      id: 'e014',
      title: 'Шрек — Мюзикл для всей семьи',
      description: 'Яркий музыкальный спектакль по любимому мультфильму. Живые декорации, костюмы, профессиональные актёры. Подходит детям от 3 лет.',
      category: 'kids',
      date: new Date('2026-06-21T12:00:00+06:00'),
      venueId: 'v8',
      imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Детский',  price: 2500, totalSeats: 300, soldSeats: 180 },
        { name: 'Взрослый', price: 4500, totalSeats: 300, soldSeats: 160 },
        { name: 'Семейный (2+2)', price: 12000, totalSeats: 100, soldSeats: 45 },
      ],
    },

    // ── Street Food Festival ──
    {
      id: 'e015',
      title: 'Street Food Festival Almaty',
      description: 'Крупнейший гастрономический фестиваль под открытым небом. 80+ стритфуд-концептов со всего мира, живая музыка, детская зона, мастер-классы от шеф-поваров.',
      category: 'festival',
      date: new Date('2026-06-20T11:00:00+06:00'),
      venueId: 'v15',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Входной', price: 1500, totalSeats: 5000, soldSeats: 2100 },
        { name: 'VIP (с едой на 3000₸)', price: 5000, totalSeats: 500, soldSeats: 210 },
      ],
    },

    // ── UFC Алматы ──
    {
      id: 'e016',
      title: 'UFC Fight Night — Алматы',
      description: 'Международный турнир по смешанным единоборствам в Балуан Шолак. Несколько казахстанских бойцов в главном карде. Самое горячее шоу года.',
      category: 'sport',
      date: new Date('2026-07-11T18:00:00+06:00'),
      venueId: 'v8',
      imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Трибуна C', price: 12000, totalSeats: 1000, soldSeats: 870 },
        { name: 'Трибуна B', price: 22000, totalSeats: 1000, soldSeats: 680 },
        { name: 'Трибуна A', price: 40000, totalSeats: 500,  soldSeats: 390 },
        { name: 'VIP',       price: 80000, totalSeats: 200,  soldSeats: 175 },
      ],
    },

    // ── Джаз в парке (бесплатно) ──
    {
      id: 'e017',
      title: 'Almaty Jazz Festival — Парк Первого Президента',
      description: 'Бесплатный летний джазовый фестиваль под открытым небом. Лучшие джаз-коллективы Казахстана и СНГ. Приходите с пледами и едой.',
      category: 'concert',
      date: new Date('2026-07-05T17:00:00+06:00'),
      venueId: 'v6',
      imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Вход свободный', price: 0, totalSeats: 10000, soldSeats: 3200 },
      ],
    },

    // ── Стендап Вечер ──
    {
      id: 'e018',
      title: 'Stand Up вечер — Жасай и Friends',
      description: 'Большой вечер казахстанского стендапа. Жасай Жаксылыков и его гости. Острые наблюдения о жизни в Казахстане. Только 18+.',
      category: 'standup',
      date: new Date('2026-06-27T20:00:00+06:00'),
      venueId: 'v8',
      imageUrl: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Стандарт', price: 5000,  totalSeats: 600, soldSeats: 430 },
        { name: 'VIP',      price: 12000, totalSeats: 100, soldSeats: 88  },
      ],
    },

    // ── День города Алматы (бесплатно) ──
    {
      id: 'e019',
      title: 'День города Алматы 2026',
      description: 'Главный городской праздник года. Концерты на 5 площадках, фейерверк, ярмарки, выставки, спортивные активности. Вход на все площадки свободный.',
      category: 'festival',
      date: new Date('2026-09-12T11:00:00+06:00'),
      venueId: 'v1',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Вход свободный', price: 0, totalSeats: 50000, soldSeats: 12000 },
      ],
    },

    // ── Выставка Nomad Spirit ──
    {
      id: 'e020',
      title: 'Выставка Nomad Spirit — современное казахское искусство',
      description: 'Масштабная выставка современного казахского искусства. 50 художников, скульпторы, инсталляции, digital-арт. Площадь Астана, открытый формат.',
      category: 'exhibition',
      date: new Date('2026-07-17T10:00:00+06:00'),
      venueId: 'v1',
      imageUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Вход свободный', price: 0, totalSeats: 20000, soldSeats: 4500 },
      ],
    },

    // ── Балет Лебединое озеро ──
    {
      id: 'e021',
      title: 'Лебединое озеро — ГАТОБ',
      description: 'Шедевр Чайковского в исполнении солистов Государственного академического театра оперы и балета. Классическая постановка с новыми декорациями.',
      category: 'theatre',
      date: new Date('2026-07-24T19:00:00+06:00'),
      venueId: 'v7',
      imageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Партер (ряды 1-5)',  price: 12000, totalSeats: 200, soldSeats: 140 },
        { name: 'Партер (ряды 6-15)', price: 8000,  totalSeats: 400, soldSeats: 220 },
        { name: 'Балкон',             price: 5000,  totalSeats: 300, soldSeats: 100 },
      ],
    },

    // ── Аниме-фестиваль Animania ──
    {
      id: 'e022',
      title: 'Animania — Аниме-фестиваль Алматы',
      description: 'Крупнейший аниме и косплей фестиваль Казахстана. Косплей-конкурс, дорамы, мерч-рынок, концерт аниме-каверов, мастер-классы по японской культуре.',
      category: 'festival',
      date: new Date('2026-08-08T10:00:00+06:00'),
      venueId: 'v8',
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Дневной', price: 3000, totalSeats: 2000, soldSeats: 1100 },
        { name: 'VIP',     price: 8000, totalSeats: 300,  soldSeats: 180  },
      ],
    },

    // ── Кайрат vs Кызылжар (футбол) ──
    {
      id: 'e023',
      title: 'ФК Кайрат — ФК Кызылжар | КПЛ',
      description: 'Матч 22-го тура Казахстанской Премьер-лиги. Центральный стадион Алматы. Горячий дерби-матч за лидерство в чемпионате.',
      category: 'sport',
      date: new Date('2026-08-15T17:00:00+06:00'),
      venueId: 'v5',
      imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Южная трибуна',   price: 3000, totalSeats: 5000, soldSeats: 3100 },
        { name: 'Боковая трибуна', price: 6000, totalSeats: 8000, soldSeats: 4200 },
        { name: 'VIP',             price: 20000, totalSeats: 500, soldSeats: 310  },
      ],
    },

    // ── Open Air кино ──
    {
      id: 'e024',
      title: 'Open Air Cinema — Кино у подножия гор',
      description: 'Кинопоказы под открытым небом у подножия Алатау. Каждую субботу — новый фильм. Приходите с едой, пледами и хорошим настроением.',
      category: 'exhibition',
      date: new Date('2026-07-18T21:00:00+06:00'),
      venueId: 'v6',
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Входной', price: 2000, totalSeats: 500, soldSeats: 310 },
        { name: 'VIP (шезлонг + пледы)', price: 6000, totalSeats: 80, soldSeats: 55 },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // АСТАНА
    // ═══════════════════════════════════════════════════════════════════════════

    // ── Thirty Seconds to Mars — Астана ──
    {
      id: 'e025',
      title: 'Thirty Seconds to Mars — Астана',
      description: 'Философский рок с Джаредом Лето. Барыс Арена, Астана. Новый альбом и все классические хиты — "The Kill", "Kings and Queens", "Up in the Air".',
      category: 'concert',
      date: new Date('2026-06-19T20:00:00+06:00'),
      venueId: 'v16',
      imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Стандарт', price: 20000, totalSeats: 5000, soldSeats: 3400 },
        { name: 'VIP',      price: 55000, totalSeats: 500,  soldSeats: 390  },
      ],
    },

    // ── День единства — Астана (бесплатно) ──
    {
      id: 'e026',
      title: 'День единства народа Казахстана — Астана',
      description: 'Главное государственное торжество. Концерт на центральной площади Астаны, фейерверк, выставки культур всех народов Казахстана. Вход свободный.',
      category: 'festival',
      date: new Date('2026-05-01T11:00:00+06:00'),
      venueId: 'v19',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Вход свободный', price: 0, totalSeats: 30000, soldSeats: 30000 },
      ],
    },

    // ── Стендап в Астане ──
    {
      id: 'e027',
      title: 'Ночь стендапа — Астана',
      description: 'Лучшие стендап-комики Казахстана и приглашённые звёзды из России. Конгресс-холл, Астана. Смеёмся над всем, что болит.',
      category: 'standup',
      date: new Date('2026-07-31T20:00:00+06:00'),
      venueId: 'v18',
      imageUrl: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Стандарт', price: 6000,  totalSeats: 800,  soldSeats: 520 },
        { name: 'VIP',      price: 15000, totalSeats: 100,  soldSeats: 74  },
      ],
    },

    // ─── Руки Вверх (Астана) ──
    {
      id: 'e028',
      title: 'Руки Вверх — Astana',
      description: 'Король вечеринок 90-х снова в Казахстане! "Студент", "Алёшка", "Чужой" — все суперхиты живьём. Барыс Арена.',
      category: 'concert',
      date: new Date('2026-10-03T20:00:00+06:00'),
      venueId: 'v16',
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Стандарт', price: 15000, totalSeats: 6000, soldSeats: 2100 },
        { name: 'VIP',      price: 40000, totalSeats: 500,  soldSeats: 180  },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ОСЕНЬ / ЗИМА 2026
    // ═══════════════════════════════════════════════════════════════════════════

    {
      id: 'e029',
      title: 'Kazakh Fashion Week 2026',
      description: 'Главная неделя моды Казахстана. Показы казахстанских дизайнеров, международные гости, выставка национального костюма, фотозоны и вечерние показы.',
      category: 'exhibition',
      date: new Date('2026-10-10T10:00:00+06:00'),
      venueId: 'v4',
      imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Дневной показ',  price: 5000,  totalSeats: 500,  soldSeats: 210 },
        { name: 'Вечерний показ', price: 12000, totalSeats: 500,  soldSeats: 180 },
        { name: 'VIP (все дни)',  price: 50000, totalSeats: 50,   soldSeats: 28  },
      ],
    },

    {
      id: 'e030',
      title: 'Новогодний концерт — Almaty Arena',
      description: 'Грандиозный новогодний концерт на Almaty Arena. Лучшие артисты Казахстана, шоу-программа, спецэффекты, праздничный фейерверк в полночь.',
      category: 'concert',
      date: new Date('2026-12-31T22:00:00+06:00'),
      venueId: 'v3',
      imageUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Партер',    price: 25000, totalSeats: 5000, soldSeats: 1200 },
        { name: 'Трибуна',   price: 15000, totalSeats: 8000, soldSeats: 900  },
        { name: 'VIP',       price: 70000, totalSeats: 500,  soldSeats: 180  },
      ],
    },

    {
      id: 'e031',
      title: 'Halloween Fest Almaty 2026',
      description: 'Самая страшная вечеринка года. Балуан Шолак. Конкурс костюмов, horror-зоны, DJ-сет до утра. 18+.',
      category: 'festival',
      date: new Date('2026-10-31T21:00:00+06:00'),
      venueId: 'v8',
      imageUrl: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Early Bird',  price: 5000,  totalSeats: 500,  soldSeats: 500  },
        { name: 'Стандарт',    price: 8000,  totalSeats: 1000, soldSeats: 320  },
        { name: 'VIP',         price: 20000, totalSeats: 200,  soldSeats: 75   },
      ],
    },

    {
      id: 'e032',
      title: 'Детский новогодний спектакль — Снежная королева',
      description: 'Волшебный новогодний спектакль для детей от 3 лет по сказке Андерсена. Живые актёры, интерактив с залом, подарки от Деда Мороза.',
      category: 'kids',
      date: new Date('2026-12-25T12:00:00+06:00'),
      venueId: 'v7',
      imageUrl: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Детский',        price: 3500,  totalSeats: 400, soldSeats: 80 },
        { name: 'Взрослый',       price: 5000,  totalSeats: 400, soldSeats: 70 },
        { name: 'Семейный (2+2)', price: 14000, totalSeats: 100, soldSeats: 20 },
      ],
    },

    // ─── Шымкент ──────────────────────────────────────────────────────────────

    {
      id: 'e033',
      title: 'День города Шымкент 2026',
      description: 'Праздничная программа в честь дня рождения третьего мегаполиса Казахстана. Концерты, ярмарки, спортивные состязания, национальные игры.',
      category: 'festival',
      date: new Date('2026-09-20T11:00:00+06:00'),
      venueId: 'v21',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Вход свободный', price: 0, totalSeats: 10000, soldSeats: 3000 },
      ],
    },

    {
      id: 'e034',
      title: 'ФК Ордабасы — ФК Кайрат | КПЛ',
      description: 'Принципиальный матч КПЛ в Шымкенте. Стадион полон — южане встречают гостей из Алматы.',
      category: 'sport',
      date: new Date('2026-08-22T17:00:00+06:00'),
      venueId: 'v20',
      imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=75',
      status: 'PUBLISHED',
      tickets: [
        { name: 'Трибуна',     price: 2000, totalSeats: 8000, soldSeats: 3100 },
        { name: 'VIP-сектор',  price: 8000, totalSeats: 500,  soldSeats: 210  },
      ],
    },

  ];

  // ─── Insert events + ticket types ─────────────────────────────────────────

  for (const ev of events) {
    await prisma.event.create({
      data: {
        id:          ev.id,
        title:       ev.title,
        description: ev.description,
        category:    ev.category,
        date:        ev.date,
        venueId:     ev.venueId,
        imageUrl:    ev.imageUrl,
        status:      ev.status,
        ticketTypes: {
          create: ev.tickets.map(t => ({
            name:       t.name,
            price:      t.price,
            currency:   'KZT',
            totalSeats: t.totalSeats,
            soldSeats:  t.soldSeats,
          })),
        },
      },
    });
  }

  console.log(`✅ ${events.length} events created`);
  console.log('🎉 Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());