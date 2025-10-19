import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useOfficialStore from '../store/official.js'

export default function Official() {
  const { data } = useOfficialStore()
  const [tab, setTab] = useState('top') // 'top' | 'routes' | 'operation' | 'tourism' | 'corporate'
const [openMore, setOpenMore] = useState({ top: false, routes: false, operation: false, tourism: false, corporate: false })

  useEffect(() => {
    document.body.classList.add('ready')
    return () => { document.body.classList.remove('ready') }
  }, [])

  // Inject custom CSS/HTML
  useEffect(() => {
    const styleId = 'official-custom-style'
    let styleEl = document.getElementById(styleId)
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = data.customCSS || ''
    return () => { /* keep style while navigating within app */ }
  }, [data.customCSS])

  // Inject custom JS
  useEffect(() => {
    const scriptId = 'official-custom-script'
    const prev = document.getElementById(scriptId)
    if (prev) prev.remove()
    if (data.customJS && data.customJS.trim()) {
      const scriptEl = document.createElement('script')
      scriptEl.id = scriptId
      scriptEl.textContent = data.customJS
      document.body.appendChild(scriptEl)
    }
    return () => { /* keep script across route tabs; it will be replaced on change */ }
  }, [data.customJS])

  const tabs = useMemo(() => ([
    { id: 'top', label: 'トップ' },
    { id: 'routes', label: '路線情報' },
    { id: 'operation', label: '運行情報' },
    { id: 'tourism', label: '観光・沿線' },
    { id: 'corporate', label: '企業情報' },
  ]), [])

const renderMore = (section) => {
  const m = data.more?.[section]
  if (!m || !m.enabled) return null
  const isOpen = !!openMore[section]
  return (
    <div className="more-panel section-card" style={{marginTop:18}}>
      <button className={`button${isOpen?' active':''}`} onClick={() => setOpenMore(s => ({ ...s, [section]: !s[section] }))}>
        {m.label || 'もっと見る'}
      </button>
      {isOpen && (
        <div className="more-content" style={{marginTop:12}}>
          {m.contentText && (<p className="sub" style={{whiteSpace:'pre-wrap'}}>{m.contentText}</p>)}
          {(m.media || []).length > 0 && (
            <div className="media-grid" style={{gap:12}}>
              {(m.media || []).map(item => (
                item.type === 'image' ? (
                  <img key={item.id} src={item.src} alt={item.title||''} style={{width:'100%',height:180,objectFit:'cover',borderRadius:8}} />
                ) : (
                  <video key={item.id} src={item.src} controls style={{width:'100%',height:220,borderRadius:8}} />
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

  return (
    <motion.div className="container" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
      <header className="header">
        <h1>公式サイト</h1>
        <nav className="nav">
          <Link to="/">ポートフォリオ</Link>
          <Link to="/edit">作品編集</Link>
          <Link to="/official">公式サイト</Link>
        </nav>
      </header>

      <section className="section">
        <div className="tabs" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {tabs.map(t => (
            <button key={t.id} className={`button${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </section>

      {tab === 'top' && (
        <section className="section">
          <h2>運行情報（リアルタイム）</h2>
          <div className="summary-list">
            {(data.top.operations || []).map((op) => (
              <div key={op.id} className="summary-item">
                <div className="title">{op.status}</div>
                <div>{op.message}</div>
                <div className="sub">更新: {op.updatedAt ? new Date(op.updatedAt).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>

          <h2 style={{marginTop:18}}>路線図</h2>
          {data.top.routeMapEmbedUrl ? (
            <div className="modal-media"><iframe src={data.top.routeMapEmbedUrl} title="路線図" /></div>
          ) : (
            <div className="profile"><p className="sub">路線図の埋め込みURLを設定してください。</p></div>
          )}

          <h2 style={{marginTop:18}}>新着ニュース</h2>
          <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
            {(data.top.news || []).map(n => (
              <div key={n.id} className="card">
                <div className="meta">
                  <div className="title">{n.title}</div>
                  <div className="sub">{n.category} ／ {n.date ? new Date(n.date).toLocaleDateString() : ''}</div>
                  <div className="sub">{n.body}</div>
                  {n.link && (<div className="card-actions"><a className="button" href={n.link} target="_blank" rel="noreferrer">詳しく</a></div>)}
                </div>
              </div>
            ))}
          </div>
        {renderMore('top')}
        </section>
      )}

      {tab === 'routes' && (
        <section className="section">
          <h2>路線情報</h2>
          {(data.routes || []).map((line) => (
            <div key={line.id} className="section-card">
              <div className="title" style={{color: line.color}}>{line.name}</div>
              {line.mapEmbedUrl && (<div className="modal-media" style={{marginTop:10}}><iframe src={line.mapEmbedUrl} title={`${line.name} 路線図`} /></div>)}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
                <div>
                  <div className="sub">駅リスト</div>
                  <ul className="list">
                    {(line.stations || []).map(st => (<li key={st.id}>{st.code ? `[${st.code}] `:''}{st.name}</li>))}
                  </ul>
                </div>
                <div>
                  <div className="sub">車両紹介</div>
                  <div className="grid" style={{gridTemplateColumns:'repeat(2,1fr)'}}>
                    {(line.rollingStock || []).map(rs => (
                      <div key={rs.id} className="card">
                        <div className="thumb" style={{height:120}}>
                          {rs.photoUrl ? (<img src={rs.photoUrl} alt={rs.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}}/>) : null}
                        </div>
                        <div className="meta">
                          <div className="title">{rs.name}</div>
                          <div className="sub">編成: {rs.formation || '不明'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        {renderMore('routes')}
        </section>
      )}

      {tab === 'operation' && (
        <section className="section">
          <h2>現在の運行予定</h2>
          <div className="summary-list">
            {(data.operationInfo.schedule || []).map(sc => (
              <div key={sc.id} className="summary-item">
                <div className="title">{sc.title}</div>
                <div>{sc.note}</div>
                <div className="sub">時間帯: {sc.timeRange}</div>
              </div>
            ))}
          </div>
          <h2 style={{marginTop:18}}>SNS連携（公式X）</h2>
          {data.operationInfo?.officialX?.embedUrl ? (
            <div className="modal-media"><iframe src={data.operationInfo.officialX.embedUrl} title="公式X" /></div>
          ) : (
            <div className="profile"><p className="sub">Xの埋め込みURLを設定してください。</p></div>
          )}
        {renderMore('operation')}
        </section>
      )}

      {tab === 'tourism' && (
        <section className="section">
          <h2>観光・沿線紹介</h2>
          <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
            {(data.tourism.spots || []).map(sp => (
              <div key={sp.id} className="card">
                <div className="thumb" style={{height:120}}>
                  {sp.photoUrl ? (<img src={sp.photoUrl} alt={sp.title} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}}/>) : null}
                </div>
                <div className="meta">
                  <div className="title">{sp.title}</div>
                  <div className="sub">最寄り: {sp.nearStation}</div>
                  <div className="sub">{sp.description}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{marginTop:18}}>イベント</h2>
          <div className="summary-list">
            {(data.tourism.events || []).map(ev => (
              <div key={ev.id} className="summary-item">
                <div className="title">{ev.title}</div>
                <div className="sub">開催日: {ev.date ? new Date(ev.date).toLocaleDateString() : ''}</div>
                <div>{ev.info}</div>
              </div>
            ))}
          </div>

          <h2 style={{marginTop:18}}>写真ギャラリー</h2>
          <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
            {(data.tourism.gallery || []).map(g => (
              <div key={g.id} className="card">
                <div className="thumb" style={{height:120}}>
                  {g.photoUrl ? (<img src={g.photoUrl} alt={g.caption} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}}/>) : null}
                </div>
                <div className="meta">
                  <div className="sub">{g.caption}</div>
                </div>
              </div>
            ))}
          </div>
        {renderMore('tourism')}
        </section>
      )}

      {tab === 'corporate' && (
        <section className="section">
          <h2>企業情報</h2>
          <div className="profile">
            <div className="title">{data.corporate.company?.name}</div>
            <div className="sub">{data.corporate.company?.overview}</div>
            <div className="sub">所在地: {data.corporate.company?.address}</div>
            {data.corporate.company?.website && (<a className="button" href={data.corporate.company.website} target="_blank" rel="noreferrer">Webサイト</a>)}
          </div>

          <h2 style={{marginTop:18}}>採用情報</h2>
          <div className="summary-list">
            {(data.corporate.careers || []).map(c => (
              <div key={c.id} className="summary-item">
                <div className="title">{c.title}</div>
                <div className="sub">勤務地: {c.location}</div>
                {c.link && (<div className="card-actions"><a className="button" href={c.link} target="_blank" rel="noreferrer">応募</a></div>)}
              </div>
            ))}
          </div>

          <h2 style={{marginTop:18}}>プレスリリース</h2>
          <div className="summary-list">
            {(data.corporate.press || []).map(p => (
              <div key={p.id} className="summary-item">
                <div className="title">{p.title}</div>
                <div className="sub">{p.date ? new Date(p.date).toLocaleDateString() : ''}</div>
                {p.link && (<div className="card-actions"><a className="button" href={p.link} target="_blank" rel="noreferrer">詳細</a></div>)}
              </div>
            ))}
          </div>

          <h2 style={{marginTop:18}}>CSR活動</h2>
          <ul className="list">
            {(data.corporate.csr || []).map(x => (<li key={x.id}><span className="title">{x.title}</span> — {x.description}</li>))}
          </ul>

          <h2 style={{marginTop:18}}>安全への取り組み</h2>
          <ul className="list">
            {(data.corporate.safety || []).map(x => (<li key={x.id}><span className="title">{x.title}</span> — {x.description}</li>))}
          </ul>
        {renderMore('corporate')}
        </section>
      )}

      {data.customHTML && (
        <section className="section">
          <div dangerouslySetInnerHTML={{ __html: data.customHTML }} />
        </section>
      )}
    </motion.div>
  )
}