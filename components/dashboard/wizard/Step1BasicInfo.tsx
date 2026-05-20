'use client'

/**
 * components/dashboard/wizard/Step1BasicInfo.tsx
 * Step 1: Основная информация
 */

import { useState } from 'react'
import type { StepProps } from './ui'
import type { EventCategory, EventMood } from './types'
import {
  WizardCard, WizardSection, Field,
  Input, Textarea, Select, ChipPicker, Toggle, WizardNav,
} from './ui'

const CATEGORIES = [
  { value: 'concert',    label: '🎵 Концерт' },
  { value: 'theatre',    label: '🎭 Театр' },
  { value: 'sport',      label: '⚽ Спорт' },
  { value: 'standup',    label: '🎤 Стендап' },
  { value: 'kids',       label: '🧸 Детское' },
  { value: 'exhibition', label: '🖼 Выставка' },
  { value: 'festival',   label: '🎪 Фестиваль' },
  { value: 'conference', label: '💼 Конференция' },
  { value: 'nightlife',  label: '🌙 Вечеринка' },
  { value: 'other',      label: '📌 Другое' },
]

const MOOD_OPTIONS = [
  { value: 'family',   label: 'Семейное' },
  { value: 'romantic', label: 'Романтика' },
  { value: 'party',    label: 'Вечеринка' },
  { value: 'culture',  label: 'Культура' },
  { value: 'sport',    label: 'Спорт' },
  { value: 'relax',    label: 'Отдых' },
  { value: 'kids',     label: 'Детям' },
  { value: 'premium',  label: 'Премиум' },
  { value: 'outdoor',  label: 'На улице' },
  { value: 'creative', label: 'Творчество' },
]

const AGE_OPTIONS = [
  { value: '',   label: 'Без ограничений' },
  { value: '0',  label: '0+' },
  { value: '6',  label: '6+' },
  { value: '12', label: '12+' },
  { value: '16', label: '16+' },
  { value: '18', label: '18+' },
]

export default function Step1BasicInfo({ data, update, onNext, onPrev }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!data.title.trim()) e.title = 'Введите название'
    if (data.title.length > 200) e.title = 'Максимум 200 символов'
    if (!data.category) e.category = 'Выберите категорию'
    if (!data.startAt) e.startAt = 'Укажите дату начала'
    if (data.endAt && data.endAt < data.startAt) e.endAt = 'Дата конца раньше начала'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
  onNext()
}

  return (
    <div className="space-y-4">
      <WizardCard>
        <WizardSection title="Основное" description="Название и категория — первое что видит покупатель">
          <Field label="Название события" required error={errors.title} info="Название видно в каталоге, поиске, билете и на странице события.">
            <Input
              value={data.title}
              onChange={v => update({ title: v })}
              placeholder="Dimash World Tour — Алматы"
            />
            <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1 text-right">
              {data.title.length}/200
            </div>
          </Field>

          <Field label="Категория" required error={errors.category} info="Категория влияет на фильтры, рекомендации и навигацию в каталоге.">
            <Select
              value={data.category}
              onChange={v => update({ category: v as EventCategory | '' })}
              options={CATEGORIES}
              placeholder="Выберите категорию"
            />
          </Field>

          <Field
            label="Краткое описание"
            hint="Отображается в карточке события (до 160 символов)"
            info="Короткий продающий текст в карточке. Лучше писать ясно: кто, что, почему стоит купить."
          >
            <Input
              value={data.shortDesc}
              onChange={v => update({ shortDesc: v.slice(0, 160) })}
              placeholder="Звезда мировой сцены возвращается в Казахстан"
            />
            <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1 text-right">
              {data.shortDesc.length}/160
            </div>
          </Field>

          <Field label="Полное описание" info="Подробная программа, состав участников, правила входа и важные условия для покупателя.">
            <Textarea
              value={data.description}
              onChange={v => update({ description: v })}
              placeholder="Расскажите о событии подробно — программа, артисты, особенности..."
              rows={5}
            />
          </Field>
        </WizardSection>
      </WizardCard>

      <WizardCard>
        <WizardSection title="Дата и время">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Начало" required error={errors.startAt} info="Основная дата события. От неё зависят карточка, напоминания и сортировка в афише.">
              <Input
                type="datetime-local"
                value={data.startAt}
                onChange={v => update({ startAt: v })}
              />
            </Field>
            <Field label="Конец" error={errors.endAt} info="Необязательно, но полезно для длинных событий, фестивалей и расписания.">
              <Input
                type="datetime-local"
                value={data.endAt}
                onChange={v => update({ endAt: v })}
              />
            </Field>
          </div>
          <Field label="Открытие дверей" hint="Когда начинается вход" info="Покажем покупателю, когда можно приходить на площадку.">
            <Input
              type="datetime-local"
              value={data.doorsOpenAt}
              onChange={v => update({ doorsOpenAt: v })}
            />
          </Field>
        </WizardSection>
      </WizardCard>

      <WizardCard>
        <WizardSection title="Аудитория">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Возрастное ограничение" info="Возрастной рейтинг будет показан в карточке и на странице события.">
              <Select
                value={data.ageRestriction?.toString() ?? ''}
                onChange={v => update({ ageRestriction: v ? parseInt(v) : null })}
                options={AGE_OPTIONS}
              />
            </Field>
            <Field label="Макс. билетов в одни руки" hint="На один заказ" info="Помогает ограничить массовую скупку и снизить риск спекуляции.">
              <Input
                type="number"
                value={data.maxTicketsPerOrder}
                onChange={v => update({ maxTicketsPerOrder: Math.max(1, Math.min(20, parseInt(v) || 1)) })}
              />
            </Field>
          </div>

          <Field label="Настроение события" hint="Помогает рекомендательной системе (до 4)" info="Метки эмоций помогают пользователю найти событие по настроению, а платформе — рекомендовать точнее.">
            <ChipPicker
              options={MOOD_OPTIONS}
              selected={data.mood}
              onChange={v => update({ mood: v as EventMood[] })}
              max={4}
            />
          </Field>
        </WizardSection>

        <div className="pt-4 border-t border-[var(--color-border-tertiary)]">
          <Toggle
            checked={data.isOnlineEvent}
            onChange={v => update({ isOnlineEvent: v })}
            label="Онлайн-событие"
            description="Покупатель получит ссылку вместо QR-кода"
            info="Включите, если у события нет физической площадки и покупатель должен получить ссылку на трансляцию."
          />
          {data.isOnlineEvent && (
            <div className="mt-3">
              <Field label="Ссылка на трансляцию">
                <Input
                  value={data.onlineUrl}
                  onChange={v => update({ onlineUrl: v })}
                  placeholder="https://youtube.com/live/..."
                />
              </Field>
            </div>
          )}
        </div>
      </WizardCard>

      <WizardNav
        onPrev={onPrev}
        onNext={handleNext}
        isFirst
      />
    </div>
  )
}
