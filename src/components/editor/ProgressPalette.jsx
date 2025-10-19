import React, { useRef } from 'react'
import useProgressStore from '../../store/progress.js'

export default function ProgressPalette() {
  const addItem = useProgressStore(s => s.addItem)
  const importItems = useProgressStore(s => s.importItems)
  const exportItems = useProgressStore(s => s.exportItems)
  const fileRef = useRef(null)

  const onClickImport = () => fileRef.current?.click()
  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      importItems(json, 'append')
      alert('進捗をインポートしました。')
    } catch (_) {
      alert('JSONの読み込みに失敗しました。')
    } finally {
      e.target.value = ''
    }
  }

  const onClickExport = () => {
    try {
      const payload = exportItems()
      const text = JSON.stringify(payload, null, 2)
      const blob = new Blob([text], { type: 'application/json' })
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const name = `progress-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (_) {
      alert('JSONの保存に失敗しました。')
    }
  }

  return (
    <div className="editor-palette">
      <h3>進捗ブロック追加</h3>
      <button className="button" onClick={addItem}>進捗カードを追加</button>
      <hr style={{margin:'12px 0', opacity:0.3}} />
      <h3>インポート / エクスポート</h3>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="button" onClick={onClickImport}>進捗をインポート(JSON)</button>
        <button className="button" onClick={onClickExport}>進捗を保存(JSON)</button>
      </div>
      <input type="file" accept=".json,application/json" ref={fileRef} style={{display:'none'}} onChange={onFileChange} />
    </div>
  )
}