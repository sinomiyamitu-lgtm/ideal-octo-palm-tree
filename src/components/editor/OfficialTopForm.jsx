import React from 'react'
import useOfficialStore from '../../store/official.js'

export default function OfficialTopForm() {
  const data = useOfficialStore((s) => s.data)
  const setPatch = useOfficialStore((s) => s.setPatch)
  const addOperation = useOfficialStore((s) => s.addOperation)
  const updateOperation = useOfficialStore((s) => s.updateOperation)
  const removeOperation = useOfficialStore((s) => s.removeOperation)
  const addNews = useOfficialStore((s) => s.addNews)
  const updateNews = useOfficialStore((s) => s.updateNews)
  const removeNews = useOfficialStore((s) => s.removeNews)

  return (
    <div className="editor-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <div className="panel">
        <div className="panel-header">
          <div className="title">トップページ設定</div>
          <div className="sub">路線図埋め込みURL</div>
        </div>
        <div className="form-group">
          <input
            className="input"
            placeholder="https://... (地図/路線図の埋め込みURL)"
            value={data.top.routeMapEmbedUrl || ''}
            onChange={(e) => setPatch('top', { routeMapEmbedUrl: e.target.value })}
          />
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="title">運行情報（トップ表示）</div>
          <button className="button" onClick={addOperation}>追加</button>
        </div>
        <div className="list">
          {(data.top.operations || []).map(op => (
            <div key={op.id} className="list-item">
              <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <input className="input" placeholder="ステータス" value={op.status || ''}
                  onChange={(e) => updateOperation(op.id, { status: e.target.value })} />
                <input className="input" placeholder="更新日時 (ISO)" value={op.updatedAt || ''}
                  onChange={(e) => updateOperation(op.id, { updatedAt: e.target.value })} />
              </div>
              <textarea className="textarea" placeholder="メッセージ"
                value={op.message || ''}
                onChange={(e) => updateOperation(op.id, { message: e.target.value })} />
              <div className="card-actions" style={{justifyContent:'flex-end'}}>
                <button className="button danger" onClick={() => removeOperation(op.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{gridColumn:'1 / span 2'}}>
        <div className="panel-header">
          <div className="title">新着ニュース</div>
          <button className="button" onClick={addNews}>追加</button>
        </div>
        <div className="grid" style={{gridTemplateColumns:'repeat(2,1fr)'}}>
          {(data.top.news || []).map(n => (
            <div key={n.id} className="card">
              <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <input className="input" placeholder="タイトル" value={n.title || ''}
                  onChange={(e) => updateNews(n.id, { title: e.target.value })} />
                <input className="input" placeholder="カテゴリ" value={n.category || ''}
                  onChange={(e) => updateNews(n.id, { category: e.target.value })} />
              </div>
              <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <input className="input" placeholder="日付 (YYYY-MM-DD)" value={(n.date || '').slice(0,10)}
                  onChange={(e) => updateNews(n.id, { date: new Date(e.target.value).toISOString() })} />
                <input className="input" placeholder="リンク (任意)" value={n.link || ''}
                  onChange={(e) => updateNews(n.id, { link: e.target.value })} />
              </div>
              <textarea className="textarea" placeholder="本文"
                value={n.body || ''}
                onChange={(e) => updateNews(n.id, { body: e.target.value })} />
              <div className="card-actions" style={{justifyContent:'flex-end'}}>
                <button className="button danger" onClick={() => removeNews(n.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}