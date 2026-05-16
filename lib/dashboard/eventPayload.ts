export type EventSaveMode = 'draft' | 'review'

export type ApiFieldError = {
  field: string
  label: string
  message: string
  step: number
}

export type TicketInput = {
  name?: string
  description?: string
  price?: number | string | null
  currency?: string
  totalSeats?: number | string | null
  maxPerOrder?: number | string | null
  minPerOrder?: number | string | null
  earlyBirdPrice?: number | string | null
  earlyBirdUntil?: string | null
  earlyBirdCount?: number | string | null
  saleStartAt?: string | null
  saleEndAt?: string | null
}

export type EventWizardInput = {
  title?: string
  slug?: string
  description?: string
  shortDesc?: string
  category?: string
  tags?: string[]
  mood?: string[]
  startAt?: string | null
  endAt?: string | null
  doorsOpenAt?: string | null
  isOnlineEvent?: boolean
  onlineUrl?: string
  posterUrl?: string
  bannerUrl?: string
  galleryUrls?: string[]
  ageRestriction?: number | string | null
  maxTicketsPerOrder?: number | string | null
  refundPolicy?: 'NO_REFUND' | 'STANDARD' | 'FLEXIBLE' | 'CUSTOM'
  refundDeadline?: string | null
  requiresApproval?: boolean
  metaTitle?: string
  metaDesc?: string
  venueId?: string
  venueName?: string
  venueCity?: string
  venueAddress?: string
  isNewVenue?: boolean
  ticketTypes?: TicketInput[]
}

const EVENT_STATUS = {
  draft: 'DRAFT',
  review: 'PENDING_REVIEW',
} as const

export function slugify(input: string) {
  return (input || 'event')
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'event'
}

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : []
}

function nullableDate(value?: string | null) {
  return value ? new Date(value) : null
}

function nullableString(value?: string | null) {
  const trimmed = String(value ?? '').trim()
  return trimmed.length ? trimmed : null
}

function numberOrDefault(value: unknown, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function validateEventInput(data: EventWizardInput, mode: EventSaveMode): ApiFieldError[] {
  const publish = mode === 'review'
  const errors: ApiFieldError[] = []
  const add = (field: string, label: string, message: string, step: number) => errors.push({ field, label, message, step })

  const title = String(data.title ?? '').trim()
  if (!title) add('title', 'Название события', publish ? 'Введите название события' : 'Для черновика нужно хотя бы название', 0)
  if (title.length > 200) add('title', 'Название события', 'Название должно быть не длиннее 200 символов', 0)

  if (publish) {
    if (!data.category) add('category', 'Категория', 'Выберите категорию события', 0)
    if (!data.startAt) add('startAt', 'Дата и время начала', 'Укажите дату и время начала события', 0)
    if (!Array.isArray(data.ticketTypes) || data.ticketTypes.length === 0) add('ticketTypes', 'Билеты', 'Добавьте хотя бы один тип билета', 2)
    if (!data.isOnlineEvent && !data.venueId && !data.isNewVenue) add('venue', 'Площадка', 'Выберите площадку или создайте новую', 3)
  }

  if (data.endAt && data.startAt && new Date(data.endAt) <= new Date(data.startAt)) {
    add('endAt', 'Дата окончания', 'Дата окончания должна быть позже даты начала', 0)
  }

  if (data.isOnlineEvent && data.onlineUrl && !/^https?:\/\//i.test(data.onlineUrl)) {
    add('onlineUrl', 'Ссылка на трансляцию', 'Ссылка должна начинаться с http:// или https://', 3)
  }

  if (!data.isOnlineEvent && data.isNewVenue) {
    if (!String(data.venueName ?? '').trim()) add('venueName', 'Название площадки', 'Введите название новой площадки', 3)
    if (!String(data.venueAddress ?? '').trim()) add('venueAddress', 'Адрес площадки', 'Введите адрес новой площадки', 3)
  }

  if (Array.isArray(data.ticketTypes)) {
    data.ticketTypes.forEach((ticket, index) => {
      if (!String(ticket.name ?? '').trim()) add(`ticketTypes.${index}.name`, `Билет ${index + 1}`, 'Введите название типа билета', 2)
      if (numberOrDefault(ticket.price, 0) < 0) add(`ticketTypes.${index}.price`, `Билет ${index + 1}`, 'Цена не может быть отрицательной', 2)
      if (publish && numberOrDefault(ticket.totalSeats, 0) < 1) add(`ticketTypes.${index}.totalSeats`, `Билет ${index + 1}`, 'Количество мест должно быть больше 0', 2)
    })
  }

  return errors
}

export function normalizeEventPayload(data: EventWizardInput, mode: EventSaveMode) {
  const title = String(data.title ?? '').trim()
  const baseSlug = slugify(String(data.slug || title || 'event'))
  const ticketTypes = Array.isArray(data.ticketTypes) ? data.ticketTypes : []
  const poster = nullableString(data.posterUrl)

  return {
    event: {
      title,
      slug: `${baseSlug}-${Date.now()}`,
      description: nullableString(data.description),
      shortDesc: nullableString(data.shortDesc),
      category: nullableString(data.category),
      tags: asArray(data.tags),
      mood: asArray(data.mood),
      date: data.startAt ? new Date(data.startAt) : new Date(),
      startAt: nullableDate(data.startAt),
      endAt: nullableDate(data.endAt),
      doorsOpenAt: nullableDate(data.doorsOpenAt),
      isOnlineEvent: Boolean(data.isOnlineEvent),
      onlineUrl: nullableString(data.onlineUrl),
      imageUrl: poster,
      coverUrl: poster,
      bannerUrl: nullableString(data.bannerUrl),
      galleryUrls: asArray(data.galleryUrls),
      ageRestriction: numberOrNull(data.ageRestriction),
      maxTicketsPerOrder: numberOrDefault(data.maxTicketsPerOrder, 8),
      refundPolicy: data.refundPolicy ?? 'STANDARD',
      refundDeadline: nullableDate(data.refundDeadline),
      requiresApproval: Boolean(data.requiresApproval),
      metaTitle: nullableString(data.metaTitle),
      metaDesc: nullableString(data.metaDesc),
      totalCapacity: ticketTypes.reduce((sum, ticket) => sum + numberOrDefault(ticket.totalSeats, 0), 0),
      status: EVENT_STATUS[mode],
    },
    tickets: ticketTypes.map(ticket => ({
      name: String(ticket.name ?? '').trim(),
      description: nullableString(ticket.description),
      price: numberOrDefault(ticket.price, 0),
      currency: ticket.currency || 'KZT',
      totalSeats: numberOrDefault(ticket.totalSeats, 0),
      soldSeats: 0,
      maxPerOrder: numberOrDefault(ticket.maxPerOrder, 8),
      minPerOrder: numberOrDefault(ticket.minPerOrder, 1),
      earlyBirdPrice: numberOrNull(ticket.earlyBirdPrice),
      earlyBirdUntil: nullableDate(ticket.earlyBirdUntil),
      earlyBirdCount: numberOrNull(ticket.earlyBirdCount),
      saleStartAt: nullableDate(ticket.saleStartAt),
      saleEndAt: nullableDate(ticket.saleEndAt),
    })),
  }
}
