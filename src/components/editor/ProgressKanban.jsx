import React from 'react'
import useProgressStore from '../../store/progress.js'
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, useDroppable } from '@dnd-kit/core'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function ColumnDroppable({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="kanban-column" style={{ outline: isOver ? '2px dashed var(--accent)' : 'none' }}>
      {children}
    </div>
  )
}

function Card({ item }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
  const select = useProgressStore(s => s.select)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'opacity .35s ease, transform .35s ease',
  }
  const pct = Math.max(0, Math.min(100, Number(item.percent || 0)))
  const barClass = pct < 30 ? 'red' : (pct < 70 ? 'yellow' : 'green')
  return (
    <div ref={setNodeRef} style={style} className="editor-card" onClick={() => select(item.id)}>
      <div className="thumb small" {...attributes} {...listeners} />
      <div className="meta">
        <div className="title">{item.title}</div>
        <div className="sub">{item.descriptionShort || '（説明なし）'}</div>
        <div className="progress" style={{marginTop:6}}>
          <div className={`bar ${barClass}`} style={{width:`${pct}%`}} />
          <div className="percent">{pct}%</div>
        </div>
      </div>
    </div>
  )
}

export default function ProgressKanban() {
  const items = useProgressStore(s => s.items)
  const updateItem = useProgressStore(s => s.updateItem)
  const reorder = useProgressStore(s => s.reorder)

  const sensors = useSensors(useSensor(PointerSensor))

  const groups = {
    todo: items.filter(p => (p.status || 'todo') === 'todo').sort((a,b) => a.order - b.order),
    in_progress: items.filter(p => p.status === 'in_progress').sort((a,b) => a.order - b.order),
    done: items.filter(p => p.status === 'done').sort((a,b) => a.order - b.order),
  }

  const onDragEnd = ({ active, over }) => {
    if (!over) return
    const activeId = active.id
    const overId = over.id
    let destStatus = null
    if (overId === 'todo' || overId === 'in_progress' || overId === 'done') {
      destStatus = overId
    } else {
      // over is an item: find which group contains it
      if (groups.todo.some(x => x.id === overId)) destStatus = 'todo'
      else if (groups.in_progress.some(x => x.id === overId)) destStatus = 'in_progress'
      else if (groups.done.some(x => x.id === overId)) destStatus = 'done'
    }
    if (!destStatus) return

    // ステータス変更: 対象カードのステータスを更新し、移動先の末尾へ
    const target = items.find(p => p.id === activeId)
    if (!target) return
    const destCount = items.filter(p => (p.status || 'todo') === destStatus).length
    updateItem(activeId, { status: destStatus, order: destCount })

    // 既存の order を整える
    const nextOrderIds = items
      .sort((a,b) => a.order - b.order)
      .map(p => p.id)
    reorder(nextOrderIds)
  }

  return (
    <div className="kanban">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <ColumnDroppable id="todo">
          <div className="kanban-head">未着手</div>
          <SortableContext items={groups.todo.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {groups.todo.map(p => (<Card key={p.id} item={p} />))}
          </SortableContext>
        </ColumnDroppable>
        <ColumnDroppable id="in_progress">
          <div className="kanban-head">進行中</div>
          <SortableContext items={groups.in_progress.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {groups.in_progress.map(p => (<Card key={p.id} item={p} />))}
          </SortableContext>
        </ColumnDroppable>
        <ColumnDroppable id="done">
          <div className="kanban-head">完了</div>
          <SortableContext items={groups.done.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {groups.done.map(p => (<Card key={p.id} item={p} />))}
          </SortableContext>
        </ColumnDroppable>
      </DndContext>
    </div>
  )
}