import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useSessionStore from '../store/session.js'
import ProgressPalette from '../components/editor/ProgressPalette.jsx'
import ProgressList from '../components/editor/ProgressList.jsx'
import ProgressForm from '../components/editor/ProgressForm.jsx'
import ProgressKanban from '../components/editor/ProgressKanban.jsx'
import { motion } from 'framer-motion'

export default function Progress() {
  const logout = useSessionStore((s) => s.logout)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'kanban'

  useEffect(() => {
    document.body.classList.add('ready')
    return () => { document.body.classList.remove('ready') }
  }, [])

  return (
    <motion.div className="container" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
      <header className="header">
        <h1>進捗編集</h1>
        <nav className="nav">
          <Link to="/">ポートフォリオ</Link>
          <Link to="/edit">作品編集</Link>
          <Link to="/official">公式サイト</Link>
          <button className="button" onClick={logout}>ログアウト</button>
        </nav>
      </header>

      <section className="section">
        <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
          <span className="sub">ビュー切り替え:</span>
          <button className={`button${viewMode==='list'?'':''}`} onClick={() => setViewMode('list')}>リスト</button>
          <button className={`button${viewMode==='kanban'?'':''}`} onClick={() => setViewMode('kanban')}>カンバン</button>
        </div>
        <div className="editor-grid">
          <ProgressPalette />
          {viewMode === 'kanban' ? <ProgressKanban /> : <ProgressList />}
          <ProgressForm />
        </div>
      </section>
    </motion.div>
  )
}