"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WIZARD_EMPTY, CATEGORY_COVERS, CATEGORIES, type WizardData } from '@/components/dashboard/wizard/types'
import Step1BasicInfo from '@/components/dashboard/wizard/Step1BasicInfo'
import Step2Media from '@/components/dashboard/wizard/Step2Media'
import Step3Tickets from '@/components/dashboard/wizard/Step3Tickets'
import Step4Venue from '@/components/dashboard/wizard/Step4Venue'
import Step5Publish from '@/components/dashboard/wizard/Step5Publish'

const ORGANIZER_NAME = process.env.NEXT_PUBLIC_ORGANIZER_NAME || 'Smart Kazakhstan'
const DRAFT_KEY = `smart.eventEditor.localDraft.${ORGANIZER_NAME}`

const SECTIONS = [
  { key: 'basic', label: 'Основное', hint: 'Название и описание' },
  { key: 'media', label: 'Медиа', hint: 'Афиша и галерея' },
  { key: 'venue', label: 'Дата и место', hint: 'Когда и где' },
  { key: 'tickets', label: 'Билеты', hint: 'Цены и квоты' },
  { key: 'publish', label: 'Публикация', hint: 'Проверка' },
]

type SaveState = 'idle' | 'saving' | 'saved' | 'error'
type ApiFieldError = { field: string; label?: string; message: string; step?: number }

function readLocalDraft(): WizardData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { ...WIZARD_EMPTY, ...parsed.data }
  } catch {
    return null
  }
}

