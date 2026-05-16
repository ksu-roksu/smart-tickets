'use client'

/**
 * components/dashboard/wizard/Step3Tickets.tsx
 * Step 3: Билеты, цены, квоты
 */

import { useState } from 'react'
import { nanoid } from 'nanoid'
import type { StepProps, TicketTypeForm } from './types'
import {
  WizardCard, WizardSection, Field,
  Input, Select, Toggle, WizardNav,
} from './ui'

const REFUND_OPTIONS = [
  { value: 'STANDARD', label: 'Стандартный — за 7 дней до события' },
  { value: 'FLEXIBLE', label: 'Гибкий — за 24 часа до события' },
  { value: 'NO_REFUND', label: 'Без возврата' },
  { value: 'CUSTOM',   label: 'Кастомные условия' },
]

const TICKET_PRESETS = [
  { name: 'Стандарт', description: '' },
  { name: 'VIP', description: 'Приоритетный вход, лучшие места' },
  { name: 'Fan Zone', description: 'Фан-зона, стоячие места' },
  { name: 'Premium', description: 'Премиум зона' },
]

function emptyTicket(): TicketTypeForm {
  return {
    id: nanoid(),
    name: '',
    price: 0,
    currency: 'KZT',
    totalSeats: 100,
    description: '',
    earlyBirdPrice: null,
    earlyBirdUntil: null,
    earlyBirdCount: null,
    maxPerOrder: 8,
    minPerOrder: 1,
    saleStartAt: null,
    saleEndAt: null,
  }
}

