'use client'

import type React from 'react'
import type { WizardData } from './types'

export interface StepProps {
  data: WizardData
  update: (patch: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

const S = {
  section: {
    background: 'var(--dash-card-bg)',
    border: '1px solid var(--color-border-tertiary)',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
  } as React.CSSProperties,

  sectionHead: {
    padding: '22px 24px 0',
  } as React.CSSProperties,

  sectionBody: {
    padding: '0 24px 24px',
  } as React.CSSProperties,

  sTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: 4,
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  sDesc: {
    fontSize: 13,
    color: 'var(--color-text-tertiary)',
    marginBottom: 18,
    lineHeight: 1.5,
  } as React.CSSProperties,

  label: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 7,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  } as React.CSSProperties,

  req: {
    color: '#F97316',
    fontSize: 12,
    lineHeight: 1,
  } as React.CSSProperties,

  input: {
    width: '100%',
    height: 46,
    padding: '0 15px',
    fontSize: 14,
    fontFamily: 'var(--font-sans)',
    border: '1px solid var(--color-border-tertiary)',
    borderRadius: 14,
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text-primary)',
    transition: 'border 0.15s, box-shadow 0.15s, background 0.15s',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  inputFilled: {
    borderColor: 'var(--color-border-primary)',
    background: 'var(--color-background-secondary)',
  } as React.CSSProperties,

  inputError: {
    borderColor: 'rgba(239,68,68,0.45)',
    boxShadow: '0 0 0 3px rgba(239,68,68,0.12)',
  } as React.CSSProperties,

  textarea: {
    width: '100%',
    padding: '13px 15px',
    fontSize: 14,
    fontFamily: 'var(--font-sans)',
    border: '1px solid var(--color-border-tertiary)',
    borderRadius: 14,
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text-primary)',
    resize: 'vertical' as const,
    minHeight: 120,
    transition: 'border 0.15s, box-shadow 0.15s, background 0.15s',
    lineHeight: 1.5,
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  select: {
    width: '100%',
    height: 46,
    padding: '0 15px',
    fontSize: 14,
    fontFamily: 'var(--font-sans)',
    border: '1px solid var(--color-border-tertiary)',
    borderRadius: 14,
    background: 'var(--color-background-tertiary)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border 0.15s, background 0.15s',
  } as React.CSSProperties,

  hint: {
    fontSize: 12,
    color: 'var(--color-text-tertiary)',
    marginTop: 6,
    lineHeight: 1.4,
  } as React.CSSProperties,

  errText: {
    fontSize: 12,
    color: '#F87171',
    marginTop: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    lineHeight: 1.4,
  } as React.CSSProperties,

  char: {
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    textAlign: 'right' as const,
    marginTop: 5,
  } as React.CSSProperties,

  charWarn: {
    color: '#F97316',
  } as React.CSSProperties,

  field: {
    marginBottom: 18,
  } as React.CSSProperties,

  badge: {
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 6,
    background: 'rgba(249,115,22,0.10)',
    color: '#FB923C',
    border: '1px solid rgba(249,115,22,0.22)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    marginLeft: 6,
  } as React.CSSProperties,

  badgeSeo: {
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 6,
    background: 'rgba(16,185,129,0.10)',
    color: '#34D399',
    border: '1px solid rgba(16,185,129,0.22)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    marginLeft: 6,
  } as React.CSSProperties,

  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  } as React.CSSProperties,

  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 12,
  } as React.CSSProperties,

  divider: {
    border: 'none',
    borderTop: '1px solid var(--color-border-tertiary)',
    margin: '18px 0',
  } as React.CSSProperties,

  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderTop: '1px solid var(--color-border-tertiary)',
  } as React.CSSProperties,

  tglLbl: {
    fontSize: 14,
    color: 'var(--color-text-primary)',
    lineHeight: 1.3,
    fontWeight: 600,
  } as React.CSSProperties,

  tglDesc: {
    fontSize: 12,
    color: 'var(--color-text-tertiary)',
    marginTop: 3,
    lineHeight: 1.4,
  } as React.CSSProperties,

  tagsInput: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    minHeight: 42,
    padding: '6px 10px',
    border: '1px solid var(--color-border-tertiary)',
    borderRadius: 14,
    gap: 6,
    cursor: 'text',
    background: 'var(--color-background-secondary)',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  inlineTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 9px',
    background: 'rgba(249,115,22,0.10)',
    border: '1px solid rgba(249,115,22,0.22)',
    borderRadius: 999,
    fontSize: 12,
    color: '#FB923C',
  } as React.CSSProperties,
}

