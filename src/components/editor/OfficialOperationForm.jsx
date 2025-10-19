import React from 'react'
import useOfficialStore from '../../store/official.js'

export default function OfficialOperationForm() {
  const data = useOfficialStore((s) => s.data)
  const addSchedule = useOfficialStore((s) => s.addSchedule)
  const updateSchedule = useOfficialStore((s) => s.updateSchedule)
  const removeSchedule = useOfficialStore((s) => s.removeSchedule)
  const setPatch = useOfficialStore((s) => s.setPatch)

  return (
    <div className="editor-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <div className="panel">
        <div className="panel-header">
          <div className="title">運行予定</div>
          <button className="button" onClick={addSchedule}>追加</button>
        </div>
        <div className="list">
          {(data.operationInfo.schedule || []).map(sc => (
            <div key={sc.id} className="list-item">
              <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr 180px',gap:8}}>
                <input className="input" placeholder="タイトル" value={sc.title || ''}
                  onChange={(e) => updateSchedule(sc.id, { title: e.target.value })} />
                <input className="input" placeholder="時間帯" value={sc.timeRange || ''}
                  onChange={(e) => updateSchedule(sc.id, { timeRange: e.target.value })} />
              </div>
              <textarea className="textarea" placeholder="備考"
                value={sc.note || ''}
                onChange={(e) => updateSchedule(sc.id, { note: e.target.value })} />
              <div className="card-actions" style={{justifyContent:'flex-end'}}>
                <button className="button danger" onClick={() => removeSchedule(sc.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="title">SNS連携（公式X）</div>
        </div>
        <div className="form-group">
          <input className="input" placeholder="Xハンドル" value={data.operationInfo?.officialX?.handle || ''}
            onChange={(e) => setPatch('operationInfo', { officialX: { ...(data.operationInfo?.officialX || {}), handle: e.target.value } })} />
        </div>
        <div className="form-group">
          <input className="input" placeholder="埋め込みURL" value={data.operationInfo?.officialX?.embedUrl || ''}
            onChange={(e) => setPatch('operationInfo', { officialX: { ...(data.operationInfo?.officialX || {}), embedUrl: e.target.value } })} />
        </div>
      </div>
    </div>
  )
}