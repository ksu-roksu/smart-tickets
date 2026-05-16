'use client'

import Link from 'next/link'
import type { StepProps } from './ui'
import { WizardCard, WizardSection, Field, Input, Toggle } from './ui'

interface FieldError {
  field: string
  label: string
  message: string
  step: number
}

interface Step5Props extends StepProps {
  saving: boolean
  onSubmit: (publish: boolean) => void
  validationErrors?: FieldError[]
  onGoToStep?: (step: number) => void
}

interface CheckItem {
  key: string
  label: string
  ok: boolean
  required?: boolean
  hint?: string
  step?: number
}

export default function Step5Publish({ data, update, onPrev, saving, onSubmit, validationErrors = [], onGoToStep }: Step5Props) {
  const checks: CheckItem[] = [
    { key: 'title', label: 'Название события', ok: data.title.trim().length >= 3, required: true, step: 0 },
    { key: 'category', label: 'Категория выбрана', ok: !!data.category, required: true, step: 0 },
    { key: 'date', label: 'Дата и время начала', ok: !!data.startAt, required: true, step: 0 },
    { key: 'tickets', label: 'Типы билетов', ok: data.ticketTypes.length > 0, required: true, step: 2 },
    { key: 'venue', label: 'Площадка или онлайн-событие', ok: data.isOnlineEvent || !!data.venueId || data.isNewVenue, required: true, step: 3 },
    { key: 'poster', label: 'Афиша события', ok: !!data.posterUrl, hint: 'Не обязательно: можно использовать автообложку', step: 1 },
    { key: 'refund', label: 'Политика возврата', ok: !!data.refundPolicy, required: true, step: 2 },
  ]

  const requiredPassed = checks.filter(c => c.required).every(c => c.ok)
  const passedCount = checks.filter(c => c.ok).length
  const autoSlug = data.title.toLowerCase().replace(/[^a-zа-яё0-9\s]/gi, '').replace(/\s+/g, '-').slice(0, 60)
  const totalCapacity = data.ticketTypes.reduce((s, t) => s + (Number(t.totalSeats) || 0), 0)
  const minPrice = data.ticketTypes.length ? Math.min(...data.ticketTypes.map(t => Number(t.price) || 0)) : 0
  const isFree = data.ticketTypes.length > 0 && data.ticketTypes.every(t => Number(t.price) === 0)

  return (
    <div className="space-y-4">
      {validationErrors.length > 0 && (
        <WizardCard>
          <WizardSection title="Что нужно поправить" description="Нажмите на пункт, чтобы перейти к нужному шагу">
            <div className="space-y-2">
              {validationErrors.map((item, index) => (
                <button
                  key={`${item.field}-${index}`}
                  type="button"
                  onClick={() => onGoToStep?.(item.step)}
                  className="w-full text-left rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger-text)] hover:opacity-90"
                >
                  <b>{item.label}</b> — {item.message}
                </button>
              ))}
            </div>
          </WizardSection>
        </WizardCard>
      )}

      <WizardCard>
        <WizardSection title="Чеклист перед публикацией" description={`${passedCount} из ${checks.length} пунктов заполнено`}>
          <div className="mb-4 h-1.5 bg-[var(--color-background-secondary)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(passedCount / checks.length) * 100}%`, background: requiredPassed ? '#1D9E75' : '#EF9F27' }} />
          </div>

          <div className="space-y-2">
            {checks.map(item => (
              <button key={item.key} type="button" onClick={() => item.step !== undefined && onGoToStep?.(item.step)} className="w-full flex items-center gap-3 py-2 border-b border-[var(--color-border-tertiary)] last:border-0 text-left hover:opacity-85">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-[#E1F5EE]' : 'bg-[var(--color-background-secondary)]'}`}>
                  {item.ok ? <span style={{ fontSize: 11, color: '#0F6E56' }}>✓</span> : <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>—</span>}
                </span>
                <span className="flex-1">
                  <span className={`text-[13px] ${item.ok ? 'text-[var(--color-text-primary)]' : item.required ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-text-secondary)]'}`}>
                    {item.label}{item.required && <span className="ml-1 text-[var(--color-danger-text)]">*</span>}
                  </span>
                  {!item.ok && item.hint && <span className="text-[11px] text-[var(--color-text-tertiary)] ml-2">({item.hint})</span>}
                </span>
              </button>
            ))}
          </div>
        </WizardSection>
      </WizardCard>

      <WizardCard>
        <WizardSection title="Предпросмотр" description="Так событие будет выглядеть в каталоге и списке событий">
          <div className="flex gap-4">
            <div className="w-24 h-16 rounded-lg overflow-hidden bg-[var(--color-background-secondary)] flex-shrink-0">
              {data.posterUrl ? <img src={data.posterUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[22px]">🎫</div>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium text-[var(--color-text-primary)] truncate">{data.title || 'Без названия'}</div>
              <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                {data.startAt ? new Intl.DateTimeFormat('ru-KZ', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(data.startAt)) : 'Дата не указана'}
              </div>
              <div className="text-[12px] text-[var(--color-text-secondary)]">{data.isOnlineEvent ? 'Онлайн-событие' : data.venueName ? `${data.venueName}${data.venueCity ? `, ${data.venueCity}` : ''}` : 'Площадка не указана'}</div>
              <div className="flex items-center gap-3 mt-2">
                {data.ticketTypes.length > 0 && <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{isFree ? 'Бесплатно' : `от ₸ ${minPrice.toLocaleString('ru-KZ')}`}</span>}
                {totalCapacity > 0 && <span className="text-[11px] text-[var(--color-text-secondary)]">{totalCapacity.toLocaleString('ru-KZ')} мест</span>}
              </div>
            </div>
          </div>
        </WizardSection>
      </WizardCard>

      <WizardCard>
        <WizardSection title="SEO и URL" description="Необязательно — заполним автоматически">
          <Field label="URL события (slug)" info="Человекопонятный адрес страницы события. Можно оставить автоматически сформированный вариант.">
            <div className="flex gap-2 items-center">
              <span className="text-[12px] text-[var(--color-text-tertiary)] flex-shrink-0">/events/</span>
              <Input value={data.slug || autoSlug} onChange={v => update({ slug: v.toLowerCase().replace(/\s+/g, '-') })} placeholder={autoSlug} />
            </div>
          </Field>
          <Field label="Meta Title" hint="По умолчанию — название события" info="Заголовок для поисковиков и шаринга. Помогает событию лучше отображаться в Google и соцсетях.">
            <Input value={data.metaTitle} onChange={v => update({ metaTitle: v })} placeholder={data.title} />
          </Field>
          <Field label="Meta Description" hint="По умолчанию — краткое описание" info="Короткое описание для поисковой выдачи и предпросмотра ссылки.">
            <Input value={data.metaDesc} onChange={v => update({ metaDesc: v })} placeholder={data.shortDesc} />
          </Field>
        </WizardSection>

        <div style={{ padding: '0 20px 18px' }}>
          <Toggle
            checked={data.requiresApproval}
            onChange={v => update({ requiresApproval: v })}
            label="Требуется одобрение организатора"
            description="Покупатель сможет купить билет только после вашего подтверждения"
            info="Включайте для событий, где каждую заявку нужно проверять вручную: VIP-мероприятия, закрытые показы, B2B-гости. Для обычной продажи лучше выключить."
          />
        </div>
      </WizardCard>

    </div>
  )
}
