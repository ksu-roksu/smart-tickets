/**
 * components/dashboard/wizard/types.ts
 * Типы и стартовое состояние wizard создания события.
 */

export type EventCategory =
  | 'concert'
  | 'theatre'
  | 'sport'
  | 'standup'
  | 'kids'
  | 'exhibition'
  | 'festival'
  | 'conference'
  | 'nightlife'
  | 'other'

export type EventMood =
  | 'family'
  | 'romantic'
  | 'party'
  | 'culture'
  | 'sport'
  | 'relax'
  | 'kids'
  | 'premium'
  | 'outdoor'
  | 'creative'

export type RefundPolicy = 'STANDARD' | 'FLEXIBLE' | 'NO_REFUND' | 'CUSTOM'

export interface TicketTypeForm {
  id: string
  name: string
  price: number
  currency: 'KZT' | 'USD' | 'EUR'
  totalSeats: number
  description: string
  earlyBirdPrice: number | null
  earlyBirdUntil: string | null
  earlyBirdCount: number | null
  maxPerOrder: number
  minPerOrder: number
  saleStartAt: string | null
  saleEndAt: string | null
}

export interface WizardData {
  title: string
  category: EventCategory | ''
  shortDesc: string
  description: string
  startAt: string
  endAt: string
  doorsOpenAt: string
  ageRestriction: number | null
  maxTicketsPerOrder: number
  mood: EventMood[]
  isOnlineEvent: boolean
  onlineUrl: string

  posterUrl: string
  bannerUrl: string
  galleryUrls: string[]

  ticketTypes: TicketTypeForm[]
  refundPolicy: RefundPolicy
  refundDeadline: string

  venueId: string
  venueName: string
  venueCity: string
  venueAddress: string
  isNewVenue: boolean

  slug: string
  metaTitle: string
  metaDesc: string
  requiresApproval: boolean
}

export const WIZARD_EMPTY: WizardData = {
  title: '',
  category: '',
  shortDesc: '',
  description: '',
  startAt: '',
  endAt: '',
  doorsOpenAt: '',
  ageRestriction: null,
  maxTicketsPerOrder: 8,
  mood: [],
  isOnlineEvent: false,
  onlineUrl: '',

  posterUrl: '',
  bannerUrl: '',
  galleryUrls: [],

  ticketTypes: [],
  refundPolicy: 'STANDARD',
  refundDeadline: '',

  venueId: '',
  venueName: '',
  venueCity: 'Алматы',
  venueAddress: '',
  isNewVenue: false,

  slug: '',
  metaTitle: '',
  metaDesc: '',
  requiresApproval: true,
}

export const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'concert', label: '🎵 Концерт' },
  { value: 'theatre', label: '🎭 Театр' },
  { value: 'sport', label: '⚽ Спорт' },
  { value: 'standup', label: '🎤 Стендап' },
  { value: 'kids', label: '🧸 Детское' },
  { value: 'exhibition', label: '🖼 Выставка' },
  { value: 'festival', label: '🎪 Фестиваль' },
  { value: 'conference', label: '💼 Конференция' },
  { value: 'nightlife', label: '🌙 Вечеринка' },
  { value: 'other', label: '📌 Другое' },
]

export const MOOD_OPTIONS: { value: EventMood; label: string }[] = [
  { value: 'family', label: 'Семейное' },
  { value: 'romantic', label: 'Романтика' },
  { value: 'party', label: 'Вечеринка' },
  { value: 'culture', label: 'Культура' },
  { value: 'sport', label: 'Спорт' },
  { value: 'relax', label: 'Отдых' },
  { value: 'kids', label: 'Детям' },
  { value: 'premium', label: 'Премиум' },
  { value: 'outdoor', label: 'На улице' },
  { value: 'creative', label: 'Творчество' },
]

export const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Атырау'] as const

export const CATEGORY_COVERS: Record<EventCategory | 'other', string[]> = {
  concert: [
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
  ],
  theatre: [
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
    'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80',
  ],
  sport: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
  ],
  standup: ['https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=80'],
  kids: [
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=80',
  ],
  exhibition: [
    'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
  ],
  festival: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
  ],
  conference: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'],
  nightlife: ['https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80'],
  other: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'],
}
