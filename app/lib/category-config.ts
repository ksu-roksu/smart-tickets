// app/lib/category-config.ts
// Category-native UX конфиг — chips, стиль hero, sort, SEO

export type CategoryKey =
  | 'concert'
  | 'theatre'
  | 'sport'
  | 'kids'
  | 'exhibition'
  | 'standup'
  | 'festival'
  | '';

export type CategoryChip = {
  label: string;
  value: string;
};

export type CategoryConfig = {
  label: string;
  labelPlural: string;
  seoTitle: string;      // для <title> страницы
  seoDesc: string;       // для meta description
  heroStyle: 'cinematic' | 'editorial' | 'scoreboard' | 'bright' | 'minimal' | 'dark';
  cardLayout: 'grid' | 'list' | 'matchcard' | 'kids' | 'gallery' | 'standup';
  sortDefault: 'trending' | 'date' | 'price_asc' | 'new';
  chips: CategoryChip[];
  isOutdoor: boolean;    // показывать погоду
  accentColor: string;   // Tailwind class для акцентов
  emptyIcon: string;
  emptyText: string;
};

export const CATEGORY_CONFIG: Record<CategoryKey, CategoryConfig> = {

  '': {
    label: 'Все',
    labelPlural: 'Все события',
    seoTitle: 'Билеты на события в Казахстане',
    seoDesc: 'Концерты, театр, спорт, детские мероприятия и фестивали в Алматы, Астане и по всему Казахстану.',
    heroStyle: 'cinematic',
    cardLayout: 'grid',
    sortDefault: 'trending',
    chips: [
      { label: 'Все',      value: '' },
      { label: 'Концерты', value: 'concert' },
      { label: 'Театр',    value: 'theatre' },
      { label: 'Спорт',    value: 'sport' },
      { label: 'Детям',    value: 'kids' },
      { label: 'Выставки', value: 'exhibition' },
      { label: 'Стендап',  value: 'standup' },
      { label: 'Фесты',    value: 'festival' },
    ],
    isOutdoor: false,
    accentColor: 'text-orange-400',
    emptyIcon: '🎭',
    emptyText: 'Событий не найдено',
  },

  concert: {
    label: 'Концерты',
    labelPlural: 'Концерты',
    seoTitle: 'Билеты на концерты в Казахстане',
    seoDesc: 'Купить билеты на концерты в Алматы и Астане. Мировые звёзды, казахстанские артисты, рок, поп, электронная музыка.',
    heroStyle: 'cinematic',
    cardLayout: 'grid',
    sortDefault: 'trending',
    chips: [
      { label: 'Все',            value: '' },
      { label: '🔥 Хип-хоп',    value: 'hiphop' },
      { label: '🎸 Рок',        value: 'rock' },
      { label: '🎧 EDM',        value: 'edm' },
      { label: '🎤 Поп',        value: 'pop' },
      { label: '🇰🇿 Казахстанские', value: 'kz' },
      { label: '🌍 Мировые',    value: 'world' },
      { label: '⚡ Sold out скоро', value: 'soldout' },
      { label: '✨ Новые анонсы', value: 'new' },
    ],
    isOutdoor: false,
    accentColor: 'text-purple-400',
    emptyIcon: '🎸',
    emptyText: 'Концертов не найдено',
  },

  theatre: {
    label: 'Театр',
    labelPlural: 'Театр и шоу',
    seoTitle: 'Билеты в театр в Казахстане',
    seoDesc: 'Спектакли, балет, опера, мюзиклы в Алматы и Астане. ГАТОБ, Дворец Республики и другие лучшие театры Казахстана.',
    heroStyle: 'editorial',
    cardLayout: 'list',
    sortDefault: 'date',
    chips: [
      { label: 'Все жанры', value: '' },
      { label: '🎭 Драма',   value: 'drama' },
      { label: '😂 Комедия', value: 'comedy' },
      { label: '🎼 Мюзикл', value: 'musical' },
      { label: '🩰 Балет',  value: 'ballet' },
      { label: '🎵 Опера',  value: 'opera' },
      { label: '✨ Премьеры', value: 'premiere' },
      { label: '🏛 Классика', value: 'classic' },
    ],
    isOutdoor: false,
    accentColor: 'text-amber-400',
    emptyIcon: '🎭',
    emptyText: 'Спектаклей не найдено',
  },

  sport: {
    label: 'Спорт',
    labelPlural: 'Спортивные события',
    seoTitle: 'Билеты на спортивные события в Казахстане',
    seoDesc: 'Футбол, UFC, хоккей, баскетбол, марафоны. Купить билеты на матчи и турниры в Алматы и Астане.',
    heroStyle: 'scoreboard',
    cardLayout: 'matchcard',
    sortDefault: 'date',
    chips: [
      { label: 'Все',      value: '' },
      { label: '⚽ Футбол', value: 'football' },
      { label: '🥊 UFC / Бокс', value: 'mma' },
      { label: '🏒 Хоккей', value: 'hockey' },
      { label: '🏀 Баскетбол', value: 'basketball' },
      { label: '🏃 Марафон', value: 'marathon' },
      { label: '🔥 Дерби',  value: 'derby' },
      { label: '🎮 Киберспорт', value: 'esports' },
    ],
    isOutdoor: true,
    accentColor: 'text-blue-400',
    emptyIcon: '⚽',
    emptyText: 'Матчей не найдено',
  },

  kids: {
    label: 'Детям',
    labelPlural: 'Детские мероприятия',
    seoTitle: 'Детские мероприятия и билеты в Казахстане',
    seoDesc: 'Спектакли, мастер-классы, цирк и шоу для детей в Алматы и Астане. Безопасно, интересно, незабываемо.',
    heroStyle: 'bright',
    cardLayout: 'kids',
    sortDefault: 'date',
    chips: [
      { label: 'Все',         value: '' },
      { label: '🧸 0–3 года', value: 'age0' },
      { label: '🎨 3–6 лет',  value: 'age3' },
      { label: '🦖 6–12 лет', value: 'age6' },
      { label: '🧑 12+', value: 'age12' },
      { label: '🎪 Цирк',     value: 'circus' },
      { label: '🎭 Мюзикл',   value: 'musical' },
      { label: '🖌 Мастер-кл', value: 'workshop' },
      { label: '🎁 Бесплатно', value: 'free' },
    ],
    isOutdoor: false,
    accentColor: 'text-green-400',
    emptyIcon: '🧸',
    emptyText: 'Детских мероприятий не найдено',
  },

  exhibition: {
    label: 'Выставки',
    labelPlural: 'Выставки и музеи',
    seoTitle: 'Выставки и музеи в Казахстане',
    seoDesc: 'Художественные выставки, фотовыставки, иммерсивные экспозиции, музеи в Алматы и Астане.',
    heroStyle: 'minimal',
    cardLayout: 'gallery',
    sortDefault: 'new',
    chips: [
      { label: 'Все',             value: '' },
      { label: '🖼 Искусство',    value: 'art' },
      { label: '📸 Фото',         value: 'photo' },
      { label: '🏛 История',      value: 'history' },
      { label: '🌍 Иммерсивное',  value: 'immersive' },
      { label: '✨ Новые',        value: 'new' },
      { label: '🎁 Бесплатно',   value: 'free' },
    ],
    isOutdoor: false,
    accentColor: 'text-teal-400',
    emptyIcon: '🖼',
    emptyText: 'Выставок не найдено',
  },

  standup: {
    label: 'Стендап',
    labelPlural: 'Стендап и юмор',
    seoTitle: 'Стендап-концерты в Казахстане',
    seoDesc: 'Билеты на стендап-шоу и вечера юмора в Алматы и Астане. Лучшие комики Казахстана и России.',
    heroStyle: 'dark',
    cardLayout: 'standup',
    sortDefault: 'trending',
    chips: [
      { label: 'Все',          value: '' },
      { label: '😂 Чёрный юмор', value: 'dark' },
      { label: '🎤 Open mic',  value: 'openmic' },
      { label: '🔥 Популярное', value: 'popular' },
      { label: '🇰🇿 Казахстан', value: 'kz' },
      { label: '✨ Новички',   value: 'new' },
      { label: '18+',          value: '18plus' },
    ],
    isOutdoor: false,
    accentColor: 'text-red-400',
    emptyIcon: '😂',
    emptyText: 'Стендап-шоу не найдено',
  },

  festival: {
    label: 'Фестивали',
    labelPlural: 'Фестивали',
    seoTitle: 'Фестивали в Казахстане 2026',
    seoDesc: 'Музыкальные фестивали, фудфесты, городские праздники и культурные события в Казахстане.',
    heroStyle: 'cinematic',
    cardLayout: 'grid',
    sortDefault: 'trending',
    chips: [
      { label: 'Все',           value: '' },
      { label: '🎸 Музыка',     value: 'music' },
      { label: '🍔 Еда',        value: 'food' },
      { label: '🎨 Культура',   value: 'culture' },
      { label: '🌿 Outdoor',    value: 'outdoor' },
      { label: '👨‍👩‍👧 Семейный', value: 'family' },
      { label: '🎁 Бесплатный', value: 'free' },
    ],
    isOutdoor: true,
    accentColor: 'text-orange-400',
    emptyIcon: '🎡',
    emptyText: 'Фестивалей не найдено',
  },
};

// Категории для которых показываем погоду на карточке
export const OUTDOOR_CATEGORIES = new Set<string>(['sport', 'festival']);

// Helper: получить конфиг по категории
export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category as CategoryKey] ?? CATEGORY_CONFIG[''];
}