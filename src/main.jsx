import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

// Apply initial theme (light/dark) before render
(() => {
  const KEY = 'portfolio_theme'
  try {
    const saved = localStorage.getItem(KEY)
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = saved === 'light' || saved === 'dark' ? saved : (prefersDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', theme)
  } catch (_) {
    // fallback: prefer dark
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Dissolve load overlay after app boot
const hideLoader = () => {
  const el = document.getElementById('app-load')
  if (!el) return
  el.classList.add('hide')
  setTimeout(() => { try { el.remove() } catch(_) {} }, 320)
}
// run on next frame to ensure initial styles are loaded
requestAnimationFrame(() => setTimeout(hideLoader, 80))