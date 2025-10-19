import React from 'react'
import Modal from './Modal.jsx'
import { motion } from 'framer-motion'

function getEmbed(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      if (!id) return null
      return `https://www.youtube.com/embed/${id}`
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '')
      return `https://www.youtube.com/embed/${id}`
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0]
      if (!id) return null
      return `https://player.vimeo.com/video/${id}`
    }
    return null
  } catch (_) {
    return null
  }
}

// data:video URL検出
function isVideoDataUrl(url) {
  return typeof url === 'string' && /^data:video\//i.test(url)
}

export default function ProjectModal({ project, onClose }) {
  const handleClose = () => onClose?.()

  const embed = getEmbed(project?.mediaUrl)

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
          <h3>{project?.title || '無題の作品'}</h3>
          <button className="button" onClick={handleClose}>閉じる</button>
        </div>

        <div className="modal-content">
          <div className="modal-media">
            {embed ? (
              <iframe
                src={embed}
                title="media"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : isVideoDataUrl(project?.mediaUrl) ? (
              <video src={project.mediaUrl} controls style={{width:'100%',height:'100%',objectFit:'cover'}} />
            ) : project?.thumbnailUrl ? (
              <img src={project.thumbnailUrl} alt="thumbnail" />
            ) : (
              <div className="thumb" />
            )}
          </div>

          <div className="modal-info">
            <div className="tags">
              {(project?.tags || []).map((t, i) => (<span key={i} className="tag">#{t}</span>))}
            </div>
            <div className="sub" style={{marginTop:4}}>
              公開: {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : '不明'} ／ 更新: {project?.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : '不明'}
            </div>
            <p className="sub">{project?.descriptionShort || '（説明なし）'}</p>
            <div className="full">{project?.descriptionFull || '詳細説明がありません。'}</div>

            {(project?.attachments && project.attachments.length > 0) && (
              <div className="attachments" style={{marginTop:12}}>
                <h4 style={{margin:'8px 0'}}>添付ファイル</h4>
                <div className="attachments-list" style={{display:'grid',gap:6}}>
                  {project.attachments.map((a) => (
                    <a key={a.id} className="button" href={a.dataUrl} download={a.name} title={`${a.name} (${a.mime})`}>
                      📎 {a.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Modal>
  )
}