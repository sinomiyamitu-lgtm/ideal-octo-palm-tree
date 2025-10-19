import React, { useRef, useState } from 'react'
import useProjectsStore from '../../store/projects.js'
import useProfileStore from '../../store/profile.js'
import useProgressStore from '../../store/progress.js'

// タグ終端を半角ドットで正規化
function ensureTagDot(s) {
  const t = String(s || '').trim()
  if (!t) return ''
  return t.replace(/[。．.]+$/, '') + '.'
}

function normalizeProjects(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(p => ({
    ...p,
    tags: (p.tags || []).map(ensureTagDot),
  }))
}

function normalizeProgress(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(p => ({
    descriptionFull: '',
    imageFinalUrl: '',
    imageCurrentUrl: '',
    todos: [],
    ...p,
    tags: (p.tags || []).map(ensureTagDot),
  }))
}

export default function ImportPanel() {
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const setProfile = useProfileStore(s => s.setProfile)

  const handleImport = async (file) => {
    setStatus('')
    setError('')
    try {
      if (!file) throw new Error('ファイルが選択されていません。')
      const text = await file.text()
      const json = JSON.parse(text)
      if (!json || typeof json !== 'object') throw new Error('JSONの形式が不正です。')

      // 反映（タグ等を正規化）
      if (Array.isArray(json.projects)) {
        const projects = normalizeProjects(json.projects)
        useProjectsStore.setState({ projects, selectedId: projects[0]?.id || null })
      }
      if (json.profile && typeof json.profile === 'object') {
        setProfile({ ...json.profile, updatedAt: new Date().toISOString() })
      }
      if (Array.isArray(json.progress)) {
        const items = normalizeProgress(json.progress)
        useProgressStore.setState({ items, selectedId: items[0]?.id || null })
      }

      // LocalStorageへの保存は各ストアのsubscribeで自動実行されます
      setStatus('読み込みが完了しました。')
    } catch (e) {
      console.error(e)
      setError(e?.message || '読み込みに失敗しました。')
    }
  }

  const onClickImport = () => {
    const f = fileInputRef.current?.files?.[0]
    handleImport(f)
  }

  return (
    <div className="editor-form">
      <h3>インポート（読み込み）</h3>
      <p className="muted">エクスポートした <code>viewer-data.json</code> を選択して読み込みできます。</p>
      <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
        <input ref={fileInputRef} type="file" accept="application/json,.json" />
        <button className="button" onClick={onClickImport}>読み込む</button>
      </div>
      {status && <p className="sub" style={{color:'var(--accent)'}}>{status}</p>}
      {error && <p className="sub" style={{color:'#d66'}}>{error}</p>}
    </div>
  )
}