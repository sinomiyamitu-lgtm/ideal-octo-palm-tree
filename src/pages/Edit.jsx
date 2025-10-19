import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useSessionStore from '../store/session.js'
import BlockPalette from '../components/editor/BlockPalette.jsx'
import CardList from '../components/editor/CardList.jsx'
import CardForm from '../components/editor/CardForm.jsx'
import ProfileForm from '../components/editor/ProfileForm.jsx'
import ExportPanel from '../components/editor/ExportPanel.jsx'
import ImportPanel from '../components/editor/ImportPanel.jsx'
import ProgressPalette from '../components/editor/ProgressPalette.jsx'
import ProgressList from '../components/editor/ProgressList.jsx'
import ProgressForm from '../components/editor/ProgressForm.jsx'
import ProgressKanban from '../components/editor/ProgressKanban.jsx'
import { motion } from 'framer-motion'
import OfficialTopForm from '../components/editor/OfficialTopForm.jsx'
import OfficialRoutesForm from '../components/editor/OfficialRoutesForm.jsx'
import OfficialOperationForm from '../components/editor/OfficialOperationForm.jsx'
import OfficialTourismForm from '../components/editor/OfficialTourismForm.jsx'
import OfficialCorporateForm from '../components/editor/OfficialCorporateForm.jsx'
import OfficialCustomForm from '../components/editor/OfficialCustomForm.jsx'

export default function Edit() {
  const logout = useSessionStore((s) => s.logout)
  const [viewMode, setViewMode] = useState('list')
  const [officialTab, setOfficialTab] = useState('top')

  useEffect(() => {
    document.body.classList.add('ready')
    return () => { document.body.classList.remove('ready') }
  }, [])

  return (
    <motion.div className="container" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
      <header className="header">
        <h1>作品編集</h1>
        <nav className="nav">
          <Link to="/">ポートフォリオ</Link>
          <Link to="/edit">作品編集</Link>
          <Link to="/official">公式サイト</Link>
          <button className="button" onClick={logout}>ログアウト</button>
        </nav>
      </header>

      <section className="section">
        <div className="editor-grid">
          <BlockPalette />
          <CardList />
          <CardForm />
        </div>
        <div className="editor-grid" style={{gridTemplateColumns:'1fr'}}>
          <ProfileForm />
        </div>
        <div className="editor-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
          <ExportPanel />
          <ImportPanel />
        </div>
        {/* 進捗編集（作品編集の下に統合） */}
        <div style={{display:'flex', gap:8, alignItems:'center', marginTop:24, marginBottom:12}}>
          <span className="sub">進捗ビュー:</span>
          <button className={`button${viewMode==='list'?'':''}`} onClick={() => setViewMode('list')}>リスト</button>
          <button className={`button${viewMode==='kanban'?'':''}`} onClick={() => setViewMode('kanban')}>カンバン</button>
        </div>
        <div className="editor-grid">
          <ProgressPalette />
          {viewMode === 'kanban' ? <ProgressKanban /> : <ProgressList />}
          <ProgressForm />
        </div>

        {/* 公式サイト編集セクション */}
        <div style={{marginTop:32, marginBottom:12}}>
          <h2>公式サイト編集</h2>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <button className={`button${officialTab==='top'?' active':''}`} onClick={() => setOfficialTab('top')}>トップ</button>
            <button className={`button${officialTab==='routes'?' active':''}`} onClick={() => setOfficialTab('routes')}>路線</button>
            <button className={`button${officialTab==='operation'?' active':''}`} onClick={() => setOfficialTab('operation')}>運行</button>
            <button className={`button${officialTab==='tourism'?' active':''}`} onClick={() => setOfficialTab('tourism')}>観光</button>
            <button className={`button${officialTab==='corporate'?' active':''}`} onClick={() => setOfficialTab('corporate')}>企業</button>
            <button className={`button${officialTab==='custom'?' active':''}`} onClick={() => setOfficialTab('custom')}>カスタム</button>
          </div>
        </div>
        {officialTab === 'top' && <OfficialTopForm />}
        {officialTab === 'routes' && <OfficialRoutesForm />}
        {officialTab === 'operation' && <OfficialOperationForm />}
        {officialTab === 'tourism' && <OfficialTourismForm />}
        {officialTab === 'corporate' && <OfficialCorporateForm />}
        {officialTab === 'custom' && <OfficialCustomForm />}
      </section>
    </motion.div>
  )
}