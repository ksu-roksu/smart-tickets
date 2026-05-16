"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ORGANIZER_NAME = process.env.NEXT_PUBLIC_ORGANIZER_NAME || 'Smart Kazakhstan'
const TABS = [
  ['', 'Все'],
  ['DRAFT', 'Черновики'],
  ['PENDING_REVIEW', 'На проверке'],
  ['PUBLISHED', 'Опубликованные'],
  ['REJECTED', 'Отклонённые'],
  ['COMPLETED', 'Завершённые'],
  ['ARCHIVED', 'Архив'],
] as const

type EventRow = {
  id: string
  title: string
  category: string | null
  status: string
  date: string
  soldCount: number
  totalCapacity: number
  posterUrl?: string | null
  imageUrl?: string | null
  venue?: { name: string; city: string } | null
}

function statusLabel(status: string) {
  return ({
    DRAFT: 'Черновик',
    PENDING_REVIEW: 'На проверке',
    APPROVED: 'Одобрено',
    PUBLISHED: 'Опубликовано',
    REJECTED: 'Отклонено',
    PAUSED: 'Пауза',
    COMPLETED: 'Завершено',
    ARCHIVED: 'Архив',
  } as Record<string, string>)[status] || status
}

export default function OrganizerEventsPage() {
  const params = useSearchParams()
  const status = params.get('status') || ''
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    fetch(`/api/dashboard/events${status ? `?status=${status}` : ''}`)
      .then(async response => {
        const json = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(json.error || 'Не удалось загрузить события')
        return json.data || []
      })
      .then(data => active && setEvents(data))
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [status])

  const title = useMemo(() => TABS.find(([key]) => key === status)?.[1] || 'Все', [status])

  return (
    <main className="organizer-events-page">
      <section className="events-shell">
        <header className="events-head">
          <div>
            <div className="organizer-eyebrow events-eyebrow">
              Кабинет организатора: <button type="button">{ORGANIZER_NAME} ▾</button>
            </div>
            <h1>Мои события</h1>
            <p>{title}: управляйте карточками, модерацией, продажами и черновиками.</p>
          </div>
          <Link href="/dashboard/organizer/create">Создать событие</Link>
        </header>

        <nav className="events-tabs" aria-label="Статусы событий">
          {TABS.map(([key, label]) => (
            <Link
              key={key}
              className={key === status ? 'active' : ''}
              href={`/dashboard/organizer/events${key ? `?status=${key}` : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {loading && <div className="empty-state">Загружаем события…</div>}

        {error && (
          <div className="validation-panel">
            <b>Ошибка загрузки</b>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="empty-state">
            <h2>Здесь пока пусто</h2>
            <p>Создайте первое событие или проверьте другой статус.</p>
            <Link href="/dashboard/organizer/create">Создать событие</Link>
          </div>
        )}

        <div className="event-list">
          {events.map(event => {
            const image = event.imageUrl || event.posterUrl
            return (
              <article className="event-row" key={event.id}>
                <div className="row-cover" style={image ? { backgroundImage: `url(${image})` } : undefined} />
                <div className="event-row-main">
                  <b>{event.title}</b>
                  <p>{new Date(event.date).toLocaleDateString('ru-RU')} · {event.venue?.name || event.venue?.city || 'Место не указано'}</p>
                </div>
                <span className="status-badge">{statusLabel(event.status)}</span>
                <span className="event-row-capacity">{event.soldCount || 0}/{event.totalCapacity || 0}</span>
                <button type="button" aria-label="Действия события">⋯</button>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
