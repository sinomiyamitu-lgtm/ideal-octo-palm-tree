import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ children, onClose }) {
  const backdropRef = useRef(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) onClose?.()
  }

  return createPortal(
    <div ref={backdropRef} className="modal-backdrop" onClick={handleBackdrop}>
      {children}
    </div>,
    document.body
  )
}