import React, { useMemo, useRef, useState } from 'react'
import useOfficialStore from '../../store/official.js'
import useSessionStore from '../../store/session.js'

export default function OfficialMoreForm({ section = 'top' }) {
  const { username, role } = useSessionStore()
  const {
    data,
    setMoreEnabled,
    setMoreLabel,
    setMoreText,
    addMedia,
    updateMedia,
    removeMedia,
    reorderMedia,
    addLog,
  } = useOfficialStore()

  const more = data.more?.[section] || { enabled: false, label: 'もっと見る', contentText: '', media: [] }
  const [dragIndex, setDragIndex] = useState(null)
  const fileInputRef = useRef(null)

  const sectionLabel = useMemo(() => ({
    top: 'トップ', routes: '路線情報', operation: '運行情報', tourism: '観光・沿線', corporate: '企業情報'
  })[section] || section, [section])

  const disabled = role !== 'editor'

  const onFiles = async (files) => {
    if (!files || files.length === 0) return
    const items = []
    for (const f of files) {
      const type = f.type.startsWith('video') ? 'video' : 'image'
      if (type === 'image') {
        const reader = new FileReader()
        const p = new Promise((resolve) => {
          reader.onload = () => resolve(reader.result)
        })
        reader.readAsDataURL(f)
        const src = await p
        items.push({ type, src, name: f.name })
      } else {
        const src = URL.createObjectURL(f) // blob URL（再読込で無効になる）
        items.push({ type, src, name: f.name, ephemeral: true })
      }
    }
    addMedia(section, items)
    addLog('media:addUpload', { section, count: items.length, by: username })
  }

  const onUrlAdd = (url) => {
    if (!url || !url.trim()) return
    const type = url.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? 'video' : 'image'
    addMedia(section, [{ type, src: url.trim() }])
    addLog('media:addUrl', { section, type, by: username })
  }

  const onDropReorder = (toIndex) => {
    if (dragIndex == null) return
    reorderMedia(section, dragIndex, toIndex)
    setDragIndex(null)
    addLog('media:reorder', { section, from: dragIndex, to: toIndex, by: username })
  }

  return (
    <div className="editor-card" style={{ padding: 12 }}>
      <div className="panel-header">
        <div className="title">もっと見る（{sectionLabel}）</div>
        <div className="sub">折りたたみ設定・メディア管理</div>
      </div>

      <div className="editor-form">
        <label className="list-item" style={{alignItems:'center',gap:10}}>
          <input type="checkbox" disabled={disabled} checked={!!more.enabled} onChange={(e) => { setMoreEnabled(section, e.target.checked); addLog('more:toggle', { section, enabled: e.target.checked, by: username }) }} />
          <span>機能を有効化</span>
        </label>

        <label className="list-item">
          <div className="sub">ボタン表示テキスト</div>
          <input className="input" type="text" disabled={disabled} value={more.label || ''} onChange={(e) => setMoreLabel(section, e.target.value)} placeholder="例: もっと見る" />
        </label>

        <label className="list-item">
          <div className="sub">展開時の本文</div>
          <textarea className="textarea" rows={4} disabled={disabled} value={more.contentText || ''} onChange={(e) => setMoreText(section, e.target.value)} placeholder="説明文や詳細などを記述" />
        </label>

        <div className="panel" style={{marginTop:10}}>
          <div className="panel-header">
            <div className="title">メディア追加</div>
            <div className="sub">画像・動画をアップロードまたはURLで追加</div>
          </div>
          <div className="editor-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
            <div className="editor-card">
              <div className="list-item">
                <input ref={fileInputRef} type="file" multiple disabled={disabled} accept="image/*,video/*" onChange={(e) => onFiles(e.target.files)} />
              </div>
              <div className="list-item">
                <button className="button" disabled={disabled} onClick={() => fileInputRef.current?.click()}>ファイル選択</button>
              </div>
              <div className="sub">動画のアップロードはプレビューのみ（再読込で無効）。永続化はURL追加を推奨。</div>
            </div>
            <div className="editor-card">
              <div className="list-item">
                <input type="url" className="input" disabled={disabled} placeholder="画像/動画のURLを入力" onKeyDown={(e) => { if (e.key === 'Enter') { onUrlAdd(e.currentTarget.value); e.currentTarget.value=''; } }} />
              </div>
              <div className="sub">Enterで追加。拡張子が動画なら動画として扱います。</div>
            </div>
          </div>
        </div>

        <div className="panel" style={{marginTop:10}}>
          <div className="panel-header">
            <div className="title">メディア一覧（ドラッグ＆ドロップで並べ替え）</div>
          </div>
          <div className="media-grid" style={{gap:12}}>
            {(more.media || []).map((m, idx) => (
              <div key={m.id}
                   className="section-card"
                   draggable={!disabled}
                   onDragStart={() => setDragIndex(idx)}
                   onDragOver={(e) => e.preventDefault()}
                   onDrop={() => onDropReorder(idx)}
                   style={{padding:8}}>
                {m.type === 'image' ? (
                  <img src={m.src} alt={m.title||''} style={{width:'100%',height:140,objectFit:'cover',borderRadius:8}} />
                ) : (
                  <video src={m.src} controls style={{width:'100%',height:160,borderRadius:8}} />
                )}
                <div className="card-actions" style={{marginTop:8,display:'flex',gap:8}}>
                  <button className="button" disabled={disabled} onClick={() => updateMedia(section, m.id, { title: prompt('表示タイトル（任意）', m.title || '') || '' })}>タイトル設定</button>
                  <button className="button" disabled={disabled} onClick={() => { removeMedia(section, m.id); addLog('media:remove', { section, id: m.id, by: username }) }}>削除</button>
                </div>
                {m.ephemeral && (<div className="sub" style={{marginTop:4}}>blob URL（アップロード動画）は再読込で失効します</div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}