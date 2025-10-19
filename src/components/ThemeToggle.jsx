import React, { useEffect, useState } from 'react'

const THEME_KEY = 'portfolio_theme'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch (_) {}
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme())

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme) } catch (_) {}
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    // Try View Transitions API if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(next)
      })
      return
    }
    // Fallback: simple CSS transition class
    root.classList.add('theme-transition')
    setTheme(next)
    setTimeout(() => { try { root.classList.remove('theme-transition') } catch(_) {} }, 300)
  }

  return (
    <button className="button" aria-label="テーマ切替" title="テーマ切替" onClick={toggle}>
      {theme === 'dark' ? '☀️ ライト' : '🌙 ダーク'}
    </button>
  )
}