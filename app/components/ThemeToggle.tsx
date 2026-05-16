'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted ? (theme === 'dark' || resolvedTheme === 'dark') : true

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Переключить тему"
      style={{
        height: 32,
        padding: '0 12px',
        borderRadius: 10,
        border: '1px solid var(--color-border-secondary)',
        background: 'var(--color-background-secondary)',
        color: 'var(--color-text-primary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        fontSize: 12,
      }}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
      {isDark ? 'Светлая' : 'Тёмная'}
    </button>
  )
}
