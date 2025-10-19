import React from 'react'
import useOfficialStore from '../../store/official.js'

export default function OfficialCustomForm() {
  const data = useOfficialStore((s) => s.data)
  const setCustomCSS = useOfficialStore((s) => s.setCustomCSS)
  const setCustomHTML = useOfficialStore((s) => s.setCustomHTML)
  const setCustomJS = useOfficialStore((s) => s.setCustomJS)

  return (
    <div className="editor-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <div className="panel" style={{gridColumn:'1 / span 2'}}>
        <div className="panel-header">
          <div className="title">カスタムHTML</div>
        </div>
        <textarea
          className="textarea"
          style={{minHeight:160, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'}}
          placeholder="例: <section class='hero'>...</section>"
          value={data.customHTML || ''}
          onChange={(e) => setCustomHTML(e.target.value)}
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="title">カスタムCSS</div>
        </div>
        <textarea
          className="textarea"
          style={{minHeight:200, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'}}
          placeholder="例: .hero { background: #123; }"
          value={data.customCSS || ''}
          onChange={(e) => setCustomCSS(e.target.value)}
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="title">カスタムJavaScript</div>
        </div>
        <textarea
          className="textarea"
          style={{minHeight:200, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'}}
          placeholder="例: console.log('official custom');"
          value={data.customJS || ''}
          onChange={(e) => setCustomJS(e.target.value)}
        />
        <p className="sub">注意: セキュリティのため、信頼できるコードのみを記述してください。</p>
      </div>
    </div>
  )
}