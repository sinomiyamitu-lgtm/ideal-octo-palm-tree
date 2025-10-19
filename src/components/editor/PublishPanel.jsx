import React, { useMemo, useState, useEffect } from 'react'
import useProjectsStore from '../../store/projects.js'
import useProfileStore from '../../store/profile.js'
import useProgressStore from '../../store/progress.js'

function buildPayload(projects, profile, progress) {
  return {
    projects: Array.isArray(projects) ? projects : [],
    profile: profile || {},
    progress: Array.isArray(progress) ? progress : [],
  }
}

function generateShareUrl(baseUrl, payload) {
  try {
    const meta = { publishId: Date.now(), nonce: Math.random().toString(36).slice(2, 8) }
    const merged = Object.assign({}, payload, { meta })
    const json = JSON.stringify(merged)
    const encoded = encodeURIComponent(json)
    const sep = baseUrl.endsWith('/') ? '' : '/'
    return baseUrl + sep + '?d=' + encoded
  } catch (e) {
    console.error('Failed to build publish URL', e)
    return ''
  }
}

export default function PublishPanel() {
  const projects = useProjectsStore(s => s.projects)
  const profile = useProfileStore(s => s.profile)
  const progress = useProgressStore(s => s.items)

  const payload = useMemo(() => buildPayload(projects, profile, progress), [projects, profile, progress])

  const baseUrl = (import.meta?.env?.VITE_PUBLIC_VIEWER_URL) || (typeof window !== 'undefined' ? window.location.origin : '')

  const [enabled, setEnabled] = useState(true)
  const [auto, setAuto] = useState(true)
  const [url, setUrl] = useState('')
  const [copyOk, setCopyOk] = useState(false)

  useEffect(() => {
    if (!enabled || !auto) return
    const next = generateShareUrl(baseUrl, payload)
    setUrl(next)
  }, [payload, enabled, auto, baseUrl])

  const updatePublish = () => {
    if (!enabled) { setUrl(''); return }
    const next = generateShareUrl(baseUrl, payload)
    setUrl(next)
    setCopyOk(false)
  }

  const copyToClipboard = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopyOk(true)
      setTimeout(() => setCopyOk(false), 1500)
    } catch (e) {
      alert('クリップボードにコピーできませんでした。')
    }
  }

  const openPublished = () => {
    if (!url) return
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="editor-form">
      <h3>公開（世界公開・閲覧のみ）</h3>
      <p className="muted">作品／プロフィール／進捗の現在内容を含んだ閲覧専用リンクを生成します。編集の都度、自動更新が可能です。</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
        <label style={{display:'flex', alignItems:'center', gap:8}}>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          世界公開を有効化（リンクを生成し共有可能にする）
        </label>
        <label style={{display:'flex', alignItems:'center', gap:8}}>
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          編集に合わせて自動的に公開URLを更新
        </label>
      </div>

      <div className="form-actions" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="button" onClick={updatePublish} disabled={!enabled}>公開を更新</button>
        <button className="button" onClick={copyToClipboard} disabled={!enabled || !url}>{copyOk ? 'コピーしました' : 'URLをコピー'}</button>
        <button className="button" onClick={openPublished} disabled={!enabled || !url}>公開URLを開く</button>
      </div>

      <label style={{marginTop:12}}>公開済みURL</label>
      <input readOnly value={enabled ? (url || '') : ''} placeholder={enabled ? '公開を更新するとURLが表示されます' : '世界公開が無効化されています'} style={{fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'}} />

      <p className="sub">備考：公開URLは毎回発行時に異なる可能性があります（埋め込みデータとIDを含むため）。リンクには閲覧データが含まれるため、共有範囲にご注意ください。</p>
      <p className="muted">表示先は `{baseUrl}` を想定しています。環境変数 `VITE_PUBLIC_VIEWER_URL` を設定すると別ホストに公開できます。</p>
    </div>
  )
}