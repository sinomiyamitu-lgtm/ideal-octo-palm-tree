import { create } from 'zustand'

const STORAGE_KEY = 'official_site_content'

const sample = {
  customCSS: '',
  customHTML: '',
  customJS: '',
  top: {
    routeMapEmbedUrl: '',
    operations: [
      { id: 'op1', status: '平常運行', message: '現在、全線で平常運行です。', updatedAt: new Date().toISOString() }
    ],
    news: [
      { id: 'n1', title: '新型車両デビュー', body: '今春より新型車両を導入します。', date: new Date().toISOString(), category: '車両', link: '' }
    ],
  },
  routes: [
    {
      id: 'line1', name: '本線', color: '#2a7cff', mapEmbedUrl: '',
      stations: [ { id: 's1', name: '中央駅', code: 'C01' }, { id: 's2', name: '東駅', code: 'E03' } ],
      rollingStock: [ { id: 'rs1', name: '1000系', photoUrl: '', formation: '4両編成' } ]
    }
  ],
  operationInfo: {
    schedule: [ { id: 'sc1', title: '本日のダイヤ', note: '通常ダイヤ', timeRange: '05:00 - 24:00' } ],
    officialX: { handle: 'official_x', embedUrl: '' }
  },
  tourism: {
    spots: [ { id: 't1', title: '中央公園', description: '駅近の大きな公園', photoUrl: '', nearStation: '中央駅' } ],
    events: [ { id: 'e1', title: '沿線フェス', date: new Date().toISOString(), info: '週末開催' } ],
    gallery: [ { id: 'g1', photoUrl: '', caption: '春の沿線' } ]
  },
  corporate: {
    company: { name: 'サンプル鉄道株式会社', overview: '地域に根ざした鉄道会社です。', address: '東京都〇〇区', website: '' },
    careers: [ { id: 'c1', title: '車両整備士', location: '本社', link: '' } ],
    press: [ { id: 'p1', title: 'ダイヤ改正のお知らせ', date: new Date().toISOString(), link: '' } ],
    csr: [ { id: 'csr1', title: '環境保全活動', description: '沿線で清掃活動を実施' } ],
    safety: [ { id: 'sf1', title: '安全への取り組み', description: '訓練の定期実施' } ],
  },
  more: {
    top: { enabled: false, label: 'もっと見る', contentText: '', media: [] },
    routes: { enabled: false, label: 'もっと見る', contentText: '', media: [] },
    operation: { enabled: false, label: 'もっと見る', contentText: '', media: [] },
    tourism: { enabled: false, label: 'もっと見る', contentText: '', media: [] },
    corporate: { enabled: false, label: 'もっと見る', contentText: '', media: [] },
  },
  logs: [],
}

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return sample
    const data = JSON.parse(raw)
    return { ...sample, ...data }
  } catch (_) {
    return sample
  }
}