function getCompletion(data: WizardData) {
  const checks = [
    Boolean(data.title.trim()),
    Boolean(data.category),
    Boolean(data.startAt),
    Boolean(data.isOnlineEvent || data.venueId || data.venueName.trim()),
    Boolean(data.ticketTypes.length),
    data.ticketTypes.every(t => t.name.trim() && Number(t.price) >= 0 && Number(t.totalSeats) > 0),
    Boolean(data.posterUrl || data.bannerUrl || data.category),
    Boolean(data.shortDesc.trim()),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function validateForPublish(data: WizardData): ApiFieldError[] {
  const errors: ApiFieldError[] = []
  if (!data.title.trim()) errors.push({ field: 'title', label: 'Название события', message: 'Введите название', step: 0 })
  if (!data.category) errors.push({ field: 'category', label: 'Категория', message: 'Выберите категорию', step: 0 })
  if (!data.startAt) errors.push({ field: 'startAt', label: 'Дата начала', message: 'Укажите дату и время начала', step: 2 })
  if (!data.isOnlineEvent && !data.venueId && !data.venueName.trim()) errors.push({ field: 'venueName', label: 'Площадка', message: 'Выберите или создайте площадку', step: 2 })
  if (!data.ticketTypes.length) errors.push({ field: 'ticketTypes', label: 'Билеты', message: 'Добавьте хотя бы один тип билета', step: 3 })
  data.ticketTypes.forEach((t, i) => {
    if (!t.name.trim()) errors.push({ field: `ticketTypes.${i}.name`, label: `Билет ${i + 1}`, message: 'Введите название билета', step: 3 })
    if (Number(t.totalSeats) <= 0) errors.push({ field: `ticketTypes.${i}.totalSeats`, label: `Билет ${i + 1}`, message: 'Количество мест должно быть больше 0', step: 3 })
  })
  return errors
}

function EventPreview({ data }: { data: WizardData }) {
  const cover = data.posterUrl || data.bannerUrl || CATEGORY_COVERS[(data.category || 'other') as keyof typeof CATEGORY_COVERS]?.[0]
  const categoryLabel = CATEGORIES.find(c => c.value === data.category)?.label.replace(/^\S+\s/, '') || 'Категория'
  const price = data.ticketTypes.length ? Math.min(...data.ticketTypes.map(t => Number(t.price || 0))) : null
  const completion = getCompletion(data)

  return (
    <aside className="editor-aside" aria-label="Предпросмотр события">
      <div className="preview-topline">
        <span>Предпросмотр карточки</span>
        <span>{completion}% готово</span>
      </div>

      <div className="preview-card">
        <div className="preview-cover" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
          {!cover && <span>Афиша события</span>}
        </div>
        <div className="preview-body">
          <div className="preview-category">{categoryLabel}</div>
          <h2>{data.title || 'Название события'}</h2>
          <p>{data.shortDesc || 'Короткое описание будет отображаться в карточке и каталоге.'}</p>
          <div className="preview-meta">
            <span>{data.startAt ? new Date(data.startAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : 'Дата не указана'}</span>
            <span>{data.isOnlineEvent ? 'Онлайн' : data.venueName || data.venueCity || 'Место не указано'}</span>
          </div>
          <div className="preview-price">{price !== null ? `от ${price.toLocaleString('ru-RU')} ₸` : 'Билеты не добавлены'}</div>
        </div>
      </div>

      <div className="publish-score">
        <div><b>Готовность события</b><span>{completion}%</span></div>
        <div className="scorebar"><i style={{ width: `${completion}%` }} /></div>
        <p>Заполните обязательные поля, добавьте афишу и билеты — так событие будет выглядеть сильнее в каталоге.</p>
      </div>
    </aside>
  )
}

export default function OrganizerEventEditorPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(WIZARD_EMPTY)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<string>('')
  const [errors, setErrors] = useState<ApiFieldError[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const hydrated = useRef(false)

  useEffect(() => {
    document.body.classList.add('smart-organizer-editor-active')
    const local = readLocalDraft()
    if (local) setData(local)
    hydrated.current = true
    return () => document.body.classList.remove('smart-organizer-editor-active')
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    setSaveState('saving')
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, updatedAt: new Date().toISOString(), organizerName: ORGANIZER_NAME }))
        setLastSavedAt(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }, 650)
    return () => window.clearTimeout(id)
  }, [data])

  useEffect(() => {
    const onBeforeUnload = () => {
      try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, updatedAt: new Date().toISOString(), organizerName: ORGANIZER_NAME })) } catch {}
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [data])

  const update = useCallback((patch: Partial<WizardData>) => setData(prev => ({ ...prev, ...patch })), [])
  const completion = useMemo(() => getCompletion(data), [data])

  const jumpToError = (e: ApiFieldError) => {
    if (typeof e.step === 'number') setStep(e.step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const go = (nextStep: number) => {
    setStep(Math.max(0, Math.min(SECTIONS.length - 1, nextStep)))
    setErrors([])
    setApiError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveToServer = async (publish: boolean) => {
    setApiError(null)
    const clientErrors = publish ? validateForPublish(data) : []
    if (clientErrors.length) {
      setErrors(clientErrors)
      jumpToError(clientErrors[0])
      return
    }

    setSaveState('saving')
    try {
      const res = await fetch('/api/dashboard/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, publish }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (Array.isArray(json.fieldErrors)) setErrors(json.fieldErrors)
        throw new Error(json.error || 'Не удалось сохранить событие')
      }
      window.localStorage.removeItem(DRAFT_KEY)
      setSaveState('saved')
      router.push('/dashboard/organizer/events' + (publish ? '?status=PENDING_REVIEW' : '?status=DRAFT'))
    } catch (e) {
      setSaveState('error')
      setApiError(e instanceof Error ? e.message : 'Не удалось сохранить событие')
    }
  }

  const stepProps = { data, update, onNext: () => go(step + 1), onPrev: () => go(step - 1) }
  const CurrentStep = [Step1BasicInfo, Step2Media, Step4Venue, Step3Tickets, Step5Publish][step]

  return (
    <main className="event-editor-shell">
      <header className="event-editor-hero">
        <div className="hero-inner">
          <div className="organizer-eyebrow">
            Кабинет организатора: <button type="button">{ORGANIZER_NAME} ▾</button>
          </div>
          <div className="hero-row">
            <div>
              <h1>Новое событие</h1>
              <p>Создайте карточку, настройте билеты и отправьте событие на публикацию.</p>
            </div>
            <div className="hero-actions">
              <span className={'save-pill ' + saveState}>{saveState === 'saving' ? 'Сохраняем…' : saveState === 'saved' ? `Сохранено ${lastSavedAt}` : saveState === 'error' ? 'Ошибка сохранения' : 'Локальный черновик'}</span>
              <Link href="/dashboard/organizer/events?status=DRAFT">Черновики</Link>
              <button type="button" onClick={() => router.push('/dashboard/organizer/events')}>Мои события</button>
            </div>
          </div>
        </div>
      </header>

      <div className="mobile-preview-toggle">
        <button type="button" onClick={() => setShowPreview(v => !v)}>{showPreview ? 'Скрыть предпросмотр' : 'Показать предпросмотр'}</button>
      </div>

      <div className={'editor-layout ' + (showPreview ? 'preview-mobile-open' : '')}>
        <section className="editor-main" aria-label="Редактор события">
          <nav className="editor-stepper" aria-label="Шаги создания события">
            {SECTIONS.map((section, i) => (
              <button key={section.key} type="button" className={i === step ? 'active' : i < step ? 'done' : ''} onClick={() => go(i)}>
                <span>{i < step ? '✓' : i + 1}</span>
                <b>{section.label}</b>
                <small>{section.hint}</small>
              </button>
            ))}
          </nav>

          <div className="editor-main-panel">
            {(apiError || errors.length > 0) && (
              <div className="validation-panel">
                <b>{apiError ? 'Не получилось сохранить событие' : 'Нужно поправить перед публикацией'}</b>
                {apiError && <p>{apiError}</p>}
                {errors.length > 0 && <ul>{errors.map((e, idx) => <li key={idx}><button type="button" onClick={() => jumpToError(e)}>{e.label || e.field}: {e.message}</button></li>)}</ul>}
              </div>
            )}
            <CurrentStep {...stepProps} />
          </div>
        </section>

        <EventPreview data={data} />
      </div>

      <footer className="editor-actionbar">
        <div className="editor-actionbar-inner">
          <button type="button" className="secondary" onClick={() => go(step - 1)} disabled={step === 0}>Назад</button>
          <div className="editor-actionbar-group">
            <button type="button" className="secondary save-draft-button" onClick={() => saveToServer(false)}>Сохранить черновик</button>
            {step < SECTIONS.length - 1 ? (
              <button type="button" className="primary" onClick={() => go(step + 1)}>Далее</button>
            ) : (
              <button type="button" className="primary" onClick={() => saveToServer(true)}>Отправить на проверку</button>
            )}
          </div>
        </div>
      </footer>
    </main>
  )
}
