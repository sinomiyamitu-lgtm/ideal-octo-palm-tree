import React, { useMemo } from 'react'
import useProjectsStore from '../../store/projects.js'
import useProfileStore from '../../store/profile.js'
import useProgressStore from '../../store/progress.js'

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function embedUrl(url) {
  const u = String(url || '')
  if (!u) return ''
  // YouTube
  const ytIdMatch = u.match(/(?:youtu.be\/|v=)([A-Za-z0-9_-]{6,})/)
  if (ytIdMatch && ytIdMatch[1]) {
    return `https://www.youtube.com/embed/${ytIdMatch[1]}`
  }
  // Vimeo
  const vimeoMatch = u.match(/vimeo.com\/(\d+)/)
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }
  return ''
}

// 追加: 完全オフライン用にURLをデータURLへ変換
function isDataUrl(u) {
  return typeof u === 'string' && /^data:/i.test(u)
}

async function urlToDataUrl(u) {
  try {
    if (!u || isDataUrl(u)) return u || ''
    const res = await fetch(u)
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (_) {
    return ''
  }
}

// サイトの見た目を一致させるため、global.cssを埋め込む
const GLOBAL_CSS = `
:root { color-scheme: dark; --bg: #0b0d10; --fg: #e6e6e6; --muted: #a8b0b8; --accent: #66ccff; --accent2: #9a6cff; --card: #14181f; --border: #243040; --danger: #ff4d4f; }
:root[data-theme="light"] { color-scheme: light; --bg: #f4f6f8; --fg: #1f2a36; --muted: #52616d; --accent: #2a7cff; --accent2: #00b4d8; --card: #ffffff; --border: #d7dde3; --danger: #e63946; }
* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body { margin: 0; background: radial-gradient(1200px 800px at 10% 10%, #0e1218, var(--bg)); color: var(--fg); font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Hiragino Sans", "Yu Gothic", sans-serif; }
:root[data-theme="light"] body { background: radial-gradient(1200px 800px at 10% 10%, #f1f5f9, var(--bg)); }
.container { max-width: 1100px; margin: 0 auto; padding: 24px; }
.header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.nav { display: flex; gap: 12px; }
.nav a, .button { color: var(--fg); text-decoration: none; border: 1px solid var(--border); background: linear-gradient(180deg, #11151b, #0c1016); padding: 8px 12px; border-radius: 8px; }
:root[data-theme="light"] .nav a, :root[data-theme="light"] .button { background: linear-gradient(180deg, #ffffff, #f3f6f9); }
.button { cursor: pointer; transition: transform .15s ease, background-color .15s ease, border-color .15s ease, box-shadow .15s ease; }
.section { margin-top: 28px; }
.section h2 { margin: 0 0 12px; color: var(--accent); }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.card { display: grid; grid-template-rows: 160px auto; gap: 8px; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: linear-gradient(180deg, #10151c, var(--card)); transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.thumb { border-radius: 8px; background: radial-gradient(200px 120px at 40% 40%, #19202b, #0d1218); border: 1px solid var(--border); }
.title { font-weight: 600; }
.tags { display: flex; gap: 6px; margin: 4px 0; }
.tag { font-size: 12px; color: var(--muted); border: 1px dashed var(--border); padding: 4px 8px; border-radius: 999px; background: color-mix(in oklab, var(--card) 85%, transparent); }
.sub { font-size: 13px; color: var(--muted); }
.progress { position: relative; height: 14px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); background: #0d1117; }
.progress .bar { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); box-shadow: 0 0 12px color-mix(in oklab, var(--accent) 40%, transparent); }
.progress .percent { position: absolute; top: 50%; right: 8px; transform: translateY(-50%); font-size: 12px; color: var(--muted); }
.profile { display: grid; gap: 12px; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: linear-gradient(180deg, #10151c, var(--card)); }
.profile-head { display: flex; align-items: center; gap: 12px; }
.avatar { width: 64px; height: 64px; border-radius: 50%; border: 1px solid var(--border); object-fit: cover; }
.avatar.placeholder { background: radial-gradient(30px 20px at 40% 40%, #19202b, #0d1218); }
.socials { display: flex; flex-wrap: wrap; gap: 8px; }
.social { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border); background: #0b0f14; color: var(--fg); font-size: 13px; }
.attachments a { display:inline-block; margin:2px 6px 2px 0; padding:4px 8px; background:#0b0f14; border:1px solid var(--border); border-radius:6px; color:#9ad; text-decoration:none; font-size:12px }
.ready .grid .card { transform: none; opacity: 1; transition: opacity .55s ease, transform .55s cubic-bezier(0.22, 1, 0.36, 1); }
.card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 12px 32px rgba(0,0,0,.28); border-color: #2a3544; }
`;

// もっと見る用の追加CSS
const MORE_CSS = `
.full.collapsed { max-height: 0; overflow: hidden; }
.more-btn { margin-top: 8px; }
`;

async function preparePayloadOffline(payload) {
  const clone = JSON.parse(JSON.stringify(payload || {}))
  clone.profile = clone.profile || {}
  clone.profile.avatarUrl = await urlToDataUrl(clone.profile.avatarUrl)
  clone.projects = (clone.projects || []).map(async (p) => {
    const np = { ...p }
    np.thumbnailUrl = await urlToDataUrl(np.thumbnailUrl)
    np.mediaUrl = ''
    np.attachments = await Promise.all((np.attachments || []).map(async (a) => {
      const name = a.name || 'attachment'
      const dataUrl = a.dataUrl || await urlToDataUrl(a.url)
      return { ...a, name, dataUrl, url: '' }
    }))
    return np
  })
  clone.projects = await Promise.all(clone.projects)
  clone.progress = (clone.progress || []).map(async (it) => {
    const ni = { ...it }
    ni.imageFinalUrl = await urlToDataUrl(ni.imageFinalUrl)
    ni.imageCurrentUrl = await urlToDataUrl(ni.imageCurrentUrl)
    return ni
  })
  clone.progress = await Promise.all(clone.progress)
  return clone
}

// 完全オフライン版（外部埋め込み無効）
function buildViewerHtmlOffline(payload) {
  const { profile, projects, progress } = payload || {}
  const head = `
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(profile?.displayName || 'Portfolio Viewer')}</title>
  <style>${GLOBAL_CSS}\n${MORE_CSS}</style>
  `

  const profileHtml = `
    <div class="profile">
      <div class="profile-head">
        ${profile?.avatarUrl ? `<img class="avatar" src="${escapeHtml(profile.avatarUrl)}" alt="avatar" />` : '<div class="avatar placeholder"></div>'}
        <div>
          <div class="title">${escapeHtml(profile?.displayName || '（名前未設定）')}</div>
          <div class="sub">${escapeHtml(profile?.bio || '')}</div>
        </div>
      </div>
      <div class="socials">${(profile?.socials || []).map(s => `<span class="social">${escapeHtml(s.label || s.type || 'Link')}</span>`).join('')}</div>
    </div>
  `

  const projectsHtml = (projects || []).map(p => {
    const tags = (p.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')
    const media = p.thumbnailUrl ? `<img src="${escapeHtml(p.thumbnailUrl)}" alt="thumbnail" style="width:100%;height:100%;object-fit:cover;border-radius:8px" />` : '<div class="thumb"></div>'
    const atts = (p.attachments || []).map(a => (
      a.dataUrl ? `<a href="${escapeHtml(a.dataUrl)}" download="${escapeHtml(a.name || 'attachment')}">📎 ${escapeHtml(a.name || '添付')}</a>` : ''
    )).join('')
    const fullId = `full-${escapeHtml(p.id || Math.random().toString(36).slice(2))}`
    const moreBtn = (p.descriptionFull && String(p.descriptionFull).trim()) ? `<button class="button more-btn" data-target="${fullId}">もっと見る</button>` : ''
    return `
      <div class="card">
        <div class="thumb">${media}</div>
        <div class="meta">
          <div class="title">${escapeHtml(p.title || '無題')}</div>
          <div class="tags">${tags}</div>
          <div class="sub">${escapeHtml(p.descriptionShort || '')}</div>
          ${(p.descriptionFull && String(p.descriptionFull).trim()) ? `<div class="full collapsed" id="${fullId}">${escapeHtml(p.descriptionFull || '')}</div>` : ''}
          ${atts ? `<div class="attachments">${atts}</div>` : ''}
          ${moreBtn}
        </div>
      </div>
    `
  }).join('')

  const progressHtml = (progress || []).map(item => {
    const tags = (item.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')
    const pct = Math.max(0, Math.min(100, Number(item.percent || 0)))
    const statusLabel = item.status === 'done' ? '完了' : item.status === 'in_progress' ? '進行中' : '未着手'
    const fullId = `pfull-${escapeHtml(item.id || Math.random().toString(36).slice(2))}`
    const moreBtn = (item.descriptionFull && String(item.descriptionFull).trim()) ? `<button class="button more-btn" data-target="${fullId}">もっと見る</button>` : ''
    return `
      <div class="card">
        <div class="meta">
          <div class="title">${escapeHtml(item.title || '無題')}</div>
          <div class="tags">${tags}</div>
          <div class="sub">ステータス: ${statusLabel} ／ 期限: ${item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '未設定'}</div>
          <div class="sub">${escapeHtml(item.descriptionShort || '')}</div>
          ${(item.descriptionFull && String(item.descriptionFull).trim()) ? `<div class="full collapsed" id="${fullId}">${escapeHtml(item.descriptionFull || '')}</div>` : ''}
          <div class="progress"><div class="bar" style="width:${pct}%"></div><div class="percent">${pct}%</div></div>
          ${moreBtn}
        </div>
      </div>
    `
  }).join('')

  const body = `
    <div class="container">
      <div class="header">
        <h1 class="title">${escapeHtml(profile?.displayName || 'Portfolio')}</h1>
        <div class="nav"><span class="button">閲覧専用</span></div>
      </div>
      ${profileHtml}
      <div class="section">
        <h2>作品一覧</h2>
        <div class="grid">${projectsHtml}</div>
      </div>
      ${(progress && progress.length) ? `
      <div class="section">
        <h2>進捗一覧</h2>
        <div class="grid">${progressHtml}</div>
      </div>` : ''}
      <footer class="sub" style="margin-top:24px">このファイルは閲覧専用です（編集機能は含まれていません）。</footer>
    </div>
    <script>(function(){document.body.classList.add('ready');var bs=document.querySelectorAll('.more-btn');bs.forEach(function(b){var id=b.getAttribute('data-target');var el=document.getElementById(id);if(!el || !el.textContent.trim()){b.style.display='none';return;}var collapse=function(){el.classList.add('collapsed');b.textContent='もっと見る';};var expand=function(){el.classList.remove('collapsed');b.textContent='閉じる';};collapse();b.addEventListener('click',function(){if(el.classList.contains('collapsed')){expand();}else{collapse();}});});})();</script>
  `

  return `<!doctype html><html lang="ja"><head>${head}</head><body>${body}</body></html>`
}

export default function ExportPanel() {
  const projects = useProjectsStore(s => s.projects)
  const profile = useProfileStore(s => s.profile)
  const progress = useProgressStore(s => s.items)

  const payload = useMemo(() => ({ projects, profile, progress }), [projects, profile, progress])

  const download = (filename, mime, data) => {
    const blob = new Blob([data], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadJson = () => {
    try {
      const json = JSON.stringify(payload, null, 2)
      download('viewer-data.json', 'application/json', json)
    } catch (e) {
      alert('JSONの生成に失敗しました。')
    }
  }

  const downloadHtml = () => {
    try {
      const html = buildViewerHtml(payload)
      download('viewer.html', 'text/html', html)
    } catch (e) {
      alert('HTMLの生成に失敗しました。')
    }
  }

  const downloadOfflineHtml = async () => {
    try {
      const inlined = await preparePayloadOffline(payload)
      const html = buildViewerHtmlOffline(inlined)
      download('viewer-offline.html', 'text/html', html)
    } catch (e) {
      alert('完全オフラインHTMLの生成に失敗しました。（画像や添付の埋め込みに失敗した可能性があります）')
    }
  }

  return (
    <div className="editor-form">
      <h3>エクスポート（閲覧専用）</h3>
      <p className="muted">現在のプロフィール／作品／進捗のデータを含む、オフライン閲覧用の単一HTMLとJSONをダウンロードできます。</p>
      <div className="form-actions" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="button" onClick={downloadHtml}>viewer.html をダウンロード</button>
        <button className="button" onClick={downloadJson}>viewer-data.json をダウンロード</button>
        <button className="button" onClick={downloadOfflineHtml}>viewer-offline.html（完全オフライン）</button>
      </div>
      <p className="sub">出力されるHTMLは閲覧専用で、編集機能は含まれません。</p>
      <p className="sub">完全オフライン版では外部動画埋め込みを無効化し、画像・添付を可能な限りデータURLとして埋め込みます（CORSにより埋め込めない場合は省略されます）。</p>
    </div>
  )
}