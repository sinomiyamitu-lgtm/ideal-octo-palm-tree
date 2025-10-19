import React from 'react'
import useProjectsStore from '../../store/projects.js'

export default function BlockPalette() {
  const addProject = useProjectsStore(s => s.addProject)

  return (
    <div className="editor-palette">
      <h3>ブロック追加</h3>
      <button className="button" onClick={addProject}>作品カードを追加</button>
    </div>
  )
}