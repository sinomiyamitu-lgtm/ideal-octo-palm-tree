import React from 'react'
import useOfficialStore from '../../store/official.js'

export default function OfficialRoutesForm() {
  const data = useOfficialStore((s) => s.data)
  const addRoute = useOfficialStore((s) => s.addRoute)
  const updateRoute = useOfficialStore((s) => s.updateRoute)
  const removeRoute = useOfficialStore((s) => s.removeRoute)
  const addStation = useOfficialStore((s) => s.addStation)
  const updateStation = useOfficialStore((s) => s.updateStation)
  const removeStation = useOfficialStore((s) => s.removeStation)
  const addRollingStock = useOfficialStore((s) => s.addRollingStock)
  const updateRollingStock = useOfficialStore((s) => s.updateRollingStock)
  const removeRollingStock = useOfficialStore((s) => s.removeRollingStock)

  return (
    <div className="editor-grid" style={{gridTemplateColumns:'1fr'}}>
      <div className="panel">
        <div className="panel-header">
          <div className="title">路線情報編集</div>
          <button className="button" onClick={addRoute}>路線を追加</button>
        </div>
        {(data.routes || []).map((line) => (
          <div key={line.id} className="section-card" style={{marginTop:12}}>
            <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 120px 1fr',gap:8}}>
              <input className="input" placeholder="路線名" value={line.name || ''}
                onChange={(e) => updateRoute(line.id, { name: e.target.value })} />
              <input className="input" placeholder="#カラー" value={line.color || ''}
                onChange={(e) => updateRoute(line.id, { color: e.target.value })} />
              <input className="input" placeholder="路線図埋め込みURL" value={line.mapEmbedUrl || ''}
                onChange={(e) => updateRoute(line.id, { mapEmbedUrl: e.target.value })} />
            </div>
            <div className="card-actions" style={{justifyContent:'flex-end'}}>
              <button className="button danger" onClick={() => removeRoute(line.id)}>路線を削除</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
              <div className="panel">
                <div className="panel-header">
                  <div className="title">駅リスト</div>
                  <button className="button" onClick={() => addStation(line.id)}>駅を追加</button>
                </div>
                <div className="list">
                  {(line.stations || []).map(st => (
                    <div key={st.id} className="list-item">
                      <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 140px',gap:8}}>
                        <input className="input" placeholder="駅名" value={st.name || ''}
                          onChange={(e) => updateStation(line.id, st.id, { name: e.target.value })} />
                        <input className="input" placeholder="駅コード" value={st.code || ''}
                          onChange={(e) => updateStation(line.id, st.id, { code: e.target.value })} />
                      </div>
                      <div className="card-actions" style={{justifyContent:'flex-end'}}>
                        <button className="button danger" onClick={() => removeStation(line.id, st.id)}>削除</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel">
                <div className="panel-header">
                  <div className="title">車両紹介</div>
                  <button className="button" onClick={() => addRollingStock(line.id)}>車両を追加</button>
                </div>
                <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
                  {(line.rollingStock || []).map(rs => (
                    <div key={rs.id} className="card">
                      <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                        <input className="input" placeholder="車両名" value={rs.name || ''}
                          onChange={(e) => updateRollingStock(line.id, rs.id, { name: e.target.value })} />
                        <input className="input" placeholder="編成" value={rs.formation || ''}
                          onChange={(e) => updateRollingStock(line.id, rs.id, { formation: e.target.value })} />
                      </div>
                      <input className="input" placeholder="写真URL" value={rs.photoUrl || ''}
                        onChange={(e) => updateRollingStock(line.id, rs.id, { photoUrl: e.target.value })} />
                      <div className="card-actions" style={{justifyContent:'flex-end'}}>
                        <button className="button danger" onClick={() => removeRollingStock(line.id, rs.id)}>削除</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}