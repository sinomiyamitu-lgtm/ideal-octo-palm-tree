import React, { useMemo, useState } from 'react'
import useProjectsStore from '../../store/projects.js'
import useProgressStore from '../../store/progress.js'

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

export default function CardForm() {
  const selectedId = useProjectsStore(s => s.selectedId)
  const project = useProjectsStore(s => s.projects.find(p => p.id === s.selectedId))
  const update = useProjectsStore(s => s.updateProject)
  const removeSelected = useProjectsStore(s => s.removeSelected)
  const allProjects = useProjectsStore(s => s.projects)
  const allProgress = useProgressStore(s => s.items)

  const [tagText, setTagText] = useState('')
  const [editingTagIndex, setEditingTagIndex] = useState(null)
  const [editingTagValue, setEditingTagValue] = useState('')

  // ハッシュタグ形式で表示（例: "#UI. #Motion.")
  const tagsText = useMemo(() => (project?.tags || []).map(t => `#${ensureTagDot(t)}`).join(' '), [project])

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
    const existing = new Set((project?.tags || []).map(ensureTagDot))
    return allTags
      .filter(t => normalizeBase(t).toLowerCase().includes(q))
      .filter(t => !existing.has(ensureTagDot(t)))
      .slice(0, 6)
  }, [tagText, allTags, project?.tags])

  if (!project) {
    return <div className="editor-form"><p>カードを選択するか、左のパレットから追加してください。</p></div>
  }

  const onChange = (patch) => update(project.id, patch)

  const onAttachFiles = async (files) => {
    if (!files || files.length === 0) return
    const reads = Array.from(files).map(file => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve({
        id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        name: file.name,
        mime: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: reader.result,
      })
      reader.readAsDataURL(file)
    }))
    const attachments = await Promise.all(reads)
    onChange({ attachments: [ ...(project.attachments || []), ...attachments ] })
  }

  const removeAttachment = (id) => {
    onChange({ attachments: (project.attachments || []).filter(a => a.id !== id) })
  }

  // サムネイルアップロード
  const onUploadThumbnail = async (file) => {
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    onChange({ thumbnailUrl: dataUrl })
  }

  // 映像アップロード（小さい動画推奨）
  const onUploadMedia = async (file) => {
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    onChange({ mediaUrl: dataUrl })
  }

  return (
    <div className="editor-form">
      <h3>カード編集</h3>
      <label>タイトル</label>
      <input value={project.title} onChange={(e) => onChange({ title: e.target.value })} />

      <label>タグ</label>
      <div className="tags-editor" style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:8}}>
        {(project.tags || []).map((t, i) => (
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
                  const tags = (project.tags || []).map((x, idx) => idx === i ? next : x)
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
                  const tags = (project.tags || []).filter((_, idx) => idx !== i)
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
                  const tags = (project.tags || []).filter((_, idx) => idx !== i)
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
            onChange({ tags: [ ...(project.tags || []), next ] })
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
      <input value={project.descriptionShort || ''} onChange={(e) => onChange({ descriptionShort: e.target.value })} />

      <label>詳細説明</label>
      <textarea rows={4} value={project.descriptionFull || ''} onChange={(e) => onChange({ descriptionFull: e.target.value })} />

      <label>画像URL（サムネイル）</label>
      <input value={project.thumbnailUrl || ''} onChange={(e) => onChange({ thumbnailUrl: e.target.value })} />
      <div style={{display:'flex',gap:8,alignItems:'center',marginTop:6}}>
        <input type="file" accept="image/*" onChange={(e) => onUploadThumbnail(e.target.files?.[0])} />
        <span className="sub">ローカル画像をアップロードして設定できます。</span>
      </div>

      <label>映像URL（YouTube/Vimeoなど）</label>
      <input value={project.mediaUrl || ''} onChange={(e) => onChange({ mediaUrl: e.target.value })} />
      <div style={{display:'flex',gap:8,alignItems:'center',marginTop:6}}>
        <input type="file" accept="video/*" onChange={(e) => onUploadMedia(e.target.files?.[0])} />
        <span className="sub">小さめの動画ファイルをアップロード可能（保存容量に注意）。</span>
      </div>

      <div className="form-group">
        <div className="title-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <label>添付ファイル</label>
          <input type="file" multiple onChange={(e) => onAttachFiles(e.target.files)} />
        </div>
        <div className="attachments-list" style={{display:'grid',gap:6,marginTop:8}}>
          {(project.attachments || []).length === 0 && (
            <p className="muted" style={{margin:0}}>まだ添付がありません。</p>
          )}
          {(project.attachments || []).map((a) => (
            <div key={a.id} className="attachment-row" style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:8,alignItems:'center'}}>
              <span title={`${a.name} (${a.mime}, ${Math.round(a.size/1024)}KB)`}>{a.name}</span>
              <a className="button" href={a.dataUrl} download={a.name}>ダウンロード</a>
              <button className="icon-btn danger" aria-label="削除" title="削除" onClick={() => removeAttachment(a.id)}>🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* 進捗・エフェクト設定は撤去 */}

      <div className="form-actions">
        <button className="button" onClick={removeSelected}>削除</button>
      </div>
    </div>
  )
}