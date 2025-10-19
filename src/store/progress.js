import { create } from 'zustand'

const STORAGE_KEY = 'portfolio_progress'

// 末尾ドット正規化（全角・半角ドットを除去して半角.を付与）
const ensureTagDot = (s) => {
  const t = String(s || '').trim()
  if (!t) return ''
  return t.replace(/[。．.]+$/, '') + '.'
}

const sample = [
  {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: '進捗項目 1',
    tags: ['モデリング'].map(ensureTagDot),
    descriptionShort: '進捗の簡単な説明',
    descriptionFull: '',
    imageFinalUrl: '',
    imageCurrentUrl: '',
    todos: [],
    percent: 30,
    status: 'in_progress', // 'todo' | 'in_progress' | 'done'
    priority: 'medium', // 'low' | 'medium' | 'high'
    dueDate: null, // ISO string or null
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())) + '-b',
    title: '進捗項目 2',
    tags: ['スクリプト'].map(ensureTagDot),
    descriptionShort: '別の進捗項目',
    descriptionFull: '',
    imageFinalUrl: '',
    imageCurrentUrl: '',
    todos: [],
    percent: 70,
    status: 'in_progress',
    priority: 'high',
    dueDate: null,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const safeLoad = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return sample
    const data = JSON.parse(raw)
    if (Array.isArray(data)) return data.map(p => ({ ...{ descriptionFull: '', imageFinalUrl: '', imageCurrentUrl: '', todos: [] }, ...p, tags: (p.tags || []).map(ensureTagDot) }))
    return sample
  } catch (_) {
    return sample
  }
}

const useProgressStore = create((set, get) => ({
  items: [],
  selectedId: null,

  addItem: () => {
    const id = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    const next = {
      id,
      title: '新しい進捗',
      tags: [],
      descriptionShort: '',
      descriptionFull: '',
      imageFinalUrl: '',
      imageCurrentUrl: '',
      todos: [],
      percent: 0,
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      order: get().items.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set(({ items }) => ({ items: [...items, next], selectedId: id }))
  },

  select: (id) => set({ selectedId: id }),

  updateItem: (id, patch) => set(({ items }) => {
    const normalizedPatch = 'tags' in (patch || {}) ? { ...patch, tags: (patch.tags || []).map(ensureTagDot) } : patch
    return ({
      items: items.map(p => p.id === id ? { ...p, ...normalizedPatch, updatedAt: new Date().toISOString() } : p)
    })
  }),

  removeSelected: () => set(({ items, selectedId }) => {
    const filtered = items.filter(p => p.id !== selectedId)
    return { items: filtered, selectedId: filtered[0]?.id || null }
  }),

  removeItem: (id) => set(({ items, selectedId }) => {
    const filtered = items.filter(p => p.id !== id)
    const nextSelected = selectedId === id ? (filtered[0]?.id || null) : selectedId
    return { items: filtered, selectedId: nextSelected }
  }),

  reorder: (idsInOrder) => set(({ items }) => {
    const byId = Object.fromEntries(items.map(p => [p.id, p]))
    const reordered = idsInOrder.map((id, idx) => ({ ...byId[id], order: idx }))
    return { items: reordered }
  }),
  // インポート機能: JSONから進捗を取り込み（append/replace）
  importItems: (payload, mode = 'append') => set(({ items: curr }) => {
    const readArray = (() => {
      if (Array.isArray(payload)) return payload
      if (payload && Array.isArray(payload.items)) return payload.items
      if (payload && Array.isArray(payload.progress)) return payload.progress
      return []
    })()
    const normalized = readArray.map(p => ({
      ...{ descriptionFull: '', imageFinalUrl: '', imageCurrentUrl: '', todos: [], percent: 0, status: 'todo', priority: 'medium', dueDate: null },
      ...p,
      id: String(p?.id || (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))),
      tags: (p?.tags || []).map(ensureTagDot),
    }))

    let next = []
    if (mode === 'replace') {
      next = normalized.map((p, idx) => ({ ...p, order: idx, createdAt: p.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }))
    } else {
      const byId = Object.fromEntries(curr.map(p => [p.id, p]))
      for (const p of normalized) {
        if (byId[p.id]) {
          byId[p.id] = { ...byId[p.id], ...p, updatedAt: new Date().toISOString() }
        } else {
          byId[p.id] = { ...p, order: Object.keys(byId).length, createdAt: p.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }
        }
      }
      next = Object.values(byId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((p, idx) => ({ ...p, order: idx }))
    }
    return { items: next, selectedId: next[0]?.id || null }
  }),
  // エクスポート機能: 現在の進捗をJSONペイロードで返す
  exportItems: () => {
    const { items } = get()
    const payload = {
      type: 'progress',
      version: 1,
      exportedAt: new Date().toISOString(),
      items: (items || []).map(p => ({
        ...p,
        tags: (p.tags || []).map(ensureTagDot),
      })),
    }
    return payload
  },
}))

// 初期化: LocalStorageから読み込み（タグを正規化）
const initial = safeLoad()
useProgressStore.setState({ items: initial, selectedId: initial[0]?.id || null })

// 同期ロック
let __syncLockProgress = false

// 永続化: itemsが変わるたび保存
useProgressStore.subscribe((state) => {
  if (__syncLockProgress) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  } catch (_) {}
})

// 他タブからの変更を自動取り込み
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      try {
        const data = JSON.parse(e.newValue || '[]')
        const normalized = Array.isArray(data)
          ? data.map(p => ({
              ...{ descriptionFull: '', imageFinalUrl: '', imageCurrentUrl: '', todos: [] },
              ...p,
              tags: (p.tags || []).map(ensureTagDot),
            }))
          : []
        const current = useProgressStore.getState().items
        if (JSON.stringify(current) === JSON.stringify(normalized)) return
        __syncLockProgress = true
        useProgressStore.setState({ items: normalized })
      } catch (_) {
        // ignore
      } finally {
        __syncLockProgress = false
      }
    }
  })
}

export default useProgressStore