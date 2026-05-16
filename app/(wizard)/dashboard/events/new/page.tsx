"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/app/components/ThemeToggle'
import { WIZARD_EMPTY, CATEGORY_COVERS, CATEGORIES, type WizardData } from '@/components/dashboard/wizard/types'
import Step1BasicInfo from '@/components/dashboard/wizard/Step1BasicInfo'
import Step2Media from '@/components/dashboard/wizard/Step2Media'
import Step3Tickets from '@/components/dashboard/wizard/Step3Tickets'
import Step4Venue from '@/components/dashboard/wizard/Step4Venue'
import Step5Publish from '@/components/dashboard/wizard/Step5Publish'

const DRAFT_KEY = 'smart.eventEditor.draft'

const STEPS = [
  { label: 'Основное',     hint: 'Название, категория' },
  { label: 'Медиа',        hint: 'Афиша, галерея' },
  { label: 'Дата и место', hint: 'Когда и где' },
  { label: 'Билеты',       hint: 'Цены, квоты' },
  { label: 'Публикация',   hint: 'Проверка' },
]

type SaveState = 'idle' | 'saving' | 'saved' | 'error'
type ApiFieldError = { field: string; label?: string; message: string; step?: number }

function isStepComplete(step: number, data: WizardData): boolean {
  switch (step) {
    case 0: return Boolean(data.title.trim() && data.category && data.startAt)
    case 1: return Boolean(data.posterUrl || data.bannerUrl || data.category)
    case 2: return Boolean(data.isOnlineEvent || data.venueId || data.venueName.trim())
    case 3: return data.ticketTypes.length > 0 && data.ticketTypes.every(t => t.name.trim() && Number(t.totalSeats) > 0)
    case 4: return false
    default: return false
  }
}

function getCompletion(data: WizardData) {
  const checks = [
    Boolean(data.title.trim()), Boolean(data.category), Boolean(data.startAt),
    Boolean(data.isOnlineEvent || data.venueId || data.venueName.trim()),
    Boolean(data.ticketTypes.length),
    data.ticketTypes.every(t => t.name.trim() && Number(t.totalSeats) > 0),
    Boolean(data.posterUrl || data.category),
    Boolean(data.shortDesc.trim()),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function validateForPublish(data: WizardData): ApiFieldError[] {
  const errors: ApiFieldError[] = []
  if (!data.title.trim()) errors.push({ field: 'title', label: 'Название', message: 'Введите название', step: 0 })
  if (!data.category) errors.push({ field: 'category', label: 'Категория', message: 'Выберите категорию', step: 0 })
  if (!data.startAt) errors.push({ field: 'startAt', label: 'Дата', message: 'Укажите дату начала', step: 2 })
  if (!data.isOnlineEvent && !data.venueId && !data.venueName.trim())
    errors.push({ field: 'venue', label: 'Площадка', message: 'Укажите площадку', step: 2 })
  if (!data.ticketTypes.length)
    errors.push({ field: 'tickets', label: 'Билеты', message: 'Добавьте хотя бы один тип', step: 3 })
  return errors
}

function readLocalDraft(): WizardData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return { ...WIZARD_EMPTY, ...JSON.parse(raw).data }
  } catch { return null }
}

function EventPreview({ data }: { data: WizardData }) {
  const cover = data.posterUrl || data.bannerUrl ||
    CATEGORY_COVERS[(data.category || 'other') as keyof typeof CATEGORY_COVERS]?.[0]
  const categoryLabel = CATEGORIES.find(c => c.value === data.category)?.label.replace(/^\S+\s/, '') || 'Категория'
  const price = data.ticketTypes.length ? Math.min(...data.ticketTypes.map(t => Number(t.price || 0))) : null
  const completion = getCompletion(data)

  return (
    <div style={{ position: 'sticky', top: 88 }}>
      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span>Live preview</span><span>{completion}% готово</span>
      </div>
      <div style={{ border: '1px solid var(--color-border-tertiary)', borderRadius: 20, background: 'var(--color-background-primary)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
        <div style={{
          height: 190,
          backgroundImage: cover ? `url(${cover})` : undefined,
          background: cover ? undefined : 'linear-gradient(135deg, var(--color-background-secondary), var(--color-background-tertiary))',
          backgroundSize: 'cover', backgroundPosition: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-tertiary)', fontSize: 13,
        }}>
          {!cover && 'Афиша события'}
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: 12, marginBottom: 6 }}>{categoryLabel}</div>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, lineHeight: 1.2, letterSpacing: '-0.03em', transition: 'all 0.2s ease' }}>
            {data.title || 'Название события'}
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 12px', fontSize: 13, lineHeight: 1.45 }}>
            {data.shortDesc || 'Короткое описание события'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--color-text-secondary)', fontSize: 12, borderTop: '1px solid var(--color-border-tertiary)', paddingTop: 12 }}>
            <span>📅 {data.startAt ? new Date(data.startAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : 'Дата не указана'}</span>
            <span>📍 {data.isOnlineEvent ? 'Онлайн' : data.venueName || data.venueCity || 'Место не указано'}</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 17, fontWeight: 800, transition: 'all 0.2s ease' }}>
  {price !== null ? `от ${price.toLocaleString('ru-RU')} ₸` : 'Билеты не добавлены'}