const useOfficialStore = create((set, get) => ({
  data: load(),

  // Generic setters
  setPatch: (path, patch) => set((state) => {
    const parts = path.split('.')
    const next = structuredClone(state.data)
    let obj = next
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]
    obj[parts[parts.length - 1]] = { ...obj[parts[parts.length - 1]], ...patch }
    return { data: next }
  }),

  setCustomCSS: (css) => set(({ data }) => ({ data: { ...data, customCSS: css } })),
  setCustomHTML: (html) => set(({ data }) => ({ data: { ...data, customHTML: html } })),
  setCustomJS: (js) => set(({ data }) => ({ data: { ...data, customJS: js } })),

  // Top
  addOperation: () => set(({ data }) => ({
    data: { ...data, top: { ...data.top, operations: [...data.top.operations, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), status: '平常運行', message: '', updatedAt: new Date().toISOString() }] } }
  })),
  updateOperation: (id, patch) => set(({ data }) => ({
    data: { ...data, top: { ...data.top, operations: data.top.operations.map(o => o.id === id ? { ...o, ...patch } : o) } }
  })),
  removeOperation: (id) => set(({ data }) => ({
    data: { ...data, top: { ...data.top, operations: data.top.operations.filter(o => o.id !== id) } }
  })),

  addNews: () => set(({ data }) => ({
    data: { ...data, top: { ...data.top, news: [...data.top.news, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), title: '新着ニュース', body: '', date: new Date().toISOString(), category: 'お知らせ', link: '' }] } }
  })),
  updateNews: (id, patch) => set(({ data }) => ({
    data: { ...data, top: { ...data.top, news: data.top.news.map(n => n.id === id ? { ...n, ...patch } : n) } }
  })),
  removeNews: (id) => set(({ data }) => ({
    data: { ...data, top: { ...data.top, news: data.top.news.filter(n => n.id !== id) } }
  })),

  // Routes
  addRoute: () => set(({ data }) => ({
    data: { ...data, routes: [...data.routes, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), name: '新しい路線', color: '#2a7cff', mapEmbedUrl: '', stations: [], rollingStock: [] }] }
  })),
  updateRoute: (id, patch) => set(({ data }) => ({
    data: { ...data, routes: data.routes.map(r => r.id === id ? { ...r, ...patch } : r) }
  })),
  removeRoute: (id) => set(({ data }) => ({
    data: { ...data, routes: data.routes.filter(r => r.id !== id) }
  })),
  addStation: (routeId) => set(({ data }) => ({
    data: { ...data, routes: data.routes.map(r => r.id === routeId ? { ...r, stations: [...r.stations, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), name: '新しい駅', code: '' }] } : r) }
  })),
  updateStation: (routeId, stationId, patch) => set(({ data }) => ({
    data: { ...data, routes: data.routes.map(r => r.id === routeId ? { ...r, stations: r.stations.map(s => s.id === stationId ? { ...s, ...patch } : s) } : r) }
  })),
  removeStation: (routeId, stationId) => set(({ data }) => ({
    data: { ...data, routes: data.routes.map(r => r.id === routeId ? { ...r, stations: r.stations.filter(s => s.id !== stationId) } : r) }
  })),
  addRollingStock: (routeId) => set(({ data }) => ({
    data: { ...data, routes: data.routes.map(r => r.id === routeId ? { ...r, rollingStock: [...r.rollingStock, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), name: '新しい車両', photoUrl: '', formation: '' }] } : r) }
  })),
  updateRollingStock: (routeId, stockId, patch) => set(({ data }) => ({
    data: { ...data, routes: data.routes.map(r => r.id === routeId ? { ...r, rollingStock: r.rollingStock.map(s => s.id === stockId ? { ...s, ...patch } : s) } : r) }
  })),
  removeRollingStock: (routeId, stockId) => set(({ data }) => ({
    data: { ...data, routes: data.routes.map(r => r.id === routeId ? { ...r, rollingStock: r.rollingStock.filter(s => s.id !== stockId) } : r) }
  })),

  // Operation Info
  addSchedule: () => set(({ data }) => ({
    data: { ...data, operationInfo: { ...data.operationInfo, schedule: [...data.operationInfo.schedule, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), title: '新しい予定', note: '', timeRange: '' }] } }
  })),
  updateSchedule: (id, patch) => set(({ data }) => ({
    data: { ...data, operationInfo: { ...data.operationInfo, schedule: data.operationInfo.schedule.map(s => s.id === id ? { ...s, ...patch } : s) } }
  })),
  removeSchedule: (id) => set(({ data }) => ({
    data: { ...data, operationInfo: { ...data.operationInfo, schedule: data.operationInfo.schedule.filter(s => s.id !== id) } }
  })),

  // Tourism
  addSpot: () => set(({ data }) => ({
    data: { ...data, tourism: { ...data.tourism, spots: [...data.tourism.spots, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), title: '新しいスポット', description: '', photoUrl: '', nearStation: '' }] } }
  })),
  updateSpot: (id, patch) => set(({ data }) => ({
    data: { ...data, tourism: { ...data.tourism, spots: data.tourism.spots.map(s => s.id === id ? { ...s, ...patch } : s) } }
  })),
  removeSpot: (id) => set(({ data }) => ({
    data: { ...data, tourism: { ...data.tourism, spots: data.tourism.spots.filter(s => s.id !== id) } }
  })),
  addEvent: () => set(({ data }) => ({
    data: { ...data, tourism: { ...data.tourism, events: [...data.tourism.events, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), title: '新しいイベント', date: new Date().toISOString(), info: '' }] } }
  })),
  updateEvent: (id, patch) => set(({ data }) => ({
    data: { ...data, tourism: { ...data.tourism, events: data.tourism.events.map(s => s.id === id ? { ...s, ...patch } : s) } }
  })),
  removeEvent: (id) => set(({ data }) => ({
    data: { ...data, tourism: { ...data.tourism, events: data.tourism.events.filter(s => s.id !== id) } }
  })),
  addGallery: () => set(({ data }) => ({
    data: { ...data, tourism: { ...data.tourism, gallery: [...data.tourism.gallery, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), photoUrl: '', caption: '' }] } }
  })),
  updateGallery: (id, patch) => set(({ data }) => ({
    data: { ...data, tourism: { ...data.tourism, gallery: data.tourism.gallery.map(s => s.id === id ? { ...s, ...patch } : s) } }
  })),
  removeGallery: (id) => set(({ data }) => ({
    data: { ...data, tourism: { ...data.tourism, gallery: data.tourism.gallery.filter(s => s.id !== id) } }
  })),

  // Corporate
  addCareer: () => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, careers: [...data.corporate.careers, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), title: '新しい求人', location: '', link: '' }] } }
  })),
  updateCareer: (id, patch) => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, careers: data.corporate.careers.map(s => s.id === id ? { ...s, ...patch } : s) } }
  })),
  removeCareer: (id) => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, careers: data.corporate.careers.filter(s => s.id !== id) } }
  })),
  addPress: () => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, press: [...data.corporate.press, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), title: '新しいプレスリリース', date: new Date().toISOString(), link: '' }] } }
  })),
  updatePress: (id, patch) => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, press: data.corporate.press.map(s => s.id === id ? { ...s, ...patch } : s) } }
  })),
  removePress: (id) => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, press: data.corporate.press.filter(s => s.id !== id) } }
  })),
  addCSR: () => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, csr: [...data.corporate.csr, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), title: '新しいCSR項目', description: '' }] } }
  })),
  updateCSR: (id, patch) => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, csr: data.corporate.csr.map(s => s.id === id ? { ...s, ...patch } : s) } }
  })),
  removeCSR: (id) => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, csr: data.corporate.csr.filter(s => s.id !== id) } }
  })),
  addSafety: () => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, safety: [...data.corporate.safety, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), title: '新しい安全項目', description: '' }] } }
  })),
  updateSafety: (id, patch) => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, safety: data.corporate.safety.map(s => s.id === id ? { ...s, ...patch } : s) } }
  })),
  removeSafety: (id) => set(({ data }) => ({
    data: { ...data, corporate: { ...data.corporate, safety: data.corporate.safety.filter(s => s.id !== id) } }
  })),

  // More (もっと見る)
  setMoreEnabled: (section, enabled) => set(({ data }) => ({
    data: { ...data, more: { ...data.more, [section]: { ...data.more[section], enabled } } }
  })),
  setMoreLabel: (section, label) => set(({ data }) => ({
    data: { ...data, more: { ...data.more, [section]: { ...data.more[section], label } } }
  })),
  setMoreText: (section, contentText) => set(({ data }) => ({
    data: { ...data, more: { ...data.more, [section]: { ...data.more[section], contentText } } }
  })),
  addMedia: (section, items) => set(({ data }) => ({
    data: { ...data, more: { ...data.more, [section]: { ...data.more[section], media: [
      ...data.more[section].media,
      ...items.map((it) => ({ id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), ...it }))
    ] } } }
  })),
  updateMedia: (section, id, patch) => set(({ data }) => ({
    data: { ...data, more: { ...data.more, [section]: { ...data.more[section], media: data.more[section].media.map((m) => m.id === id ? { ...m, ...patch } : m) } } }
  })),
  removeMedia: (section, id) => set(({ data }) => ({
    data: { ...data, more: { ...data.more, [section]: { ...data.more[section], media: data.more[section].media.filter((m) => m.id !== id) } } }
  })),
  reorderMedia: (section, fromIndex, toIndex) => set(({ data }) => {
    const arr = [...data.more[section].media]
    const [m] = arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, m)
    return { data: { ...data, more: { ...data.more, [section]: { ...data.more[section], media: arr } } } }
  }),

  // 操作ログ
  addLog: (action, meta = {}) => set(({ data }) => ({
    data: { ...data, logs: [
      { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), action, meta, at: new Date().toISOString() },
      ...data.logs
    ] }
  })),
}))

// 永続化
let __syncLockOfficial = false
useOfficialStore.subscribe((state) => {
  if (__syncLockOfficial) return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data)) } catch (_) {}
})

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      try {
        const data = JSON.parse(e.newValue || '{}')
        const current = useOfficialStore.getState().data
        if (JSON.stringify(current) === JSON.stringify(data)) return
        __syncLockOfficial = true
        useOfficialStore.setState({ data })
      } catch (_) {} finally { __syncLockOfficial = false }
    }
  })
}

export default useOfficialStore