// app/lib/event-utils.ts
// Shared types + helpers — используется в page.tsx, каталоге и карточках

export type TicketType = {
  price: number | string;
  totalSeats: number;
  soldSeats: number;
};

export type EventVenue = {
  id?: string;
  name: string;
  city: string;
  address?: string;
};

export type EventItem = {
  id: string;
  title: string;
  date: string | Date;
  venue: EventVenue;
  ticketTypes: TicketType[];

  category?: string | null;
  imageUrl?: string | null;
  coverUrl?: string | null;
  description?: string | null;

  tags?: string[];
  ageMin?: number | null;
  ageMax?: number | null;
  durationMin?: number | null;
  isOutdoor?: boolean;
  isFeatured?: boolean;
  slug?: string | null;
};

// ─── Price / seats helpers ────────────────────────────────────────────────────

export const minPrice = (tt: TicketType[]): number | null =>
  tt.length ? Math.min(...tt.map((t) => Number(t.price))) : null;

export const seatsLeft = (tt: TicketType[]): number =>
  tt.reduce((a, t) => a + (t.totalSeats - t.soldSeats), 0);

export const totalSeats = (tt: TicketType[]): number =>
  tt.reduce((a, t) => a + t.totalSeats, 0);

export const soldPct = (tt: TicketType[]): number => {
  const tot = totalSeats(tt);
  if (!tot) return 0;
  return (tot - seatsLeft(tt)) / tot;
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

export const fmtDate = (d: string | Date): string =>
  new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

export const fmtDateShort = (d: string | Date): string =>
  new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

export const fmtTime = (d: string | Date): string =>
  new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

export const daysUntil = (d: string | Date): number =>
  Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

// ─── Badge logic ──────────────────────────────────────────────────────────────

export type EventBadge = { label: string; color: string } | null;

export function getEventBadge(event: EventItem): EventBadge {
  const days = daysUntil(event.date);
  const left = seatsLeft(event.ticketTypes);
  const pct = soldPct(event.ticketTypes);

  if (left > 0 && left <= 10) return { label: `Осталось ${left}`, color: 'bg-red-500' };
  if (pct >= 0.8) return { label: '🔥 Хит продаж', color: 'bg-[#FF4D00]' };
  if (days >= 0 && days <= 1) return { label: '⚡ Сегодня', color: 'bg-yellow-500' };
  if (days >= 0 && days <= 3) return { label: '⚡ Скоро', color: 'bg-yellow-600' };
  if (days >= 0 && days <= 7) return { label: '🕐 Заканчивается', color: 'bg-orange-600' };

  return null;
}

// ─── Image system ─────────────────────────────────────────────────────────────

export const CATEGORY_IMAGES: Record<string, string> = {
  concert: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=75',
  theatre: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=75',
  sport: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=75',
  standup: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=75',
  kids: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=75',
  exhibition: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=75',
  festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=75',
  default: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=75',
};

export const GRADIENTS = [
  'from-[#2d1b69] to-[#11998e]',
  'from-[#c94b4b] to-[#4b134f]',
  'from-[#134e5e] to-[#71b280]',
  'from-[#373b44] to-[#4286f4]',
  'from-[#1a1a2e] to-[#e96c6c]',
  'from-[#2c3e50] to-[#fd746c]',
  'from-[#0f2027] to-[#203a43]',
  'from-[#3a1c71] to-[#d76d77]',
];

export function getEventImage(event: EventItem): string {
  if (event.imageUrl && event.imageUrl.startsWith('http')) return event.imageUrl;
  if (event.coverUrl && event.coverUrl.startsWith('http')) return event.coverUrl;
  return CATEGORY_IMAGES[event.category ?? ''] ?? CATEGORY_IMAGES.default;
}

// ─── Category / mood data ─────────────────────────────────────────────────────

export const CATEGORIES = [
  { label: 'Все', value: '' },
  { label: 'Концерты', value: 'concert' },
  { label: 'Театр', value: 'theatre' },
  { label: 'Спорт', value: 'sport' },
  { label: 'Стендап', value: 'standup' },
  { label: 'Детям', value: 'kids' },
  { label: 'Выставки', value: 'exhibition' },
  { label: 'Фесты', value: 'festival' },
];

export const MOODS = [
  { emoji: '🔥', label: 'Зажечь', value: 'energetic' },
  { emoji: '😌', label: 'Спокойно', value: 'calm' },
  { emoji: '👨‍👩‍👧', label: 'Семья', value: 'family' },
  { emoji: '💫', label: 'Свидание', value: 'date' },
  { emoji: '🎉', label: 'Праздник', value: 'party' },
  { emoji: '🎭', label: 'Культура', value: 'culture' },
];

export const MOOD_TAGS: Record<string, string[]> = {
  energetic: [
    'party',
    'music',
    'edm',
    'festival',
    'standup',
    'night',
    'dance',
    'live',
    'rock',
    'pop',
  ],
  calm: [
    'calm',
    'theatre',
    'classic',
    'art',
    'gallery',
    'jazz',
    'museum',
    'history',
    'photo',
  ],
  family: [
    'family',
    'kids',
    'age0',
    'age3',
    'age6',
    'age12',
    'circus',
    'workshop',
    'cartoon',
  ],
  date: [
    'date',
    'theatre',
    'jazz',
    'opera',
    'ballet',
    'romantic',
    'premium',
    'art',
    'gallery',
  ],
  party: [
    'party',
    'festival',
    'food',
    'openair',
    'outdoor',
    'city',
    'free',
    'music',
  ],
  culture: [
    'culture',
    'theatre',
    'classic',
    'opera',
    'ballet',
    'art',
    'history',
    'gallery',
    'museum',
  ],
};

export const CITIES = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Актау',
  'Атырау',
  'Актобе',
  'Павлодар',
  'Тараз',
];

// ─── Sort helpers ─────────────────────────────────────────────────────────────

export type SortType = 'trending' | 'date' | 'price_asc' | 'price_desc' | 'new';

export function sortEvents(events: EventItem[], sort: SortType): EventItem[] {
  const arr = [...events];

  switch (sort) {
    case 'date':
      return arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    case 'price_asc':
      return arr.sort((a, b) => (minPrice(a.ticketTypes) ?? 0) - (minPrice(b.ticketTypes) ?? 0));

    case 'price_desc':
      return arr.sort((a, b) => (minPrice(b.ticketTypes) ?? 0) - (minPrice(a.ticketTypes) ?? 0));

    case 'new':
      return arr.reverse();

    case 'trending':
    default:
      return arr.sort((a, b) => {
        const scoreA = soldPct(a.ticketTypes) * 0.6 + (1 / Math.max(daysUntil(a.date), 1)) * 0.4;
        const scoreB = soldPct(b.ticketTypes) * 0.6 + (1 / Math.max(daysUntil(b.date), 1)) * 0.4;
        return scoreB - scoreA;
      });
  }
}