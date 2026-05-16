'use client'

// ─── Wizard UI primitives — inline styles, точно по прототипу ───
// Используем CSS переменные напрямую, без Tailwind

import type React from 'react'
import type { WizardData } from './types'

export interface StepProps {
  data: WizardData
  update: (patch: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

// ── Общие стили (зеркало прототипа) ──────────────────────────

const S = {
  section: {
    background: 'var(--color-background-primary)',
    border: '1px solid #6B7280',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  } as React.CSSProperties,

  sectionHead: {
    padding: '16px 20px 0',
  } as React.CSSProperties,

  sectionBody: {
    padding: '0 20px 20px',
  } as React.CSSProperties,

  sTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    marginBottom: 2,
    lineHeight: 1.3,
  } as React.CSSProperties,

  sDesc: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    marginBottom: 14,
    lineHeight: 1.4,
  } as React.CSSProperties,

  label: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  } as React.CSSProperties,

  req: {
    color: '#E24B4A',
    fontSize: 11,
    lineHeight: 1,
  } as React.CSSProperties,

  input: {
  width: '100%',
  height: 42,
  padding: '0 14px',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  border: '1.5px solid var(--color-border-secondary)',
  borderRadius: 12,
  background: 'var(--color-background-primary)',
  color: 'var(--color-text-primary)',
  transition: 'border 0.15s, box-shadow 0.15s',
  outline: 'none',
  boxSizing: 'border-box' as const,
} as React.CSSProperties,

inputFilled: {
  borderColor: 'var(--color-border-primary)',
} as React.CSSProperties,

inputError: {
  borderColor: 'var(--color-danger)',
  boxShadow: '0 0 0 3px rgba(226,75,74,0.12)',
} as React.CSSProperties,

  textarea: {
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  border: '1.5px solid var(--color-border-secondary)',
  borderRadius: 12,
  background: 'var(--color-background-primary)',
  color: 'var(--color-text-primary)',
  resize: 'vertical' as const,
  minHeight: 96,
  transition: 'border 0.15s, box-shadow 0.15s',
  lineHeight: 1.5,
  outline: 'none',
  boxSizing: 'border-box' as const,
} as React.CSSProperties,

  select: {
  width: '100%',
  height: 42,
  padding: '0 14px',
  fontSize: 13,
  fontFamily: 'var(--font-sans)',
  border: '1.5px solid var(--color-border-secondary)',
  borderRadius: 12,
  background: 'var(--color-background-primary)',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border 0.15s',
} as React.CSSProperties,

  hint: {
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    marginTop: 4,
    lineHeight: 1.4,
  } as React.CSSProperties,

  errText: {
    fontSize: 11,
    color: '#E24B4A',
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    lineHeight: 1.4,
  } as React.CSSProperties,

  char: {
    fontSize: 10,
    color: 'var(--color-text-tertiary)',
    textAlign: 'right' as const,
    marginTop: 3,
  } as React.CSSProperties,

  charWarn: {
    color: '#BA7517',
  } as React.CSSProperties,

  field: {
    marginBottom: 16,
  } as React.CSSProperties,

  badge: {
    fontSize: 9,
    fontWeight: 500,
    padding: '2px 5px',
    borderRadius: 4,
    background: '#EEEDFE',
    color: '#534AB7',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    marginLeft: 6,
    verticalAlign: 'middle',
  } as React.CSSProperties,

  badgeSeo: {
    fontSize: 9,
    fontWeight: 500,
    padding: '2px 5px',
    borderRadius: 4,
    background: '#E1F5EE',
    color: '#0F6E56',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    marginLeft: 6,
    verticalAlign: 'middle',
  } as React.CSSProperties,

  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  } as React.CSSProperties,

  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 10,
  } as React.CSSProperties,

  divider: {
    border: 'none',
    borderTop: '0.5px solid var(--color-border-tertiary)',
    margin: '16px 0',
  } as React.CSSProperties,

  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderTop: '0.5px solid var(--color-border-tertiary)',
  } as React.CSSProperties,

  tglLbl: {
    fontSize: 13,
    color: 'var(--color-text-primary)',
    lineHeight: 1.3,
  } as React.CSSProperties,

  tglDesc: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    marginTop: 2,
    lineHeight: 1.4,
  } as React.CSSProperties,

  btnBack: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 16px',
    fontSize: 13,
    border: '1px solid var(--color-border-secondary)',
    borderRadius: 8,
    color: 'var(--color-text-secondary)',
    background: 'transparent',
    cursor: 'pointer',
    opacity: 0.35,
  } as React.CSSProperties,

  btnNext: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 22px',
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 8,
    background: 'var(--color-text-primary)',
    color: 'var(--color-background-primary)',
    border: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,

  tagsInput: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    minHeight: 38,
    padding: '4px 8px',
    border: '1.5px solid #6B7280',
    borderRadius: 8,
    gap: 4,
    cursor: 'text',
    background: 'var(--color-background-primary)',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  inlineTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 8px 3px 10px',
    background: 'var(--color-background-secondary)',
    border: '0.5px solid var(--color-border-secondary)',
    borderRadius: 20,
    fontSize: 12,
    color: 'var(--color-text-primary)',
  } as React.CSSProperties,
}

