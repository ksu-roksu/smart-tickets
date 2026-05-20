"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import ThemeToggle from '@/app/components/ThemeToggle'

import {
  WIZARD_EMPTY,
  CATEGORY_COVERS,
  CATEGORIES,
  type WizardData,
} from '@/components/dashboard/wizard/types'

import Step1BasicInfo from '@/components/dashboard/wizard/Step1BasicInfo'
import Step2Media from '@/components/dashboard/wizard/Step2Media'
import Step3Tickets from '@/components/dashboard/wizard/Step3Tickets'
import Step4Venue from '@/components/dashboard/wizard/Step4Venue'
import Step5Publish from '@/components/dashboard/wizard/Step5Publish'

const DRAFT_KEY = 'smart.eventEditor.draft'

const STEPS = [
  { label: 'Основное' },
  { label: 'Медиа' },
  { label: 'Дата и место' },
  { label: 'Билеты' },
  { label: 'Публикация' },
]

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type ApiFieldError = {
  field: string
  label?: string
  message: string
  step?: number
}

function isStepComplete(step: number, data: WizardData): boolean {
  switch (step) {
    case 0:
      return Boolean(data.title.trim() && data.category)

    case 1:
      return Boolean(data.posterUrl || data.bannerUrl)

    case 2:
      return Boolean(
        data.isOnlineEvent ||
        data.venueId ||
        data.venueName.trim()
      )

    case 3:
      return data.ticketTypes.length > 0

    default:
      return false
  }
}

function getCompletion(data: WizardData) {
  const checks = [
    Boolean(data.title.trim()),
    Boolean(data.category),
    Boolean(data.posterUrl || data.bannerUrl),
    Boolean(data.startAt),
    Boolean(
      data.isOnlineEvent ||
      data.venueId ||
      data.venueName.trim()
    ),
    Boolean(data.ticketTypes.length),
    Boolean(data.shortDesc.trim()),
  ]

  return Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  )
}

function readLocalDraft(): WizardData | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)

    if (!raw) return null

    return {
      ...WIZARD_EMPTY,
      ...JSON.parse(raw).data,
    }
  } catch {
    return null
  }
}

