import React from 'react'
import useOfficialStore from '../../store/official.js'

export default function OfficialCorporateForm() {
  const data = useOfficialStore((s) => s.data)
  const setPatch = useOfficialStore((s) => s.setPatch)
  const addCareer = useOfficialStore((s) => s.addCareer)
  const updateCareer = useOfficialStore((s) => s.updateCareer)
  const removeCareer = useOfficialStore((s) => s.removeCareer)
  const addPress = useOfficialStore((s) => s.addPress)
  const updatePress = useOfficialStore((s) => s.updatePress)
  const removePress = useOfficialStore((s) => s.removePress)
  const addCSR = useOfficialStore((s) => s.addCSR)
  const updateCSR = useOfficialStore((s) => s.updateCSR)
  const removeCSR = useOfficialStore((s) => s.removeCSR)
  const addSafety = useOfficialStore((s) => s.addSafety)
  const updateSafety = useOfficialStore((s) => s.updateSafety)
  const removeSafety = useOfficialStore((s) => s.removeSafety)

  return (
    <div className="editor-grid" style={{gridTemplateColumns:'1fr'}}>
      <div className="panel">
        <div className="panel-header">
          <div className="title">会社概要</div>
        </div>
        <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <input className="input" placeholder="会社名" value={data.corporate.company?.name || ''}
            onChange={(e) => setPatch('corporate', { company: { ...(data.corporate.company || {}), name: e.target.value } })} />
          <input className="input" placeholder="所在地" value={data.corporate.company?.address || ''}
            onChange={(e) => setPatch('corporate', { company: { ...(data.corporate.company || {}), address: e.target.value } })} />
        </div>
        <input className="input" placeholder="WebサイトURL" value={data.corporate.company?.website || ''}
          onChange={(e) => setPatch('corporate', { company: { ...(data.corporate.company || {}), website: e.target.value } })} />
        <textarea className="textarea" placeholder="会社概要"
          value={data.corporate.company?.overview || ''}
          onChange={(e) => setPatch('corporate', { company: { ...(data.corporate.company || {}), overview: e.target.value } })} />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="title">採用情報</div>
          <button className="button" onClick={addCareer}>追加</button>
        </div>
        <div className="list">
          {(data.corporate.careers || []).map(c => (
            <div key={c.id} className="list-item">
              <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <input className="input" placeholder="職種" value={c.title || ''}
                  onChange={(e) => updateCareer(c.id, { title: e.target.value })} />
                <input className="input" placeholder="勤務地" value={c.location || ''}
                  onChange={(e) => updateCareer(c.id, { location: e.target.value })} />
              </div>
              <input className="input" placeholder="応募リンク" value={c.link || ''}
                onChange={(e) => updateCareer(c.id, { link: e.target.value })} />
              <div className="card-actions" style={{justifyContent:'flex-end'}}>
                <button className="button danger" onClick={() => removeCareer(c.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="title">プレスリリース</div>
          <button className="button" onClick={addPress}>追加</button>
        </div>
        <div className="list">
          {(data.corporate.press || []).map(p => (
            <div key={p.id} className="list-item">
              <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 160px',gap:8}}>
                <input className="input" placeholder="タイトル" value={p.title || ''}
                  onChange={(e) => updatePress(p.id, { title: e.target.value })} />
                <input className="input" placeholder="日付 (YYYY-MM-DD)" value={(p.date || '').slice(0,10)}
                  onChange={(e) => updatePress(p.id, { date: new Date(e.target.value).toISOString() })} />
              </div>
              <input className="input" placeholder="リンク" value={p.link || ''}
                onChange={(e) => updatePress(p.id, { link: e.target.value })} />
              <div className="card-actions" style={{justifyContent:'flex-end'}}>
                <button className="button danger" onClick={() => removePress(p.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="title">CSR活動</div>
          <button className="button" onClick={addCSR}>追加</button>
        </div>
        <div className="list">
          {(data.corporate.csr || []).map(x => (
            <div key={x.id} className="list-item">
              <input className="input" placeholder="タイトル" value={x.title || ''}
                onChange={(e) => updateCSR(x.id, { title: e.target.value })} />
              <textarea className="textarea" placeholder="説明"
                value={x.description || ''}
                onChange={(e) => updateCSR(x.id, { description: e.target.value })} />
              <div className="card-actions" style={{justifyContent:'flex-end'}}>
                <button className="button danger" onClick={() => removeCSR(x.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="title">安全への取り組み</div>
          <button className="button" onClick={addSafety}>追加</button>
        </div>
        <div className="list">
          {(data.corporate.safety || []).map(x => (
            <div key={x.id} className="list-item">
              <input className="input" placeholder="タイトル" value={x.title || ''}
                onChange={(e) => updateSafety(x.id, { title: e.target.value })} />
              <textarea className="textarea" placeholder="説明"
                value={x.description || ''}
                onChange={(e) => updateSafety(x.id, { description: e.target.value })} />
              <div className="card-actions" style={{justifyContent:'flex-end'}}>
                <button className="button danger" onClick={() => removeSafety(x.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}