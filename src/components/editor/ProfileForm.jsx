import React from 'react'
import useProfileStore from '../../store/profile.js'

const SOCIAL_OPTIONS = [
  { value: 'x', label: 'X' },
  { value: 'roblox', label: 'Roblox' },
  { value: 'github', label: 'GitHub' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'link', label: 'Link' },
]

export default function ProfileForm() {
  const profile = useProfileStore(s => s.profile)
  const setName = useProfileStore(s => s.setName)
  const setBio = useProfileStore(s => s.setBio)
  const setAvatarUrl = useProfileStore(s => s.setAvatarUrl)
  const addSocial = useProfileStore(s => s.addSocial)
  const updateSocial = useProfileStore(s => s.updateSocial)
  const removeSocial = useProfileStore(s => s.removeSocial)

  return (
    <div className="editor-form">
      <h3>プロフィール編集</h3>
      <label>表示名</label>
      <input value={profile.displayName || ''} onChange={(e) => setName(e.target.value)} />

      <label>紹介文</label>
      <textarea rows={3} value={profile.bio || ''} onChange={(e) => setBio(e.target.value)} />

      <label>アバター</label>
      <input placeholder="画像URL" value={profile.avatarUrl || ''} onChange={(e) => setAvatarUrl(e.target.value)} />
      <div className="title-row" style={{display:'flex',gap:8,alignItems:'center',marginTop:6}}>
        <input type="file" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => setAvatarUrl(String(reader.result))
          reader.readAsDataURL(file)
        }} />
        <span className="muted" style={{fontSize:12}}>URLかファイルのどちらでも設定できます。</span>
      </div>

      <div className="form-group">
        <div className="title-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <label>ソーシャルリンク</label>
          <button className="button" onClick={addSocial}>追加</button>
        </div>
        {(profile.socials || []).map((s, i) => (
          <div key={i} className="social-row" style={{display:'grid',gridTemplateColumns:'140px 1fr 80px',gap:'8px',alignItems:'center',marginTop:'8px'}}>
            <select value={s.type} onChange={(e) => updateSocial(i, { type: e.target.value })}>
              {SOCIAL_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            <input placeholder="URL" value={s.url} onChange={(e) => updateSocial(i, { url: e.target.value })} />
            <button className="icon-btn danger" aria-label="削除" title="削除" onClick={() => removeSocial(i)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  )
}