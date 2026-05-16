'use client'

/**
 * components/dashboard/wizard/Step2Media.tsx
 * Step 2: Афиша и медиа
 * Вариант Б: URL-инпуты + автообложки по категории если не загружено
 */

import { useState } from 'react'
import type { StepProps } from './ui'
import { WizardCard, WizardSection, Field, Input, WizardNav } from './ui'

// Auto-covers per category (Unsplash, free to use)
const CATEGORY_COVERS: Record<string, string[]> = {
  concert:    [
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
  ],
  theatre:    [
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
    'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80',
  ],
  sport:      [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
  ],
  standup:    [
    'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=80',
  ],
  kids:       [
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=80',
  ],
  exhibition: [
    'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
  ],
  festival:   [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
  ],
  conference: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  ],
  nightlife:  [
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80',
  ],
  other:      [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
  ],
}

function getAutoCovers(category: string): string[] {
  return CATEGORY_COVERS[category] ?? CATEGORY_COVERS.other
}

export default function Step2Media({ data, update, onNext, onPrev }: StepProps) {
  const [galleryInput, setGalleryInput] = useState('')
  const autoCover = getAutoCovers(data.category)[0]
  const posterPreview = data.posterUrl || autoCover

  const addGallery = () => {
    const url = galleryInput.trim()
    if (url && !data.galleryUrls.includes(url)) {
      update({ galleryUrls: [...data.galleryUrls, url] })
      setGalleryInput('')
    }
  }

  const removeGallery = (url: string) => {
    update({ galleryUrls: data.galleryUrls.filter(u => u !== url) })
  }

  const pickAutoCover = (url: string) => {
    update({ posterUrl: url })
  }

  return (
    <div className="space-y-4">
      {/* Poster */}
      <WizardCard>
        <WizardSection
          title="Афиша события"
          description="Главное изображение — отображается в каталоге и на странице события"
        >
          {/* Preview */}
          <div className="relative mb-4 rounded-[var(--border-radius-lg)] overflow-hidden bg-[var(--color-background-secondary)] aspect-video">
            {posterPreview ? (
              <>
                <img
                  src={posterPreview}
                  alt="Предпросмотр афиши"
                  className="w-full h-full object-cover"
                />
                {!data.posterUrl && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded text-[10px] font-medium"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                    Автообложка по категории
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <i className="ti ti-photo" style={{ fontSize: 32, color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                  <p className="text-[12px] text-[var(--color-text-tertiary)] mt-2">Нет изображения</p>
                </div>
              </div>
            )}
          </div>

          <Field label="URL афиши" hint="Вставьте прямую ссылку на изображение (JPG, PNG, WebP)" info="Афиша отображается в карточке события, каталоге и предпросмотре покупки.">
            <div className="flex gap-2">
              <Input
                value={data.posterUrl}
                onChange={v => update({ posterUrl: v })}
                placeholder="https://example.com/poster.jpg"
              />
              {data.posterUrl && (
                <button
                  onClick={() => update({ posterUrl: '' })}
                  className="px-3 py-2 text-[12px] border border-[var(--color-border-secondary)] rounded-[var(--border-radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] transition-colors flex-shrink-0"
                >
                  <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true" />
                </button>
              )}
            </div>
          </Field>

          {/* Auto-covers */}
          {data.category && (
            <div>
              <p className="text-[11px] text-[var(--color-text-secondary)] mb-2">
                Или выберите автообложку по категории:
              </p>
              <div className="flex gap-2 flex-wrap">
                {getAutoCovers(data.category).map((url, i) => (
                  <button
                    key={url}
                    onClick={() => pickAutoCover(url)}
                    className={`
                      relative w-20 h-14 rounded-[var(--border-radius-md)] overflow-hidden
                      border-2 transition-colors
                      ${data.posterUrl === url
                        ? 'border-[var(--color-text-primary)]'
                        : 'border-transparent hover:border-[var(--color-border-secondary)]'
                      }
                    `}
                  >
                    <img src={url} alt={`Обложка ${i + 1}`} className="w-full h-full object-cover" />
                    {data.posterUrl === url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <i className="ti ti-check" style={{ fontSize: 16, color: '#fff' }} aria-hidden="true" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </WizardSection>
      </WizardCard>

      {/* Banner */}
      <WizardCard>
        <WizardSection
          title="Баннер"
          description="Широкое изображение для шапки страницы события (необязательно)"
        >
          {data.bannerUrl && (
            <div className="mb-3 rounded-[var(--border-radius-md)] overflow-hidden h-24">
              <img src={data.bannerUrl} alt="Баннер" className="w-full h-full object-cover" />
            </div>
          )}
          <Field label="URL баннера" info="Баннер можно использовать для широких промо-блоков, главной страницы и спецподборок.">
            <Input
              value={data.bannerUrl}
              onChange={v => update({ bannerUrl: v })}
              placeholder="https://example.com/banner.jpg"
            />
          </Field>
        </WizardSection>
      </WizardCard>

      {/* Gallery */}
      <WizardCard>
        <WizardSection
          title="Галерея"
          description="Дополнительные фото — до 10 изображений (необязательно)"
        >
          <Field label="Добавить фото в галерею" info="Галерея помогает показать атмосферу события, площадку или прошлые мероприятия.">
            <div className="flex gap-2">
              <Input
                value={galleryInput}
                onChange={setGalleryInput}
                placeholder="https://example.com/photo.jpg"
              />
              <button
                onClick={addGallery}
                disabled={!galleryInput.trim() || data.galleryUrls.length >= 10}
                className="
                  px-4 py-2 text-[12px] font-medium
                  bg-[var(--color-background-secondary)]
                  border border-[var(--color-border-secondary)]
                  rounded-[var(--border-radius-md)]
                  text-[var(--color-text-primary)]
                  hover:bg-[var(--color-background-tertiary)]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors flex-shrink-0
                "
              >
                Добавить
              </button>
            </div>
          </Field>

          {data.galleryUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.galleryUrls.map((url) => (
                <div key={url} className="relative group w-20 h-14 rounded-[var(--border-radius-md)] overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeGallery(url)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="Удалить фото"
                  >
                    <i className="ti ti-trash" style={{ fontSize: 16, color: '#fff' }} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">
            {data.galleryUrls.length}/10 фото
          </p>
        </WizardSection>
      </WizardCard>

      <WizardNav onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
