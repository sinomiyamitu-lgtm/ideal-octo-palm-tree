import { create } from 'zustand'

const STORAGE_KEY = 'portfolio_projects'

// 末尾ドット正規化（全角・半角ドットを除去して半角.を付与）
const ensureTagDot = (s) => {
  const t = String(s || '').trim()
  if (!t) return ''
  return t.replace(/[。．.]+$/, '') + '.'
}

const sample = [
  {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: '作品タイトル 1',
    tags: ['UI', 'Motion'].map(ensureTagDot),
    descriptionShort: 'サブ説明文の例',
    descriptionFull: '詳細説明の例。映像や画像の説明など。',
    thumbnailUrl: '',
    mediaUrl: '',
    attachments: [],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())) + '-b',
    title: '作品タイトル 2',
    tags: ['Branding'].map(ensureTagDot),
    descriptionShort: '別のサブ説明',
    thumbnailUrl: '',
    mediaUrl: '',
    attachments: [],
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
    if (Array.isArray(data)) return data.map(p => ({ ...p, tags: (p.tags || []).map(ensureTagDot) }))
    return sample
  } catch (_) {
    return sample
  }
}

const useProjectsStore = create((set, get) => ({
  projects: [],
  selectedId: null,

  addProject: () => {
    const id = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    const next = {
      id,
      title: '新しい作品',
      tags: [],
      descriptionShort: '',
      descriptionFull: '',
      thumbnailUrl: '',
      mediaUrl: '',
      attachments: [],
      order: get().projects.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set(({ projects }) => ({ projects: [...projects, next], selectedId: id }))
  },

  select: (id) => set({ selectedId: id }),

  updateProject: (id, patch) => set(({ projects }) => {
    const normalizedPatch = 'tags' in (patch || {}) ? { ...patch, tags: (patch.tags || []).map(ensureTagDot) } : patch
    return ({
      projects: projects.map(p => p.id === id ? { ...p, ...normalizedPatch, updatedAt: new Date().toISOString() } : p)
    })
  }),

  removeSelected: () => set(({ projects, selectedId }) => {
    const filtered = projects.filter(p => p.id !== selectedId)
    return { projects: filtered, selectedId: filtered[0]?.id || null }
  }),

  removeProject: (id) => set(({ projects, selectedId }) => {
    const filtered = projects.filter(p => p.id !== id)
    const nextSelected = selectedId === id ? (filtered[0]?.id || null) : selectedId
    return { projects: filtered, selectedId: nextSelected }
  }),

  reorder: (idsInOrder) => set(({ projects }) => {
    const byId = Object.fromEntries(projects.map(p => [p.id, p]))
    const reordered = idsInOrder.map((id, idx) => ({ ...byId[id], order: idx }))
    return { projects: reordered }
  }),
}))

// 初期化: LocalStorageから読み込み（タグを正規化）
const initial = safeLoad()
useProjectsStore.setState({ projects: initial, selectedId: initial[0]?.id || null })

// 同期ロック（storageイベント適用中の二重保存を防ぐ）
let __syncLockProjects = false

// 永続化: projectsが変わるたび保存
useProjectsStore.subscribe((state) => {
  if (__syncLockProjects) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects))
  } catch (_) {}
})

// 他タブからの変更を自動取り込み
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      try {
        const data = JSON.parse(e.newValue || '[]')
        const normalized = Array.isArray(data) ? data.map(p => ({ ...p, tags: (p.tags || []).map(ensureTagDot) })) : []
        const current = useProjectsStore.getState().projects
        if (JSON.stringify(current) === JSON.stringify(normalized)) return
        __syncLockProjects = true
        useProjectsStore.setState({ projects: normalized })
      } catch (_) {
        // ignore
      } finally {
        __syncLockProjects = false
      }
    }
  })
}

export default useProjectsStore