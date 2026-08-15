import { useEffect } from 'react'
import { C, serif } from '../lib/theme'

export default function Modal({ open, title, sub, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,21,15,0.42)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 40,
      }}
    >
      <div
        style={{
          background: C.card,
          borderRadius: 16,
          width: '100%',
          maxWidth: 520,
          maxHeight: '86vh',
          overflow: 'auto',
          padding: 28,
          boxShadow: '0 24px 60px rgba(23,21,15,0.28)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <h2 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 25, lineHeight: 1.15 }}>
              {title}
            </h2>
            {sub ? <span style={{ fontSize: 12, color: C.muted }}>{sub}</span> : null}
          </div>
          <div
            className="x-del"
            role="button"
            tabIndex={0}
            aria-label="Close"
            onClick={onClose}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClose()}
            style={{ fontSize: 20, color: '#a89f8c' }}
          >
            ×
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
