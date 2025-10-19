import React, { useMemo, useState } from 'react'
import useProgressStore from '../../store/progress.js'
import useProjectsStore from '../../store/projects.js'

// 末尾ドット正規化（全角・半角ドットを除去して半角.を付与）
const ensureTagDot = (s) => {
  const t = String(s || '').trim().replace(/^[#＃]+/, '')
  if (!t) return ''
  return t.replace(/[。．.]+$/, '') + '.'
}

// ファイルをdataURLに変換
const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

export default function ProgressForm() {
  const selectedId = useProgressStore(s => s.selectedId)
  const item = useProgressStore(s => s.items.find(p => p.id === s.selectedId))
  const update = useProgressStore(s => s.updateItem)
  const removeSelected = useProgressStore(s => s.removeSelected)
  const allProjects = useProjectsStore(s => s.projects)
  const allProgress = useProgressStore(s => s.items)
  const [todoText, setTodoText] = useState('')
  const [tagText, setTagText] = useState('')
  const [editingTagIndex, setEditingTagIndex] = useState(null)
  const [editingTagValue, setEditingTagValue] = useState('')

  if (!item) {
    return <div className="editor-form"><p>進捗カードを選択するか、左のパレットから追加してください。</p></div>
  }

  const onChange = (patch) => update(item.id, patch)

  // 既存タグサジェスト（作品+進捗の統合）
  const normalizeBase = (s) => String(s || '').replace(/^[#＃]+/, '').replace(/[。．.]+$/, '').trim()
  const allTags = useMemo(() => {
    const a = allProjects.flatMap(p => p.tags || [])
    const b = allProgress.flatMap(p => p.tags || [])
    return Array.from(new Set([...a, ...b]))
  }, [allProjects, allProgress])
  const tagSuggestions = useMemo(() => {
    const q = normalizeBase(tagText).toLowerCase()
    if (!q) return []
    const existing = new Set((item?.tags || []).map(ensureTagDot))
    return allTags
      .filter(t => normalizeBase(t).toLowerCase().includes(q))
      .filter(t => !existing.has(ensureTagDot(t)))
      .slice(0, 6)
  }, [tagText, allTags, item?.tags])

  const pct = Math.max(0, Math.min(100, Number(item.percent || 0)))

  // 画像アップロード（完成イメージ）
  const onUploadFinal = async (file) => {
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    onChange({ imageFinalUrl: dataUrl })
  }

  // 画像アップロード（現在の進捗）
  const onUploadCurrent = async (file) => {
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    onChange({ imageCurrentUrl: dataUrl })
  }

  return (
    <div className="editor-form">
      <h3>進捗編集</h3>
      <label>タイトル</label>
      <input value={item.title} onChange={(e) => onChange({ title: e.target.value })} />

      <label>タグ</label>
      <div className="tags-editor" style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:8}}>
        {(item.tags || []).map((t, i) => (
          editingTagIndex === i ? (
            <div key={i} style={{display:'flex', gap:6}}>
              <input
                value={editingTagValue}
                onChange={(e) => setEditingTagValue(e.target.value)}
                placeholder="タグ名（例: UI）"
              />
              <button
                className="button"
                onClick={() => {
                  const next = ensureTagDot(editingTagValue.replace(/^[#＃]+/, '').trim())
                  if (!next) { setEditingTagIndex(null); setEditingTagValue(''); return }
                  const tags = (item.tags || []).map((x, idx) => idx === i ? next : x)
                  onChange({ tags })
                  setEditingTagIndex(null)
                  setEditingTagValue('')
                }}
              >
                保存
              </button>
              <button
                className="button danger"
                onClick={() => {
                  const tags = (item.tags || []).filter((_, idx) => idx !== i)
                  onChange({ tags })
                  setEditingTagIndex(null)
                  setEditingTagValue('')
                }}
                title="このタグを削除"
              >
                削除
              </button>
              <button className="icon-btn" onClick={() => { setEditingTagIndex(null); setEditingTagValue('') }}>✖️</button>
            </div>
          ) : (
            <div key={i} style={{display:'flex', gap:6, alignItems:'center'}}>
              <button
                className="tag"
                onClick={() => {
                  setEditingTagIndex(i)
                  setEditingTagValue(String(t || '').replace(/^[#＃]+/, '').replace(/[。．.]+$/, ''))
                }}
                title="タップして編集"
              >
                #{ensureTagDot(t)}
              </button>
              <button
                className="icon-btn danger"
                onClick={() => {
                  const tags = (item.tags || []).filter((_, idx) => idx !== i)
                  onChange({ tags })
                }}
                title="タグ削除"
              >
                🗑️
              </button>
            </div>
          )
        ))}
      </div>
      <div className="tag-add" style={{display:'flex', gap:8, marginBottom:8}}>
        <input
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          placeholder="タグを追加（例: UI）"
        />
        <button
          className="button"
          onClick={() => {
            const next = ensureTagDot(tagText.replace(/^[#＃]+/, '').trim())
            if (!next) return
            onChange({ tags: [ ...(item.tags || []), next ] })
            setTagText('')
          }}
        >
          追加
        </button>
      </div>
      {normalizeBase(tagText) && tagSuggestions.length > 0 && (
        <div className="tags" style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:4}}>
          <span className="sub" style={{marginRight:8}}>候補:</span>
          {tagSuggestions.map((t, i) => (
            <button key={i} className="tag" onClick={() => setTagText(normalizeBase(t))}>#{ensureTagDot(t)}</button>
          ))}
        </div>
      )}

      <label>サブ説明</label>
      <input value={item.descriptionShort || ''} onChange={(e) => onChange({ descriptionShort: e.target.value })} />

      <label>詳細説明</label>
      <textarea rows={4} value={item.descriptionFull || ''} onChange={(e) => onChange({ descriptionFull: e.target.value })} />

      <label>完成イメージURL</label>
      <input value={item.imageFinalUrl || ''} onChange={(e) => onChange({ imageFinalUrl: e.target.value })} />
      <div style={{display:'flex',gap:8,alignItems:'center',marginTop:6}}>
        <input type="file" accept="image/*" onChange={(e) => onUploadFinal(e.target.files?.[0])} />
        <span className="sub">ローカル画像をアップロードして設定できます。</span>
      </div>

      <label>現在の進捗画像URL</label>
      <input value={item.imageCurrentUrl || ''} onChange={(e) => onChange({ imageCurrentUrl: e.target.value })} />
      <div style={{display:'flex',gap:8,alignItems:'center',marginTop:6}}>
        <input type="file" accept="image/*" onChange={(e) => onUploadCurrent(e.target.files?.[0])} />
        <span className="sub">ローカル画像をアップロードして設定できます。</span>
      </div>

      <label>ToDo</label>
      <div className="todo-items" style={{display:'grid', gap:8}}>
        {(item.todos || []).map((t) => (
          <div key={t.id} className="todo-item">
            <label style={{display:'flex', alignItems:'center', gap:8}}>
              <input type="checkbox" checked={!!t.done} onChange={() => onChange({ todos: (item.todos || []).map(x => x.id === t.id ? { ...x, done: !x.done } : x) })} />
              <input value={t.title} onChange={(e) => onChange({ todos: (item.todos || []).map(x => x.id === t.id ? { ...x, title: e.target.value } : x) })} />
            </label>
            <button className="icon-btn danger" onClick={() => onChange({ todos: (item.todos || []).filter(x => x.id !== t.id) })}>🗑️</button>
          </div>
        ))}
        {!(item.todos || []).length && (
          <div className="sub">まだToDoがありません。</div>
        )}
      </div>
      <div className="todo-add" style={{display:'flex', gap:8, marginTop:8}}>
        <input value={todoText} placeholder="ToDoを追加" onChange={(e) => setTodoText(e.target.value)} />
        <button className="button" onClick={() => { const title = (todoText || '').trim(); if (!title) return; onChange({ todos: [...(item.todos || []), { id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2), title, done: false }] }); setTodoText('') }}>追加</button>
      </div>

      <label>進捗（%）</label>
      <input type="number" min="0" max="100" value={pct} onChange={(e) => onChange({ percent: Number(e.target.value) || 0 })} />

      <label>ステータス</label>
      <select value={item.status} onChange={(e) => onChange({ status: e.target.value })}>
        <option value="todo">未着手</option>
        <option value="in_progress">進行中</option>
        <option value="done">完了</option>
      </select>

      <label>優先度</label>
      <select value={item.priority} onChange={(e) => onChange({ priority: e.target.value })}>
        <option value="low">低</option>
        <option value="medium">中</option>
        <option value="high">高</option>
      </select>

      <label>期限</label>
      <input type="date" value={item.dueDate ? item.dueDate.slice(0,10) : ''} onChange={(e) => onChange({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })} />

      <div style={{display:'flex', gap:8, marginTop:12}}>
        <button className="button danger" onClick={removeSelected}>選択削除</button>
      </div>
      <div className="form-actions" style={{display:'flex', gap:8, marginTop:8}}>
        <button className="button" onClick={() => removeSelected()}>選択カードを削除</button>
      </div>
    </div>
  )
}