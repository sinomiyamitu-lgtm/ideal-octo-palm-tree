import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useSessionStore from '../store/session.js'
import Official from './Official.jsx'
import OfficialMoreForm from '../components/editor/OfficialMoreForm.jsx'

export default function OfficialManage() {
  const { isAuthenticated, role } = useSessionStore()
  const [section, setSection] = useState('top')

  if (!isAuthenticated || role !== 'editor') {
    return (
      <motion.div className="container" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
        <header className="header">
          <h1>公式サイト管理</h1>
          <nav className="nav">
            <Link to="/">ポートフォリオ</Link>
            <Link to="/edit">作品編集</Link>
            <Link to="/official">公式サイト</Link>
          </nav>
        </header>
        <section className="section">
          <div className="profile">
            <div className="title">アクセスが許可されていません</div>
            <p className="sub">編集権限のあるユーザーのみ管理できます。ログインしてください。</p>
            <Link to="/edit" className="button">編集サイトへ</Link>
          </div>
        </section>
      </motion.div>
    )
  }

  return (
    <motion.div className="container" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
      <header className="header">
        <h1>公式サイト管理</h1>
        <nav className="nav">
          <Link to="/">ポートフォリオ</Link>
          <Link to="/edit">作品編集</Link>
          <Link to="/official">公式サイト</Link>
        </nav>
      </header>

      <section className="section">
        <div className="panel">
          <div className="panel-header">
            <div className="title">管理セクション選択</div>
            <div className="sub">各公式ページごとに設定可能</div>
          </div>
          <div className="editor-form">
            <label className="list-item">
              <div className="sub">対象セクション</div>
              <select className="input" value={section} onChange={(e) => setSection(e.target.value)}>
                <option value="top">トップ</option>
                <option value="routes">路線情報</option>
                <option value="operation">運行情報</option>
                <option value="tourism">観光・沿線</option>
                <option value="corporate">企業情報</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="editor-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
          <OfficialMoreForm section={section} />
          <div className="editor-card" style={{padding:12}}>
            <div className="panel-header">
              <div className="title">リアルタイムプレビュー</div>
              <div className="sub">右側のプレビューは即時反映されます</div>
            </div>
            <div className="section-card">
              <div className="card-actions" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span className="sub">別タブで開くとフル画面で確認できます</span>
                <a className="button" href="/official" target="_blank" rel="noreferrer">公式サイトを開く</a>
              </div>
              <div style={{border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',marginTop:12}}>
                {/* コンポーネントを直接表示 */}
                <Official />
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}