export { S }

export function InfoTip({ text }: { text: string }) {
  return (
    <span
      title={text}
      aria-label={text}
      style={{
        width: 15,
        height: 15,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--color-border-secondary)',
        color: 'var(--color-text-tertiary)',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'none',
        letterSpacing: 0,
        cursor: 'help',
        flexShrink: 0,
      }}
    >
      ?
    </span>
  )
}

// ── Section ───────────────────────────────────────────────────

export function Section({
  title,
  description,
  children,
  titleSuffix,
}: {
  title?: string
  description?: string
  children: React.ReactNode
  titleSuffix?: React.ReactNode
}) {
  return (
    <div style={S.section}>
      {(title || description) && (
        <div style={S.sectionHead}>
          {title && (
            <div style={S.sTitle}>
              {title}
              {titleSuffix}
            </div>
          )}
          {description && <div style={S.sDesc}>{description}</div>}
        </div>
      )}
      <div style={S.sectionBody}>{children}</div>
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────

export function Field({
  label,
  hint,
  error,
  required,
  badge,
  info,
  badgeType = 'new',
  children,
  style,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  badge?: string
  badgeType?: 'new' | 'seo'
  info?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={{ ...S.field, ...style }}>
      <div style={S.label}>
        {label}
        {required && <span style={S.req}>*</span>}
        {badge && (
          <span style={badgeType === 'seo' ? S.badgeSeo : S.badge}>{badge}</span>
        )}
        {info && <InfoTip text={info} />}
      </div>
      {children}
      {hint && !error && <div style={S.hint}>{hint}</div>}
      {error && (
        <div style={S.errText}>
          <i className="ti ti-alert-circle" style={{ fontSize: 12 }} aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
  hasError,
  maxLength,
  onKeyDown,
  style,
}: {
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  hasError?: boolean
  maxLength?: number
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  style?: React.CSSProperties
}) {
  const filled = String(value).length > 0
  const borderStyle = hasError
    ? S.inputError
    : filled
    ? S.inputFilled
    : {}

  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      onKeyDown={onKeyDown}
      style={{
        ...S.input,
        ...borderStyle,
        ...style,
      }}
    />
  )
}

// ── CharCount ─────────────────────────────────────────────────

export function CharCount({ current, max }: { current: number; max: number }) {
  const warn = current > max * 0.85
  return (
    <div style={{ ...S.char, ...(warn ? S.charWarn : {}) }}>
      {current} / {max}
    </div>
  )
}

// ── Textarea ──────────────────────────────────────────────────

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={S.textarea}
    />
  )
}

// ── Select ────────────────────────────────────────────────────

export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={S.select}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ── Toggle ────────────────────────────────────────────────────

export function Toggle({
  checked,
  onChange,
  label,
  description,
  noBorderTop,
  info,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  noBorderTop?: boolean
  info?: string
}) {
  return (
    <label
      style={{
        ...S.toggleRow,
        ...(noBorderTop ? { borderTop: 'none', paddingTop: 0 } : {}),
        cursor: 'pointer',
      }}
    >
      <div>
        <div style={{ ...S.tglLbl, display: 'flex', alignItems: 'center', gap: 6 }}>{label}{info && <InfoTip text={info} />}</div>
        {description && <div style={S.tglDesc}>{description}</div>}
      </div>
      <div
        style={{
          width: 34,
          height: 20,
          borderRadius: 10,
          background: checked ? '#1D9E75' : 'var(--color-border-secondary)',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.15s',
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#fff',
            top: 2,
            left: 2,
            transition: 'transform 0.15s',
            transform: checked ? 'translateX(14px)' : 'translateX(0)',
          }}
        />
      </div>
    </label>
  )
}

// ── ChipPicker (mood) ─────────────────────────────────────────

export function ChipPicker({
  options,
  selected,
  onChange,
  max,
  activeColor = '#185FA5',
  activeBg = '#E6F1FB',
  activeTextColor = '#0C447C',
  activeBorderColor = '#185FA5',
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (v: string[]) => void
  max?: number
  activeColor?: string
  activeBg?: string
  activeTextColor?: string
  activeBorderColor?: string
}) {
  const toggle = (v: string) => {
    if (selected.includes(v)) {
      onChange(selected.filter(s => s !== v))
    } else if (!max || selected.length < max) {
      onChange([...selected, v])
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => {
        const on = selected.includes(o.value)
        const maxed = !on && !!max && selected.length >= max
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => !maxed && toggle(o.value)}
            style={{
              padding: '6px 13px',
              border: `1px solid ${on ? activeBorderColor : 'var(--color-border-tertiary)'}`,
              borderRadius: 20,
              fontSize: 12,
              color: on ? activeTextColor : 'var(--color-text-secondary)',
              background: on ? activeBg : 'transparent',
              fontWeight: on ? 500 : 400,
              cursor: maxed ? 'not-allowed' : 'pointer',
              opacity: maxed ? 0.4 : 1,
              lineHeight: 1.4,
              transition: 'all 0.12s',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ── TagInput ──────────────────────────────────────────────────

export function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const remove = (t: string) => onChange(tags.filter(x => x !== t))
  const add = (raw: string) => {
    const t = raw.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 10) onChange([...tags, t])
  }

  return (
    <div style={S.tagsInput}>
      {tags.map(t => (
        <span key={t} style={S.inlineTag}>
          {t}
          <button
            onClick={() => remove(t)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            aria-label={`Удалить тег ${t}`}
          >
            <i className="ti ti-x" style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        style={{
          border: 'none',
          outline: 'none',
          fontSize: 13,
          color: 'var(--color-text-primary)',
          background: 'transparent',
          minWidth: 80,
          height: 26,
          fontFamily: 'var(--font-sans)',
        }}
        placeholder={tags.length === 0 ? placeholder : ''}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
            e.preventDefault()
            add(e.currentTarget.value)
            e.currentTarget.value = ''
          }
          if (e.key === 'Backspace' && !e.currentTarget.value && tags.length) {
            remove(tags[tags.length - 1])
          }
        }}
      />
    </div>
  )
}

// ── WizardNav ─────────────────────────────────────────────────

export function WizardNav(_props: {
  onPrev: () => void
  onNext: () => void
  isFirst?: boolean
  nextLabel?: string
  nextDisabled?: boolean
  loading?: boolean
}) {
  // Навигация теперь живёт в едином нижнем action bar страницы.
  // Оставляем компонент для совместимости шагов, но не рендерим дублирующие кнопки.
  return null
}

// ── Divider ───────────────────────────────────────────────────

export function Divider() {
  return <hr style={S.divider} />
}

// ── Grid helpers ──────────────────────────────────────────────

export function Grid2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ ...S.grid2, ...style }}>{children}</div>
}

export function Grid3({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ ...S.grid3, ...style }}>{children}</div>
}


// Backward-compatible names used by wizard steps
export function WizardCard({ children }: { children: React.ReactNode }) {
  return <div style={{ ...S.section, boxShadow: '0 1px 0 rgba(0,0,0,0.02)' }}>{children}</div>
}

export function WizardSection({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <>
      {(title || description) && (
        <div style={S.sectionHead}>
          {title && <div style={S.sTitle}>{title}</div>}
          {description && <div style={S.sDesc}>{description}</div>}
        </div>
      )}
      <div style={S.sectionBody}>{children}</div>
    </>
  )
}
