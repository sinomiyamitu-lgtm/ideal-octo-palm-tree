import React, { useRef, useState } from 'react'
import useSessionStore from '../../store/session.js'

export default function PresentationHotCorner() {
  const toggle = useSessionStore(s => s.togglePresentation)
  const [count, setCount] = useState(0)
  const timerRef = useRef(null)

  const onClick = () => {
    setCount(c => {
      const next = c + 1
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCount(0), 1200)
      if (next >= 10) {
        clearTimeout(timerRef.current)
        timerRef.current = null
        setCount(0)
        toggle()
      }
      return next
    })
  }

  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      style={{ position:'fixed', left:0, bottom:0, width:40, height:40, zIndex:9999, background:'transparent', cursor:'pointer' }}
    />
  )
}