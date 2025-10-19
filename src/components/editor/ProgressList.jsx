import React, { useMemo, useState } from 'react'
import useProgressStore from '../../store/progress.js'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'

function Item({ item, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const select = useProgressStore(s => s.select)
  const removeItem = useProgressStore(s => s.removeItem)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.8 : 1,
    '--entry-delay': `${index * 40}ms`,
  }
  const pct = Math.max(0, Math.min(100, Number(item.percent || 0)))
  const barClass = pct < 30 ? 'red' : (pct < 70 ? 'yellow' : 'green')
  const dueLabel = useMemo(() => {
    if (!item.dueDate || item.status === 'done') return ''
    try {
      const now = Date.now()
      const due = new Date(item.dueDate).getTime()
      const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
      if (days < 0) return '期限超過'
      if (days <= 3) return `期限接近(${days}日)`
      return ''
    } catch (_) { return '' }
  }, [item.dueDate, item.status])
  return (
    <div ref={setNodeRef} style={{...style, borderColor: (dueLabel ? '#6b2a2a' : undefined)}} className="editor-card" onClick={() => select(item.id)}>
      <div className="actions" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" aria-label="編集" title="編集" onClick={() => select(item.id)}>✏️</button>
        <button className="icon-btn danger" aria-label="削除" title="削除" onClick={() => removeItem(item.id)}>🗑️</button>
      </div>
      <div className="thumb small" {...attributes} {...listeners} />
      <div className="meta">
        <div className="title">{item.title}</div>
        <div className="tags">
          {(item.tags || []).map((t, i) => (<span key={i} className="tag">#{t}</span>))}
        </div>
        <div className="sub" style={{marginTop:4}}>ステータス: {item.status === 'done' ? '完了' : item.status === 'in_progress' ? '進行中' : '未着手'} ／ 優先度: {item.priority === 'high' ? '高' : item.priority === 'low' ? '低' : '中'} ／ 期限: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '未設定'}</div>
        {dueLabel && (<div className="sub" style={{color:'#ff6666'}}>⚠️ {dueLabel}</div>)}
        <div className="sub">{item.descriptionShort || '（説明なし）'}</div>
        <div className="sub" style={{marginTop:6}}>進捗: {pct}%</div>
        <div className="progress" style={{marginTop:6}}>
          <motion.div
            className={`bar ${barClass} ${item.status === 'in_progress' ? 'shimmer' : ''}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 160, damping: 24 }}
          />
          <div className="percent">{pct}%</div>
        </div>
      </div>
    </div>
  )
}

export default function ProgressList() {
  const items = useProgressStore(s => s.items)
  const reorder = useProgressStore(s => s.reorder)
  const sensors = useSensors(useSensor(PointerSensor))
  const [statusFilter, setStatusFilter] = useState('')
  const filtered = useMemo(() => statusFilter ? items.filter(p => p.status === statusFilter) : items, [items, statusFilter])

  const ids = filtered.map(p => p.id)

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(active.id)
    const newIndex = ids.indexOf(over.id)
    const moved = arrayMove(filtered, oldIndex, newIndex)
    // 反映: フィルタ対象の順序のみを更新し、それ以外はそのまま
    const idOrder = [
      ...items
        .filter(p => !filtered.some(f => f.id === p.id))
        .sort((a,b) => a.order - b.order)
        .map(p => p.id),
      ...moved.map(p => p.id)
    ]
    reorder(idOrder)
  }

  return (
    <div className="editor-list">
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
        <label className="sub" style={{fontSize:12}}>フィルタ: ステータス</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">すべて</option>
          <option value="todo">未着手</option>
          <option value="in_progress">進行中</option>
          <option value="done">完了</option>
        </select>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {filtered.map((p, i) => (<Item key={p.id} item={p} index={i} />))}
        </SortableContext>
      </DndContext>
    </div>
  )
}