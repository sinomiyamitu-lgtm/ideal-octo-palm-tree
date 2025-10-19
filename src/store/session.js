import { create } from 'zustand'
import authConfig from '../config/auth.json'

// ログインTTL（分）。環境変数 `VITE_AUTH_TTL_MIN` があれば使用、なければ15分
const AUTH_TTL_MIN = Number(import.meta.env.VITE_AUTH_TTL_MIN || 15)
let logoutTimerId = null
let lockUntil = 0
let attempts = 0

const useSessionStore = create((set, get) => ({
  isAuthenticated: false,
  expiresAt: 0,
  username: '',
  role: 'viewer',
  // ログイン（ID+パスワード／永続化なし・失敗回数によるロックあり）
  login: async (username, password) => {
    const now = Date.now()
    if (lockUntil && now < lockUntil) return false
    // 簡易ディレイで総当たりを遅延
    await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random() * 400)))

    const configuredUser = (import.meta.env.VITE_EDIT_USER ?? authConfig?.editUser ?? '').toString()
    const configuredPass = (import.meta.env.VITE_EDIT_PASSWORD ?? authConfig?.editPassword ?? '').toString()
    const ok = username === configuredUser && password === configuredPass && configuredUser.length > 0
    if (!ok) {
      attempts += 1
      if (attempts >= 5) {
        lockUntil = Date.now() + 10 * 60 * 1000 // 10分ロック
        attempts = 0
      }
      return false
    }

    attempts = 0
    lockUntil = 0
    const expiresAt = Date.now() + AUTH_TTL_MIN * 60 * 1000
    set({ isAuthenticated: true, expiresAt, username, role: 'editor' })

    if (logoutTimerId) clearTimeout(logoutTimerId)
    logoutTimerId = setTimeout(() => {
      set({ isAuthenticated: false, expiresAt: 0, username: '', role: 'viewer' })
    }, AUTH_TTL_MIN * 60 * 1000)
    return true
  },
  // ログアウト（タイマーもクリア）
  logout: () => {
    if (logoutTimerId) { clearTimeout(logoutTimerId); logoutTimerId = null }
    set({ isAuthenticated: false, expiresAt: 0, username: '', role: 'viewer' })
  },
}))

export default useSessionStore