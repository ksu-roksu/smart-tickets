'use client'

/**
 * components/dashboard/wizard/Step4Venue.tsx
 * Step 4: Место и площадка
 */

import { useState, useEffect, useCallback } from 'react'
import type { StepProps } from './ui'
import { WizardCard, WizardSection, Field, Input, Toggle, WizardNav } from './ui'

interface VenueResult {
  id: string
  name: string
  address: string
  city: string
  capacity: number | null
}

const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актау', 'Атырау', 'Павлодар', 'Тараз']

export default function Step4Venue({ data, update, onNext, onPrev }: StepProps) {
  const [query, setQuery] = useState(data.venueName)
  const [city, setCity] = useState(data.venueCity || 'Алматы')
  const [results, setResults] = useState<VenueResult[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Search venues from API
  const search = useCallback(async (q: string, c: string) => {
    if (!q.trim() && !c) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, city: c, limit: '8' })
      const res = await fetch(`/api/dashboard/venues?${params}`)
      if (res.ok) {
        const json = await res.json()
        setResults(json.data ?? [])
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query, city), 300)
    return () => clearTimeout(timer)
  }, [query, city, search])

  const selectVenue = (v: VenueResult) => {
    update({
      venueId: v.id,
      venueName: v.name,
      venueCity: v.city,
      venueAddress: v.address,
      isNewVenue: false,
    })
    setQuery(v.name)
    setResults([])
  }

  const clearVenue = () => {
    update({ venueId: '', venueName: '', venueCity: '', venueAddress: '', isNewVenue: false })
    setQuery('')
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!data.isOnlineEvent) {
      if (!data.venueId && !data.isNewVenue) {
        e.venue = 'Выберите площадку или добавьте новую'
      }
      if (data.isNewVenue && !data.venueName.trim()) {
        e.venueName = 'Введите название площадки'
      }
      if (data.isNewVenue && !data.venueAddress.trim()) {
        e.venueAddress = 'Введите адрес'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
     onNext()
  }

  const isSelected = !!data.venueId || data.isNewVenue

  return (
    <div className="space-y-4">
      {/* Online event shortcut */}
      {data.isOnlineEvent && (
        <WizardCard>
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
              <i className="ti ti-world" style={{ fontSize: 18, color: '#0F6E56' }} aria-hidden="true" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-[var(--color-text-primary)]">Онлайн-событие</div>
              <div className="text-[12px] text-[var(--color-text-secondary)]">Физическая площадка не нужна</div>
            </div>
          </div>
        </WizardCard>
      )}

      {!data.isOnlineEvent && (
        <>
          {/* Venue search */}
          <WizardCard>
            <WizardSection title="Площадка" description="Найдите существующую или добавьте новую">
              {errors.venue && (
                <div className="mb-3 px-3 py-2 rounded-[var(--border-radius-md)] bg-[var(--color-background-danger)] text-[var(--color-text-danger)] text-[12px]">
                  {errors.venue}
                </div>
              )}

              {/* Selected venue */}
              {isSelected && !data.isNewVenue && (
                <div className="mb-4 flex items-center gap-3 px-3 py-2.5 rounded-[var(--border-radius-md)] bg-[#E1F5EE] border border-[#9FE1CB]">
                  <i className="ti ti-map-pin" style={{ fontSize: 16, color: '#0F6E56' }} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#085041]">{data.venueName}</div>
                    <div className="text-[11px] text-[#0F6E56]">{data.venueAddress} · {data.venueCity}</div>
                  </div>
                  <button
                    onClick={clearVenue}
                    className="text-[#0F6E56] hover:text-[#085041]"
                    aria-label="Сменить площадку"
                  >
                    <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true" />
                  </button>
                </div>
              )}

              {!isSelected && (
                <>
                  {/* City filter */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {CITIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setCity(c)}
                        className={`
                          px-3 py-1 text-[12px] rounded-full border transition-colors
                          ${city === c
                            ? 'bg-[var(--color-text-primary)] text-[var(--color-background-primary)] border-[var(--color-text-primary)]'
                            : 'border-[var(--color-border-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-primary)]'
                          }
                        `}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Field label="Поиск площадки" info="Начните вводить название существующей площадки. Если её нет — создайте новую.">
                      <div className="relative">
                        <Input
                          value={query}
                          onChange={v => { setQuery(v); update({ venueId: '', venueName: v }) }}
                          placeholder="Arena, Центральный стадион..."
                        />
                        {loading && (
                          <i
                            className="ti ti-loader-2 animate-spin absolute right-3 top-2.5"
                            style={{ fontSize: 16, color: 'var(--color-text-tertiary)' }}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </Field>

                    {/* Results dropdown */}
                    {results.length > 0 && (
                      <div className="border border-[var(--color-border-secondary)] rounded-[var(--border-radius-lg)] overflow-hidden">
                        {results.map(v => (
                          <button
                            key={v.id}
                            onClick={() => selectVenue(v)}
                            className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-[var(--color-background-secondary)] transition-colors border-b border-[var(--color-border-tertiary)] last:border-0"
                          >
                            <i className="ti ti-building" style={{ fontSize: 16, color: 'var(--color-text-tertiary)', marginTop: 1 }} aria-hidden="true" />
                            <div>
                              <div className="text-[13px] font-medium text-[var(--color-text-primary)]">{v.name}</div>
                              <div className="text-[11px] text-[var(--color-text-secondary)]">
                                {v.address} · {v.city}
                                {v.capacity ? ` · ${v.capacity.toLocaleString('ru-KZ')} мест` : ''}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {results.length === 0 && query.trim().length > 1 && !loading && (
                      <p className="text-[12px] text-[var(--color-text-secondary)] mt-2">
                        Площадка не найдена —{' '}
                        <button
                          onClick={() => update({ isNewVenue: true, venueName: query, venueCity: city })}
                          className="text-[var(--color-text-info)] hover:underline"
                        >
                          добавить новую
                        </button>
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-[var(--color-border-tertiary)]">
                <Toggle
                  checked={data.isNewVenue}
                  onChange={v => update({ isNewVenue: v, venueId: '' })}
                  label="Добавить новую площадку"
                  description="Если площадки нет в базе — добавим её"
                />
              </div>
            </WizardSection>
          </WizardCard>

          {/* New venue form */}
          {data.isNewVenue && (
            <WizardCard>
              <WizardSection title="Новая площадка">
                <Field label="Название" required error={errors.venueName} info="Официальное или понятное покупателю название площадки.">
                  <Input
                    value={data.venueName}
                    onChange={v => update({ venueName: v })}
                    placeholder="Арена Almaty"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Город" required info="Город используется в фильтрах каталога и географии события.">
                    <select
                      value={data.venueCity}
                      onChange={e => update({ venueCity: e.target.value })}
                      className="
                        w-full px-3 py-2 text-[13px] rounded-[var(--border-radius-md)]
                        bg-[var(--color-background-primary)]
                        border border-[var(--color-border-secondary)]
                        text-[var(--color-text-primary)]
                        focus:outline-none focus:border-[var(--color-border-primary)]
                      "
                    >
                      <option value="">Выберите город</option>
                      {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Вместимость" info="Помогает контролировать лимиты продаж и вместимость площадки.">
                    <Input
                      type="number"
                      value={data.venueAddress}
                      onChange={v => update({ venueAddress: v })}
                      placeholder="5000"
                    />
                  </Field>
                </div>

                <Field label="Адрес" required error={errors.venueAddress} info="Адрес будет показан покупателю на странице события и в билете.">
                  <Input
                    value={data.venueAddress}
                    onChange={v => update({ venueAddress: v })}
                    placeholder="пр. Аль-Фараби, 77"
                  />
                </Field>
              </WizardSection>
            </WizardCard>
          )}
        </>
      )}

      <WizardNav
        onPrev={onPrev}
        onNext={handleNext}
      />
    </div>
  )
}
