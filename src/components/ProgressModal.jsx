import React from 'react'
import Modal from './Modal.jsx'
import { motion } from 'framer-motion'
import useProgressStore from '../store/progress.js'

export default function ProgressModal({ item, onClose }) {
  const update = useProgressStore(s => s.updateItem)


  if (!item) return null

  const handleClose = () => onClose?.()

  const pct = Math.max(0, Math.min(100, Number(item.percent || 0)))
  const barClass = pct < 30 ? 'red' : (pct < 70 ? 'yellow' : 'green')

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
          <h3>{item.title || '進捗詳細'}</h3>
          <button className="button" onClick={handleClose}>閉じる</button>
        </div>

        <div className="modal-content">
          <div className="modal-media">
            <div className="media-grid">
              <div className="media-block">
                <div className="sub tight">完成イメージ</div>
                {item.imageFinalUrl ? (
                  <img src={item.imageFinalUrl} alt="完成イメージ" />
                ) : (
                  <div className="thumb" />
                )}
              </div>
              <div className="media-block">
                <div className="sub tight">現在の進捗</div>
                {item.imageCurrentUrl ? (
                  <img src={item.imageCurrentUrl} alt="現在の進捗" />
                ) : (
                  <div className="thumb" />
                )}
              </div>
            </div>
          </div>

          <div className="modal-info">
            <div className="tags">
              {(item.tags || []).map((t, i) => (<span key={i} className="tag">#{t}</span>))}
            </div>
            <div className="sub" style={{marginTop:4}}>進捗: {pct}% ／ ステータス: {item.status === 'done' ? '完了' : item.status === 'in_progress' ? '進行中' : '未着手'} ／ 優先度: {item.priority === 'high' ? '高' : item.priority === 'low' ? '低' : '中'}</div>
            <div className="progress" style={{marginTop:6}}>
              <motion.div
                className={`bar ${barClass} ${item.status === 'in_progress' ? 'shimmer' : ''}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 160, damping: 24 }}
              />
              <div className="percent">{pct}%</div>
            </div>
            <p className="sub">{item.descriptionShort || '（説明なし）'}</p>
            <div className="full">{item.descriptionFull || '詳細説明がありません。'}</div>

            <div className="todo-list" style={{marginTop:12}}>
              <h4 style={{margin:'8px 0'}}>ToDo（閲覧のみ）</h4>
              <div className="todo-items" style={{display:'grid', gap:8}}>
                {(item.todos || []).length ? (
                  (item.todos || []).map((t) => (
                    <div key={t.id} className="todo-item">
                      <label style={{display:'flex', alignItems:'center', gap:8}}>
                        <input type="checkbox" checked={!!t.done} disabled />
                        <span className={`todo-title ${t.done ? 'done' : ''}`}>{t.title}</span>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="sub">まだToDoがありません。</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Modal>
  )
}