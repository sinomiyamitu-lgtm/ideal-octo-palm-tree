import React, { useMemo, useState } from 'react'
import useProgressStore from '../store/progress.js'
import { motion } from 'framer-motion'

function StatusText({ status }) {
  if (status === 'done') return '完了'
  if (status === 'in_progress') return '進行中'
  return '未着手'
}

function PriorityText({ priority }) {
  if (priority === 'high') return '高'
  if (priority === 'low') return '低'
  return '中'
}

export default function ProgressSummary({ onOpen, query: qProp, statusFilter: statusProp, activeTag: tagProp, hideFilterBar }) {
  const items = useProgressStore(s => s.items)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)

  // 外部フィルタ優先の有効値
  const effectiveQuery = (qProp ?? query)
  const effectiveStatus = (statusProp ?? statusFilter)
  const effectiveTag = (tagProp ?? activeTag)

  const sorted = useMemo(() => {
    // 表示順: order昇順（ストア管理の順序）
    return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [items])

  const allTags = useMemo(() => Array.from(new Set(items.flatMap(p => p.tags || []))), [items])
  const suggestions = useMemo(() => {
    const q = (effectiveQuery || '').trim().toLowerCase()
    if (!q) return []
    const tagSug = allTags.filter(t => t.toLowerCase().includes(q)).slice(0, 5).map(t => ({ kind: 'タグ', text: t, type: 'tag' }))
    const titleSug = items.filter(p => (p.title || '').toLowerCase().includes(q)).slice(0, 5).map(p => ({ kind: 'タイトル', text: p.title, type: 'title', id: p.id }))
    return [...tagSug, ...titleSug].slice(0, 8)
  }, [items, allTags, effectiveQuery])

  const filtered = useMemo(() => {
    let base = [...items]
    if (effectiveStatus) base = base.filter(p => p.status === effectiveStatus)
    if (effectiveTag) base = base.filter(p => (p.tags || []).includes(effectiveTag))
    const q = (effectiveQuery || '').trim().toLowerCase()
    if (q) base = base.filter(p => {
      const text = [p.title || '', p.descriptionShort || '', p.descriptionFull || '', ...(p.tags || [])].join(' ').toLowerCase()
      return text.includes(q)
    })
    return base.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [items, effectiveStatus, effectiveTag, effectiveQuery])

  const dueLabel = (item) => {
    if (!item.dueDate || item.status === 'done') return ''
    try {
      const now = Date.now()
      const due = new Date(item.dueDate).getTime()
      const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
      if (days < 0) return '期限超過'
      if (days <= 3) return `期限接近(${days}日)`
      return ''
    } catch (_) { return '' }
  }

  const barClass = (pct) => {
    const v = Math.max(0, Math.min(100, Number(pct || 0)))
    return v < 30 ? 'red' : (v < 70 ? 'yellow' : 'green')
  }

  if (!sorted.length) {
    return (
      <div className="summary-list">
        <div className="summary-empty sub">進捗カードがありません。編集ページで追加してください。</div>
      </div>
    )
  }

  return (
    <div aria-label="進捗一覧">
      {/* フィルタバーは統合検索がある場合非表示 */}
      { !hideFilterBar && (
        <div className="filter-bar" style={{display:'grid', gap:8, marginBottom:12}}>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <input placeholder="進捗検索…" value={query} onChange={(e) => { setQuery(e.target.value); setShowSuggest(!!e.target.value) }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">すべて</option>
              <option value="todo">未着手</option>
              <option value="in_progress">進行中</option>
              <option value="done">完了</option>
            </select>
            <button className="button" onClick={() => { setQuery(''); setStatusFilter(''); setActiveTag(''); setShowSuggest(false) }}>クリア</button>
          </div>
          {!!activeTag && (
            <div className="tags">
              <span className="tag">#{activeTag}</span>
              <button className="button" onClick={() => setActiveTag('')}>タグ解除</button>
            </div>
          )}
          {showSuggest && (query || '').trim() && (
            <div className="suggest-box">
              {suggestions.map((s, i) => (
                <div key={i} className="suggest-item" onClick={() => {
                  if (s.type === 'tag') { setActiveTag(s.text); setQuery(''); setShowSuggest(false) }
                  else if (s.type === 'title') { onOpen?.(s.id) }
                }}>
                  <div className="suggest-kind">{s.kind}</div>
                  <div className="suggest-text">{s.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="summary-list">
        {filtered.length ? (
          filtered.map((item) => {
            const pct = Math.max(0, Math.min(100, Number(item.percent || 0)))
            const dl = dueLabel(item)
            return (
              <div key={item.id} className="summary-item" style={{ borderColor: dl ? '#6b2a2a' : undefined }}>
                <div className="summary-main">
                  <div className="title">{item.title}</div>
                  <div className="tags">
                    {(item.tags || []).map((t, i) => (<span key={i} className="tag">#{t}</span>))}
                  </div>
                  <div className="sub">{item.descriptionShort || '（説明なし）'}</div>
                  <div className="sub" style={{ marginTop: 4 }}>
                    ステータス: <StatusText status={item.status} /> ／ 優先度: <PriorityText priority={item.priority} /> ／ 期限: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '未設定'}
                  </div>
                  {dl && (<div className="sub" style={{ color: '#ff6666' }}>⚠️ {dl}</div>)}
                  <div className="progress" style={{ marginTop: 6 }}>
                    <motion.div
                      className={`bar ${barClass(pct)} ${item.status === 'in_progress' ? 'shimmer' : ''}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring', stiffness: 160, damping: 24 }}
                    />
                    <div className="percent">{pct}%</div>
                  </div>
                  <div className="card-actions" style={{ marginTop: 8 }}>
                    <button className="button" onClick={() => onOpen?.(item.id)}>もっと見る</button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="summary-empty sub">検索に一致する進捗がありません。</div>
        )}
      </div>
    </div>
  )
}