import React from 'react'
import useOfficialStore from '../../store/official.js'

export default function OfficialTourismForm() {
  const data = useOfficialStore((s) => s.data)
  const addSpot = useOfficialStore((s) => s.addSpot)
  const updateSpot = useOfficialStore((s) => s.updateSpot)
  const removeSpot = useOfficialStore((s) => s.removeSpot)
  const addEvent = useOfficialStore((s) => s.addEvent)
  const updateEvent = useOfficialStore((s) => s.updateEvent)
  const removeEvent = useOfficialStore((s) => s.removeEvent)
  const addGallery = useOfficialStore((s) => s.addGallery)
  const updateGallery = useOfficialStore((s) => s.updateGallery)
  const removeGallery = useOfficialStore((s) => s.removeGallery)

  return (
    <div className="editor-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <div className="panel">
        <div className="panel-header">
          <div className="title">観光スポット</div>
          <button className="button" onClick={addSpot}>追加</button>
        </div>
        <div className="grid" style={{gridTemplateColumns:'1fr'}}>
          {(data.tourism.spots || []).map(sp => (
            <div key={sp.id} className="card">
              <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <input className="input" placeholder="タイトル" value={sp.title || ''}
                  onChange={(e) => updateSpot(sp.id, { title: e.target.value })} />
                <input className="input" placeholder="最寄り駅" value={sp.nearStation || ''}
                  onChange={(e) => updateSpot(sp.id, { nearStation: e.target.value })} />
              </div>
              <input className="input" placeholder="写真URL" value={sp.photoUrl || ''}
                onChange={(e) => updateSpot(sp.id, { photoUrl: e.target.value })} />
              <textarea className="textarea" placeholder="説明"
                value={sp.description || ''}
                onChange={(e) => updateSpot(sp.id, { description: e.target.value })} />
              <div className="card-actions" style={{justifyContent:'flex-end'}}>
                <button className="button danger" onClick={() => removeSpot(sp.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="title">イベント</div>
          <button className="button" onClick={addEvent}>追加</button>
        </div>
        <div className="list">
          {(data.tourism.events || []).map(ev => (
            <div key={ev.id} className="list-item">
              <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 160px',gap:8}}>
                <input className="input" placeholder="タイトル" value={ev.title || ''}
                  onChange={(e) => updateEvent(ev.id, { title: e.target.value })} />
                <input className="input" placeholder="開催日 (YYYY-MM-DD)" value={(ev.date || '').slice(0,10)}
                  onChange={(e) => updateEvent(ev.id, { date: new Date(e.target.value).toISOString() })} />
              </div>
              <textarea className="textarea" placeholder="情報"
                value={ev.info || ''}
                onChange={(e) => updateEvent(ev.id, { info: e.target.value })} />
              <div className="card-actions" style={{justifyContent:'flex-end'}}>
                <button className="button danger" onClick={() => removeEvent(ev.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{gridColumn:'1 / span 2'}}>
        <div className="panel-header">
          <div className="title">写真ギャラリー</div>
          <button className="button" onClick={addGallery}>追加</button>
        </div>
        <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
          {(data.tourism.gallery || []).map(g => (
            <div key={g.id} className="card">
              <input className="input" placeholder="写真URL" value={g.photoUrl || ''}
                onChange={(e) => updateGallery(g.id, { photoUrl: e.target.value })} />
              <input className="input" placeholder="キャプション" value={g.caption || ''}
                onChange={(e) => updateGallery(g.id, { caption: e.target.value })} />
              <div className="card-actions" style={{justifyContent:'flex-end'}}>
                <button className="button danger" onClick={() => removeGallery(g.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}