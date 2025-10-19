import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useSessionStore from '../store/session.js'
import useProjectsStore from '../store/projects.js'
import useProfileStore from '../store/profile.js'
import ProjectModal from '../components/ProjectModal.jsx'
import ProgressSummary from '../components/ProgressSummary.jsx'
import ProgressModal from '../components/ProgressModal.jsx'
import useProgressStore from '../store/progress.js'
import { AnimatePresence, motion } from 'framer-motion'
import Masonry from 'react-masonry-css'
import ProfileModal from '../components/ProfileModal.jsx'

export default function Home() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const projects = useProjectsStore((s) => s.projects)
  const profile = useProfileStore((s) => s.profile)
  const progressItems = useProgressStore((s) => s.items)
  const [openId, setOpenId] = useState(null)
  const [openProgressId, setOpenProgressId] = useState(null)
  const [openProfile, setOpenProfile] = useState(false)
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [statusFilter, setStatusFilter] = useState('') // 進捗用ステータスフィルタ（統合検索）
  const breakpointCols = useMemo(() => ({ default: 3, 900: 2, 600: 1 }), [])

  // 公開リンク（?d=）からデータを読み込む
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const d = params.get('d')
      if (d) {
        const json = JSON.parse(decodeURIComponent(d))
        if (json && typeof json === 'object') {
          if (Array.isArray(json.projects)) {
            useProjectsStore.setState({ projects: json.projects, selectedId: json.projects[0]?.id || null })
          }
          if (json.profile && typeof json.profile === 'object') {
            useProfileStore.setState({ profile: { ...json.profile, updatedAt: json.profile.updatedAt || new Date().toISOString() } })
          }
          if (Array.isArray(json.progress)) {
            useProgressStore.setState({ items: json.progress, selectedId: json.progress[0]?.id || null })
          }
        }
      }
    } catch (_) {}
  }, [])

  // タグ一覧とフィルタ済み一覧をコンポーネント内で計算
  const uniqueTags = useMemo(() => {
    const allProjects = projects.flatMap(p => p.tags || [])
    const allProgress = progressItems.flatMap(p => p.tags || [])
    return Array.from(new Set([...allProjects, ...allProgress]))
  }, [projects, progressItems])

  const filtered = useMemo(() => {
    const q = query.trim().replace(/[＃#]/g, '').toLowerCase()
    return projects.filter(p => {
      const matchesQuery = q ? (
        (p.title || '').toLowerCase().includes(q) ||
        (p.descriptionShort || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      ) : true
      const matchesTag = activeTag ? (p.tags || []).includes(activeTag) : true
      return matchesQuery && matchesTag
    })
  }, [projects, query, activeTag])

  // 入力中のクエリに応じたサジェスト（タグ／タイトル）
  const suggestions = useMemo(() => {
    const q = query.trim().replace(/[＃#]/g, '').toLowerCase()
    if (!q) return []
    const tagMatches = uniqueTags
      .filter(t => t.toLowerCase().includes(q))
      .slice(0, 6)
      .map(t => ({ type: 'tag', value: t }))
    const titleMatches = [...projects, ...progressItems]
      .filter(p => (p.title || '').toLowerCase().includes(q))
      .slice(0, 6)
      .map(p => ({ type: 'title', value: p.title }))
    return [...tagMatches, ...titleMatches]
  }, [query, uniqueTags, projects, progressItems])

  useEffect(() => {
    document.body.classList.add('ready')
    return () => { document.body.classList.remove('ready') }
  }, [])

  return (
    <motion.div className="container" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
      <header className="header">
        <h1>ポートフォリオ</h1>
        <nav className="nav">
          <Link to="/">ポートフォリオ</Link>
          <Link to="/edit">{isAuthenticated ? '作品編集(ログイン中)' : '作品編集'}</Link>
          <Link to="/official">公式サイト</Link>
        </nav>
      </header>

      {/* 統合検索バー（ページ上部） */}
      <section className="section">
        <div className="filter-bar" style={{display:'flex',gap:8,alignItems:'flex-start',flexWrap:'wrap',margin:'8px 0 12px', position:'relative'}}>
          <input
            type="text"
            placeholder="検索（タイトル／タグ／説明）"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{flex:'1 1 280px',padding:'8px 10px',borderRadius:8,border:'1px solid var(--border)',background:'var(--card)',color:'var(--fg)'}}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{padding:'8px 10px',borderRadius:8,border:'1px solid var(--border)',background:'var(--card)',color:'var(--fg)'}}>
            <option value="">ステータス: すべて</option>
            <option value="todo">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="done">完了</option>
          </select>
          {query && suggestions.length > 0 && (
            <div className="suggest-box" role="listbox">
              {suggestions.map((s, i) => (
                <button
                  key={`${s.type}-${s.value}-${i}`}
                  className="suggest-item"
                  onClick={() => {
                    if (s.type === 'tag') { setActiveTag(s.value); setQuery('') }
                    else { setQuery(s.value) }
                  }}
                >
                  <span className="suggest-kind">{s.type === 'tag' ? 'タグ' : 'タイトル'}</span>
                  <span className="suggest-text">{s.type === 'tag' ? `#${s.value}` : s.value}</span>
                </button>
              ))}
            </div>
          )}
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {uniqueTags.map((t) => (
              <button
                key={t}
                className={`tag${activeTag === t ? ' active' : ''}`}
                onClick={() => setActiveTag(prev => prev === t ? '' : t)}
                style={{cursor:'pointer'}}
              >
                #{t}
              </button>
            ))}
            {(activeTag || query || statusFilter) && (
              <button className="button" onClick={() => { setActiveTag(''); setQuery(''); setStatusFilter('') }}>クリア</button>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <h2>プロフィール</h2>
          <div className="profile">
            <div className="profile-head">
              {profile.avatarUrl ? (
                <img className="avatar" src={profile.avatarUrl} alt="avatar" />
              ) : (
                <div className="avatar placeholder" />
              )}
              <div>
                <div className="title">{profile.displayName || '未設定'}</div>
                <p className="sub">{profile.bio || 'プロフィールが未設定です。'}</p>
                <p className="sub">最終更新: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '不明'}</p>
              </div>
            </div>
            <div className="socials">
              {(profile.socials || []).map((s, i) => (
                <a key={i} className={`social ${s.type}`} href={s.url || '#'} target="_blank" rel="noreferrer">
                  {s.type === 'x' ? 'X' : s.type === 'roblox' ? 'Roblox' : s.type}
                </a>
              ))}
            </div>
            <div style={{marginTop:8}}>
              <button className="button" onClick={() => setOpenProfile(true)}>もっと見る</button>
            </div>
          </div>
      </section>

      <section className="section">
        <h2>作品一覧</h2>
        <Masonry breakpointCols={breakpointCols} className="masonry-grid" columnClassName="masonry-grid_column">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="card"
              style={{ '--entry-delay': `${i * 60}ms` }}
            >
              <div className="thumb">
                {/* サムネイル > data:video > 埋め込み の優先順 */}
                {p.thumbnailUrl ? (
                  <img src={p.thumbnailUrl} alt="thumbnail" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}} />
                ) : isVideoDataUrl(p.mediaUrl) ? (
                  <video src={p.mediaUrl} controls style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}} />
                ) : getEmbed(p.mediaUrl) ? (
                  <iframe
                    src={getEmbed(p.mediaUrl)}
                    title="media"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  // 何も設定されていない場合はプレースホルダーのまま
                  null
                )}
              </div>
              <div className="meta">
                <div className="title">{p.title}</div>
                <div className="tags">
                  {(p.tags || []).map((t, i) => (<span key={i} className="tag">#{t}</span>))}
                </div>
                <div className="sub">{p.descriptionShort || '（説明なし）'}</div>
                <div className="sub">公開: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '不明'} ／ 更新: {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '不明'}</div>
                <div className="card-actions">
                  <button className="button" onClick={() => setOpenId(p.id)}>もっと見る</button>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      </section>

      <section className="section">
        <h2>進捗一覧</h2>
        <ProgressSummary onOpen={(id) => setOpenProgressId(id)} query={query} statusFilter={statusFilter} activeTag={activeTag} hideFilterBar={true} />
      </section>

      <AnimatePresence>
        {openId && (
          <ProjectModal project={projects.find(x => x.id === openId)} onClose={() => setOpenId(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openProgressId && (
          <ProgressModal item={progressItems.find(x => x.id === openProgressId)} onClose={() => setOpenProgressId(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openProfile && (
          <ProfileModal profile={profile} onClose={() => setOpenProfile(false)} />
        )}
      </AnimatePresence>

    </motion.div>
  )
}

// 追加: メディア埋め込みURLを生成（YouTube/Vimeo）
function getEmbed(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      if (!id) return null
      return `https://www.youtube.com/embed/${id}`
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '')
      return `https://www.youtube.com/embed/${id}`
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0]
      if (!id) return null
      return `https://player.vimeo.com/video/${id}`
    }
    return null
  } catch (_) {
    return null
  }
}

// 追加: data:video URL検出
function isVideoDataUrl(url) {
  return typeof url === 'string' && /^data:video\//i.test(url)
}