function EventPreview({
  data,
}: {
  data: WizardData
}) {
  const cover =
    data.posterUrl ||
    data.bannerUrl ||
    CATEGORY_COVERS[
      (data.category || 'other') as keyof typeof CATEGORY_COVERS
    ]?.[0]

  const categoryLabel =
    CATEGORIES.find(c => c.value === data.category)?.label ||
    'Категория'

  const price = data.ticketTypes.length
    ? Math.min(...data.ticketTypes.map(t => Number(t.price || 0)))
    : null

  const completion = getCompletion(data)

  return (
    <div style={{ position: 'sticky', top: 96 }}>

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Live preview
        </span>

        <span
          style={{
            fontSize: 11,
            color:
              completion >= 80
                ? '#18a66a'
                : 'var(--color-text-tertiary)',
          }}
        >
          {completion}% готово
        </span>
      </div>

      {/* CARD */}
      <div
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          background: 'var(--dash-card-bg)',
          border: '1px solid var(--color-border-tertiary)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
        }}
      >
        <div
          style={{
            height: 220,
            backgroundImage: cover ? `url(${cover})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(0,0,0,.88), rgba(0,0,0,.18))',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 18,
              top: 18,
              padding: '7px 12px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid var(--color-border-tertiary)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {categoryLabel}
          </div>
        </div>

        <div style={{ padding: 22 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: "var(--color-text-primary)",
            }}
          >
            {data.title || 'Название события'}
          </h3>

          <p
            style={{
              marginTop: 12,
              marginBottom: 18,
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--color-text-secondary)',
            }}
          >
            {data.shortDesc || 'Короткое описание события'}
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              paddingTop: 18,
              borderTop: '1px solid var(--color-border-tertiary)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--color-text-primary)',
                fontSize: 13,
              }}
            >
              📅

              <span>
                {data.startAt
                  ? new Date(data.startAt).toLocaleString('ru-RU')
                  : 'Дата не указана'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--color-text-primary)',
                fontSize: 13,
              }}
            >
              📍

              <span>
                {data.isOnlineEvent
                  ? 'Онлайн'
                  : data.venueName || data.venueCity || 'Алматы'}
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Стоимость
              </div>

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.05em',
                }}
              >
                {price !== null
                  ? `от ${price.toLocaleString('ru-RU')} ₸`
                  : '—'}
              </div>
            </div>

            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#fff',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              →
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewEventPage() {
  const router = useRouter()

  const [step, setStep] = useState(0)

  const [data, setData] =
    useState<WizardData>(WIZARD_EMPTY)

  const [saveState, setSaveState] =
    useState<SaveState>('idle')

  const [lastSavedAt, setLastSavedAt] =
    useState('')

  const [showPreview, setShowPreview] =
    useState(false)

  const hydrated = useRef(false)

  useEffect(() => {
    const local = readLocalDraft()

    if (local) setData(local)

    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return

    setSaveState('saving')

    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            data,
            updatedAt: new Date().toISOString(),
          })
        )

        setLastSavedAt(
          new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })
        )

        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }, 700)

    return () => window.clearTimeout(id)
  }, [data])

  const update = useCallback(
    (patch: Partial<WizardData>) => {
      setData(prev => ({ ...prev, ...patch }))
    },
    []
  )

  const go = (n: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)))

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const stepProps = {
    data,
    update,
    onNext: () => go(step + 1),
    onPrev: () => go(step - 1),
  }

  const StepComponents = [
    Step1BasicInfo,
    Step2Media,
    Step4Venue,
    Step3Tickets,
    Step5Publish,
  ]

  const CurrentStep = StepComponents[step]

  const completion = useMemo(
    () => getCompletion(data),
    [data]
  )

  const isLastStep =
    step === STEPS.length - 1

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--dash-bg)',
        color: "var(--color-text-primary)",
      }}
    >

      {/* HEADER */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'color-mix(in oklab, var(--dash-bg) 92%, transparent)',
          backdropFilter: 'blur(18px)',
          borderBottom:
            '1px solid var(--color-border-tertiary)',
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            padding: '0 28px',
            height: 92,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Link
              href="/dashboard/events"
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border:
                  '1px solid rgba(249,115,22,0.25)',
                background:
                  'rgba(249,115,22,0.10)',
                color: '#FB923C',
                textDecoration: 'none',
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              ←
            </Link>

            <div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: "var(--color-text-primary)",
                }}
              >
                Создание события
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 13,
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Шаг {step + 1} из {STEPS.length}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 14,
                background: 'var(--color-background-secondary)',
                border:
                  '1px solid var(--color-border-tertiary)',
                fontSize: 12,
                color:
                  saveState === 'saved'
                    ? '#18a66a'
                    : 'var(--color-text-secondary)',
              }}
            >
              {saveState === 'saving'
                ? 'Сохраняем...'
                : saveState === 'saved'
                  ? `✓ Сохранено ${lastSavedAt}`
                  : `${completion}% готово`}
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '32px 28px 120px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(0,1fr) 380px',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <div>
            <CurrentStep {...stepProps} />
          </div>

          <div>
            <EventPreview data={data} />
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: 'color-mix(in oklab, var(--dash-bg) 88%, transparent)',
          backdropFilter: 'blur(18px)',
          borderTop:
            '1px solid var(--color-border-tertiary)',
          padding: '12px 28px',
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => go(step - 1)}
            disabled={step === 0}
            style={{
              height: 44,
              padding: '0 20px',
              borderRadius: 14,
              border:
                '1px solid var(--color-border-tertiary)',
              background: 'var(--color-background-secondary)',
              color: 'var(--color-text-secondary)',
            }}
          >
            ← Назад
          </button>

          <div
            style={{
              display: 'flex',
              gap: 10,
            }}
          >
            <button
              style={{
                height: 44,
                padding: '0 20px',
                borderRadius: 14,
                border:
                  '1px solid var(--color-border-tertiary)',
                background: 'var(--color-background-secondary)',
                color: 'var(--color-text-primary)',
              }}
            >
              Сохранить
            </button>

            <button
              onClick={() =>
                isLastStep
                  ? router.push('/dashboard/events')
                  : go(step + 1)
              }
              style={{
                height: 44,
                padding: '0 24px',
                borderRadius: 14,
                border:
                  '1px solid rgba(249,115,22,0.35)',
                background:
                  'linear-gradient(180deg, rgba(249,115,22,0.22), rgba(249,115,22,0.12))',
                color: '#FB923C',
                fontWeight: 700,
              }}
            >
              {isLastStep
                ? 'Отправить на проверку'
                : 'Далее →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}