export { S }

export function InfoTip({ text }: { text: string }) {
  return (
    <span
      title={text}
      aria-label={text}
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--color-border-secondary)',
        color: 'var(--color-text-tertiary)',
        fontSize: 10,
        fontWeight: 700,
        cursor: 'help',
        flexShrink: 0,
      }}
    >
      ?
    </span>
  )
}

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
        {badge && <span style={badgeType === 'seo' ? S.badgeSeo : S.badge}>{badge}</span>}
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
  const borderStyle = hasError ? S.inputError : filled ? S.inputFilled : {}

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
        ...(disabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}),
        ...style,
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.45)'
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.10)'
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = filled ? 'var(--color-border-primary)' : 'var(--color-border-tertiary)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

export function CharCount({ current, max }: { current: number; max: number }) {
  const warn = current > max * 0.85
  return <div style={{ ...S.char, ...(warn ? S.charWarn : {}) }}>{current} / {max}</div>
}

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
      onFocus={e => {
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.45)'
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.10)'
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

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
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={S.select}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.45)'
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

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
        <div style={{ ...S.tglLbl, display: 'flex', alignItems: 'center', gap: 6 }}>
          {label}{info && <InfoTip text={info} />}
        </div>
        {description && <div style={S.tglDesc}>{description}</div>}
      </div>

      <div
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          background: checked ? '#F97316' : 'var(--color-border-secondary)',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.15s',
          border: '1px solid var(--color-border-tertiary)',
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
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            top: 1,
            left: 1,
            transition: 'transform 0.15s',
            transform: checked ? 'translateX(16px)' : 'translateX(0)',
          }}
        />
      </div>
    </label>
  )
}

export function ChipPicker({
  options,
  selected,
  onChange,
  max,
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (v: string[]) => void
  max?: number
}) {
  const toggle = (v: string) => {
    if (selected.includes(v)) {
      onChange(selected.filter(s => s !== v))
    } else if (!max || selected.length < max) {
      onChange([...selected, v])
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const on = selected.includes(o.value)
        const maxed = !on && !!max && selected.length >= max

        return (
          <button
            key={o.value}
            type="button"
            onClick={() => !maxed && toggle(o.value)}
            style={{
              padding: '7px 13px',
              border: `1px solid ${on ? 'rgba(249,115,22,0.35)' : 'var(--color-border-tertiary)'}`,
              borderRadius: 999,
              fontSize: 12,
              color: on ? '#FB923C' : 'var(--color-text-tertiary)',
              background: on ? 'rgba(249,115,22,0.10)' : 'var(--color-background-secondary)',
              fontWeight: on ? 600 : 400,
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
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              color: '#FB923C',
            }}
            aria-label={`Удалить тег ${t}`}
          >
            ×
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
          height: 28,
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

export function WizardNav(_props: {
  onPrev: () => void
  onNext: () => void
  isFirst?: boolean
  nextLabel?: string
  nextDisabled?: boolean
  loading?: boolean
}) {
  return null
}

export function Divider() {
  return <hr style={S.divider} />
}

export function Grid2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ ...S.grid2, ...style }}>{children}</div>
}

export function Grid3({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ ...S.grid3, ...style }}>{children}</div>
}

export function WizardCard({ children }: { children: React.ReactNode }) {
  return <div style={S.section}>{children}</div>
}

export function WizardSection({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: React.ReactNode
}) {
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