</div>
        </div>
      </div>

      {/* Completion score */}
      <div style={{ marginTop: 10, border: '1px solid var(--color-border-tertiary)', borderRadius: 14, padding: 14, background: 'var(--color-background-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <b>Готовность</b>
          <span style={{ color: completion >= 80 ? '#18a66a' : 'var(--color-text-secondary)' }}>{completion}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: 'var(--color-background-secondary)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completion}%`, background: completion >= 80 ? '#18a66a' : 'var(--color-accent)', borderRadius: 999, transition: 'width 0.3s' }} />
        </div>

        {/* Step checklist */}
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STEPS.slice(0, 4).map((s, i) => {
            const done = isStepComplete(i, data)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: done ? '#18a66a' : 'var(--color-text-tertiary)' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, background: done ? '#e1f5ee' : 'var(--color-background-secondary)', color: done ? '#0f6e56' : 'var(--color-text-tertiary)', flexShrink: 0 }}>
                  {done ? '✓' : i + 1}
                </span>
                {s.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function NewEventPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(WIZARD_EMPTY)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [lastSavedAt, setLastSavedAt] = useState('')
  const [errors, setErrors] = useState<ApiFieldError[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const hydrated = useRef(false)
  const formRef = useRef<HTMLDivElement>(null)

  // Load draft
  useEffect(() => {
    const local = readLocalDraft()
    if (local) setData(local)
    hydrated.current = true
  }, [])

  // Autosave localStorage
  useEffect(() => {
    if (!hydrated.current) return
    setIsDirty(true)
    setSaveState('saving')
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, updatedAt: new Date().toISOString() }))
        setLastSavedAt(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
        setSaveState('saved')
      } catch { setSaveState('error') }
    }, 700)
    return () => window.clearTimeout(id)
  }, [data])

  // Dirty state warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Keyboard shortcut Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveToServer(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [data])

  const update = useCallback((patch: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...patch }))
    setErrors([])
    setApiError(null)
  }, [])

  const go = (n: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)))
    setErrors([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToError = () => {
    setTimeout(() => {
      const el = formRef.current?.querySelector('[data-error]')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const saveToServer = async (publish: boolean) => {
    setApiError(null)
    if (publish) {
      const errs = validateForPublish(data)
      if (errs.length) {
        setErrors(errs)
        if (typeof errs[0].step === 'number') go(errs[0].step)
        scrollToError()
        return
      }
    }
    if (!publish && !data.title.trim()) {
      setErrors([{ field: 'title', label: 'Название', message: 'Укажите название для сохранения черновика', step: 0 }])
      go(0)
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
        throw new Error(json.error || 'Не удалось сохранить')
      }
      window.localStorage.removeItem(DRAFT_KEY)
      setIsDirty(false)
      setSaveState('saved')
      router.push('/dashboard/events' + (publish ? '?status=PENDING_REVIEW' : '?status=DRAFT'))
    } catch (e) {
      setSaveState('error')
      setApiError(e instanceof Error ? e.message : 'Ошибка сохранения')
    }
  }

  const stepProps = { data, update, onNext: () => go(step + 1), onPrev: () => go(step - 1) }
  const StepComponents = [Step1BasicInfo, Step2Media, Step4Venue, Step3Tickets, Step5Publish]
  const CurrentStep = StepComponents[step]
  const completion = useMemo(() => getCompletion(data), [data])
  const isLastStep = step === STEPS.length - 1

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-tertiary)', color: 'var(--color-text-primary)' }}>

      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--color-background-primary)', borderBottom: '1px solid var(--color-border-tertiary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <Link href="/dashboard/events" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: 13, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              ← Кабинет
            </Link>
            <span style={{ color: 'var(--color-border-secondary)' }}>|</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Новое событие</span>
          </div>

          <span style={{ fontSize: 12, color: saveState === 'saved' ? '#18a66a' : saveState === 'error' ? 'var(--color-danger)' : saveState === 'saving' ? 'var(--color-accent)' : 'transparent' }}>
            {saveState === 'saving' ? 'Сохраняем…' : saveState === 'saved' ? `✓ Сохранено ${lastSavedAt}` : saveState === 'error' ? '✕ Ошибка' : '·'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/dashboard/events?status=DRAFT" style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '6px 12px', border: '1px solid var(--color-border-tertiary)', borderRadius: 8, textDecoration: 'none' }}>
              Черновики
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* STEP TABS */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', overflowX: 'auto' }}>
          {STEPS.map((s, i) => {
            const done = isStepComplete(i, data)
            return (
              <button
                key={i}
                onClick={() => go(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '10px 14px 8px', fontSize: 12,
                  fontWeight: i === step ? 600 : 400,
                  color: i === step ? 'var(--color-text-primary)' : done ? '#18a66a' : 'var(--color-text-tertiary)',
                  background: 'none', border: 'none',
                  borderBottom: i === step ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                  whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
                }}
              >
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: done ? '#e1f5ee' : i === step ? 'var(--color-text-primary)' : 'var(--color-background-secondary)',
                  color: done ? '#0f6e56' : i === step ? 'var(--color-background-primary)' : 'var(--color-text-tertiary)',
                }}>
                  {done ? '✓' : i + 1}
                </span>
                <span>{s.label}</span>
              </button>
            )
          })}
        </div>

        <div style={{ height: 2, background: 'var(--color-border-tertiary)' }}>
          <div style={{ height: 2, background: 'var(--color-accent)', width: `${((step + 1) / STEPS.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
      </header>

      {/* MOBILE PREVIEW TOGGLE */}
      <div className="wiz-mobile-toggle">
        <button onClick={() => setShowPreview(v => !v)}>
          {showPreview ? '✕ Скрыть предпросмотр' : '👁 Предпросмотр · ' + completion + '%'}
        </button>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 100px' }}>
        <div className="wiz-grid">

          {/* FORM */}
          <div ref={formRef}>
            {(apiError || errors.length > 0) && (
              <div style={{ marginBottom: 16, padding: '14px 16px', borderRadius: 14, background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', color: 'var(--color-danger-text)', fontSize: 13 }} data-error>
                <b style={{ display: 'block', marginBottom: 6 }}>
                  {apiError ? 'Не удалось сохранить' : 'Исправьте перед публикацией'}
                </b>
                {apiError && <p style={{ margin: 0 }}>{apiError}</p>}
                {errors.length > 0 && (
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                    {errors.map((e, idx) => (
                      <li key={idx}>
                        <button onClick={() => { if (typeof e.step === 'number') go(e.step) }}
                          style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: '2px 0', fontSize: 13 }}>
                          {e.label}: {e.message}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <CurrentStep {...stepProps} />
          </div>

          {/* PREVIEW desktop */}
          <div className="wiz-preview-desktop">
            <EventPreview data={data} />
          </div>

          {/* PREVIEW mobile */}
          {showPreview && (
            <div className="wiz-preview-mobile">
              <EventPreview data={data} />
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        background: 'var(--color-background-primary)',
        borderTop: '1px solid var(--color-border-tertiary)',
        padding: '10px 20px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <button onClick={() => go(step - 1)} disabled={step === 0}
            style={{ height: 40, padding: '0 18px', fontSize: 13, border: '1px solid var(--color-border-secondary)', borderRadius: 10, color: 'var(--color-text-secondary)', background: 'transparent', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.35 : 1 }}>
            ← Назад
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => saveToServer(false)}
              style={{ height: 40, padding: '0 16px', fontSize: 13, border: '1px solid var(--color-border-secondary)', borderRadius: 10, color: 'var(--color-text-secondary)', background: 'transparent', cursor: 'pointer' }}>
              Сохранить
            </button>
            {isLastStep ? (
              <button onClick={() => saveToServer(true)}
                style={{ height: 40, padding: '0 20px', fontSize: 13, fontWeight: 600, borderRadius: 10, background: 'var(--color-text-primary)', color: 'var(--color-background-primary)', border: 'none', cursor: 'pointer' }}>
                Отправить на проверку
              </button>
            ) : (
              <button onClick={() => go(step + 1)}
                style={{ height: 40, padding: '0 20px', fontSize: 13, fontWeight: 600, borderRadius: 10, background: 'var(--color-text-primary)', color: 'var(--color-background-primary)', border: 'none', cursor: 'pointer' }}>
                Далее →
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .wiz-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 24px;
          align-items: start;
        }
        .wiz-preview-desktop { display: block; }
        .wiz-preview-mobile { display: none; }
        .wiz-mobile-toggle { display: none; }

        @media (max-width: 860px) {
          .wiz-grid { grid-template-columns: 1fr !important; }
          .wiz-preview-desktop { display: none !important; }
          .wiz-preview-mobile { display: block; grid-column: 1 / -1; }
          .wiz-mobile-toggle {
            display: block;
            padding: 10px 20px;
            background: var(--color-background-primary);
            border-bottom: 1px solid var(--color-border-tertiary);
          }
          .wiz-mobile-toggle button {
            width: 100%; height: 38px;
            border: 1px solid var(--color-border-tertiary);
            border-radius: 10px;
            background: var(--color-background-secondary);
            color: var(--color-text-secondary);
            font-size: 13px; cursor: pointer;
          }
        }
      `}</style>
    </div>
  )
}