import { useState } from 'react'
import { ACTIVE_ALERT_COUNT } from '@/data/alerts'
import AlertPanel from './AlertPanel'

function IconBell() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

export default function AlertBell() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        title={`${ACTIVE_ALERT_COUNT} active alerts`}
        style={{
          position: 'relative',
          padding: '6px 7px',
          borderRadius: 7,
          border: open ? '1px solid #e2e8f0' : '1px solid transparent',
          background: open ? '#f1f5f9' : 'transparent',
          cursor: 'pointer',
          color: '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.12s',
        }}
      >
        <IconBell />
        {ACTIVE_ALERT_COUNT > 0 && (
          <span style={{
            position: 'absolute', top: 1, right: 1,
            minWidth: 15, height: 15,
            background: '#ef4444', color: 'white',
            borderRadius: 9999, border: '1.5px solid white',
            fontSize: 8, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}>
            {ACTIVE_ALERT_COUNT}
          </span>
        )}
      </button>

      <AlertPanel open={open} onClose={() => setOpen(false)} />
    </>
  )
}
