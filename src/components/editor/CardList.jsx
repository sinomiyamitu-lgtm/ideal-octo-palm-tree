import React from 'react'
import useProjectsStore from '../../store/projects.js'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 追加: data:video URL検出
function isVideoDataUrl(url) {
  return typeof url === 'string' && /^data:video\//i.test(url)
}

function Item({ project, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id })
  const select = useProjectsStore(s => s.select)
  const removeProject = useProjectsStore(s => s.removeProject)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.8 : 1,
    '--entry-delay': `${index * 40}ms`,
  }
  return (
    <div ref={setNodeRef} style={style} className="editor-card" onClick={() => select(project.id)}>
      <div className="actions" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" aria-label="編集" title="編集" onClick={() => select(project.id)}>✏️</button>
        <button className="icon-btn danger" aria-label="削除" title="削除" onClick={() => removeProject(project.id)}>🗑️</button>
      </div>
      <div className="thumb small" {...attributes} {...listeners}>
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt="thumbnail" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}} />
        ) : isVideoDataUrl(project.mediaUrl) ? (
          <video src={project.mediaUrl} controls style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}} />
        ) : null}
      </div>
      <div className="meta">
        <div className="title">{project.title}</div>
        <div className="tags">
          {(project.tags || []).map((t, i) => (<span key={i} className="tag">#{t}</span>))}
        </div>
        <div className="sub">{project.descriptionShort || '（説明なし）'}</div>
      </div>
    </div>
  )
}

export default function CardList() {
  const projects = useProjectsStore(s => s.projects)
  const reorder = useProjectsStore(s => s.reorder)

  const sensors = useSensors(useSensor(PointerSensor))

  const ids = projects.map(p => p.id)

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(active.id)
    const newIndex = ids.indexOf(over.id)
    const moved = arrayMove(projects, oldIndex, newIndex)
    reorder(moved.map(p => p.id))
  }

  return (
    <div className="editor-list">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {projects.map((p, i) => (<Item key={p.id} project={p} index={i} />))}
        </SortableContext>
      </DndContext>
    </div>
  )
}