export default function Step3Tickets({ data, update, onNext, onPrev }: StepProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tickets = data.ticketTypes

  const addTicket = (preset?: typeof TICKET_PRESETS[0]) => {
    const t = emptyTicket()
    if (preset) {
      t.name = preset.name
      t.description = preset.description
    }
    update({ ticketTypes: [...tickets, t] })
    setExpandedId(t.id)
  }

  const updateTicket = (id: string, patch: Partial<TicketTypeForm>) => {
    update({
      ticketTypes: tickets.map(t => t.id === id ? { ...t, ...patch } : t),
    })
  }

  const removeTicket = (id: string) => {
    update({ ticketTypes: tickets.filter(t => t.id !== id) })
    if (expandedId === id) setExpandedId(null)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (tickets.length === 0) {
      e.general = 'Добавьте хотя бы один тип билета'
    }
    tickets.forEach(t => {
      if (!t.name.trim()) e[`${t.id}_name`] = 'Укажите название'
      if (t.totalSeats < 1) e[`${t.id}_seats`] = 'Минимум 1 место'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
     onNext()
  }

  const totalCapacity = tickets.reduce((s, t) => s + t.totalSeats, 0)
  const isFreeEvent = tickets.length > 0 && tickets.every(t => t.price === 0)

  return (
    <div className="space-y-4">
      {/* Ticket types */}
      <WizardCard>
        <WizardSection
          title="Типы билетов"
          description="Добавьте один или несколько типов — Стандарт, VIP, Fan Zone и т.д."
        >
          {errors.general && (
            <div className="mb-3 px-3 py-2 rounded-[var(--border-radius-md)] bg-[var(--color-background-danger)] text-[var(--color-text-danger)] text-[12px]">
              {errors.general}
            </div>
          )}

          {/* Existing tickets */}
          <div className="space-y-2 mb-4">
            {tickets.map((ticket) => {
              const isOpen = expandedId === ticket.id
              const hasEarlyBird = ticket.earlyBirdPrice !== null

              return (
                <div
                  key={ticket.id}
                  className="border border-[var(--color-border-tertiary)] rounded-[var(--border-radius-lg)] overflow-hidden"
                >
                  {/* Ticket header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-background-secondary)] transition-colors"
                    onClick={() => setExpandedId(isOpen ? null : ticket.id)}
                  >
                    <i className="ti ti-ticket" style={{ fontSize: 16, color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[var(--color-text-primary)]">
                        {ticket.name || 'Без названия'}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-secondary)]">
                        {ticket.price === 0 ? 'Бесплатно' : `₸ ${ticket.price.toLocaleString('ru-KZ')}`}
                        {' · '}
                        {ticket.totalSeats.toLocaleString('ru-KZ')} мест
                        {hasEarlyBird && ' · Early Bird'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); removeTicket(ticket.id) }}
                        className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-danger)] transition-colors"
                        aria-label="Удалить тип билета"
                      >
                        <i className="ti ti-trash" style={{ fontSize: 14 }} aria-hidden="true" />
                      </button>
                      <i
                        className={`ti ${isOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`}
                        style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Ticket form */}
                  {isOpen && (
                    <div className="px-4 py-4 border-t border-[var(--color-border-tertiary)] space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Название" required error={errors[`${ticket.id}_name`]} info="Например: Fan zone, VIP, Балкон, Стандарт.">
                          <Input
                            value={ticket.name}
                            onChange={v => updateTicket(ticket.id, { name: v })}
                            placeholder="Стандарт"
                          />
                        </Field>
                        <Field label="Описание">
                          <Input
                            value={ticket.description}
                            onChange={v => updateTicket(ticket.id, { description: v })}
                            placeholder="Приоритетный вход, лучшие места"
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <Field label="Цена (₸)" error={errors[`${ticket.id}_price`]} info="Укажите цену одного билета в тенге. Для бесплатного билета поставьте 0.">
                          <Input
                            type="number"
                            value={ticket.price}
                            onChange={v => updateTicket(ticket.id, { price: Math.max(0, parseInt(v) || 0) })}
                            placeholder="0"
                          />
                        </Field>
                        <Field label="Мест" required error={errors[`${ticket.id}_seats`]} info="Общий лимит билетов этого типа.">
                          <Input
                            type="number"
                            value={ticket.totalSeats}
                            onChange={v => updateTicket(ticket.id, { totalSeats: Math.max(1, parseInt(v) || 1) })}
                          />
                        </Field>
                        <Field label="Макс. в заказе" info="Лимит билетов этого типа в одном заказе.">
                          <Input
                            type="number"
                            value={ticket.maxPerOrder}
                            onChange={v => updateTicket(ticket.id, { maxPerOrder: Math.max(1, parseInt(v) || 1) })}
                          />
                        </Field>
                      </div>

                      {/* Sales window */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Начало продаж" hint="Пусто = сразу">
                          <Input
                            type="datetime-local"
                            value={ticket.saleStartAt ?? ''}
                            onChange={v => updateTicket(ticket.id, { saleStartAt: v || null })}
                          />
                        </Field>
                        <Field label="Конец продаж">
                          <Input
                            type="datetime-local"
                            value={ticket.saleEndAt ?? ''}
                            onChange={v => updateTicket(ticket.id, { saleEndAt: v || null })}
                          />
                        </Field>
                      </div>

                      {/* Early Bird */}
                      <div className="pt-2">
                        <Toggle
                          checked={hasEarlyBird}
                          onChange={v => updateTicket(ticket.id, {
                            earlyBirdPrice: v ? Math.floor(ticket.price * 0.8) : null,
                            earlyBirdUntil: null,
                            earlyBirdCount: null,
                          })}
                          label="Early Bird скидка"
                          description="Пониженная цена для первых покупателей"
                        />

                        {hasEarlyBird && (
                          <div className="mt-3 grid grid-cols-3 gap-3">
                            <Field label="Цена Early Bird (₸)">
                              <Input
                                type="number"
                                value={ticket.earlyBirdPrice ?? ''}
                                onChange={v => updateTicket(ticket.id, { earlyBirdPrice: parseInt(v) || 0 })}
                              />
                            </Field>
                            <Field label="До какого числа">
                              <Input
                                type="datetime-local"
                                value={ticket.earlyBirdUntil ?? ''}
                                onChange={v => updateTicket(ticket.id, { earlyBirdUntil: v || null })}
                              />
                            </Field>
                            <Field label="Количество мест">
                              <Input
                                type="number"
                                value={ticket.earlyBirdCount ?? ''}
                                onChange={v => updateTicket(ticket.id, { earlyBirdCount: parseInt(v) || null })}
                                placeholder="Без лимита"
                              />
                            </Field>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add buttons */}
          <div>
            <p className="text-[11px] text-[var(--color-text-secondary)] mb-2">Быстрое добавление:</p>
            <div className="flex flex-wrap gap-2">
              {TICKET_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => addTicket(preset)}
                  className="
                    flex items-center gap-1.5 px-3 py-1.5 text-[12px]
                    border border-dashed border-[var(--color-border-secondary)]
                    rounded-[var(--border-radius-md)]
                    text-[var(--color-text-secondary)]
                    hover:border-[var(--color-border-primary)]
                    hover:text-[var(--color-text-primary)]
                    transition-colors
                  "
                >
                  <i className="ti ti-plus" style={{ fontSize: 12 }} aria-hidden="true" />
                  {preset.name}
                </button>
              ))}
              <button
                onClick={() => addTicket()}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 text-[12px]
                  border border-dashed border-[var(--color-border-secondary)]
                  rounded-[var(--border-radius-md)]
                  text-[var(--color-text-secondary)]
                  hover:border-[var(--color-border-primary)]
                  hover:text-[var(--color-text-primary)]
                  transition-colors
                "
              >
                <i className="ti ti-plus" style={{ fontSize: 12 }} aria-hidden="true" />
                Свой тип
              </button>
            </div>
          </div>

          {/* Summary */}
          {tickets.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border-tertiary)] flex gap-6">
              <div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">Всего мест</div>
                <div className="text-[16px] font-medium text-[var(--color-text-primary)]">
                  {totalCapacity.toLocaleString('ru-KZ')}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">Типов билетов</div>
                <div className="text-[16px] font-medium text-[var(--color-text-primary)]">
                  {tickets.length}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">Мин. цена</div>
                <div className="text-[16px] font-medium text-[var(--color-text-primary)]">
                  {isFreeEvent ? 'Бесплатно' : `₸ ${Math.min(...tickets.map(t => t.price)).toLocaleString('ru-KZ')}`}
                </div>
              </div>
            </div>
          )}
        </WizardSection>
      </WizardCard>

      {/* Refund policy */}
      <WizardCard>
        <WizardSection title="Политика возврата">
          <Field label="Условия возврата" hint="Покупатель увидит это перед оплатой" info="Политика возврата снижает споры и обращения в поддержку.">
            <Select
              value={data.refundPolicy}
              onChange={v => update({ refundPolicy: v as WizardData['refundPolicy'] })}
              options={REFUND_OPTIONS}
            />
          </Field>

          {data.refundPolicy === 'CUSTOM' && (
            <Field label="Крайний срок возврата">
              <Input
                type="datetime-local"
                value={data.refundDeadline}
                onChange={v => update({ refundDeadline: v })}
              />
            </Field>
          )}
        </WizardSection>
      </WizardCard>

      <WizardNav onPrev={onPrev} onNext={handleNext} nextDisabled={tickets.length === 0} />
    </div>
  )
}

// Fix missing import
type WizardData = import('@/app/dashboard/events/new/page').WizardData
