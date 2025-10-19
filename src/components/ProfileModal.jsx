import React from 'react'
import Modal from './Modal.jsx'
import { motion } from 'framer-motion'

export default function ProfileModal({ profile, onClose }) {
  if (!profile) return null

  const handleClose = () => onClose?.()

  return (
    <Modal onClose={handleClose}>
      <motion.div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 160, damping: 20 }}
      >
        <div className="modal-header">
          <h3>{profile.displayName || 'プロフィール'}</h3>
          <button className="button" onClick={handleClose}>閉じる</button>
        </div>

        <div className="modal-content">
          <div className="modal-media">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" />
            ) : (
              <div className="thumb" />
            )}
          </div>

          <div className="modal-info">
            <p className="sub">{profile.bio || 'プロフィールが未設定です。'}</p>
            <div className="sub">最終更新: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '不明'}</div>

            <div className="socials" style={{marginTop:8}}>
              {(profile.socials || []).map((s, i) => (
                <a key={i} className={`social ${s.type || 'link'}`} href={s.url || '#'} target="_blank" rel="noreferrer">
                  {s.label || (s.type === 'x' ? 'X' : s.type === 'roblox' ? 'Roblox' : (s.type || 'Link'))}
                </a>
              ))}
            </div>

            <div style={{marginTop:12}}>
              <h4 style={{margin:'8px 0'}}>スキル</h4>
              {(profile.skills || []).length ? (
                (profile.skills || []).map((sk, i) => (
                  <div key={i} className="sub">・{sk.name || ''}（{sk.category || ''}／Lv.{sk.level || ''}）</div>
                ))
              ) : (
                <div className="sub">スキルが未設定です。</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Modal>
  )
}