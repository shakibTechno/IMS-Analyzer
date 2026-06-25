import { useEffect, useRef } from 'react'
import { ALERTS } from '@/data/alerts'
import AlertItem from './AlertItem'

interface Props {
  open:    boolean
  onClose: () => void
}

export default function AlertPanel({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const critical = ALERTS.filter(a => a.severity === 'critical').length

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.15)',
            zIndex: 2000,
          }}
        />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 380,
          background: 'white',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          zIndex: 2001,
          display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        role="dialog"
        aria-label="Active Alerts"
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid #e2e8f0',
          background: '#0f172a',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>
              Active Alerts
            </div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>
              {ALERTS.length} alerts · {critical} critical
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none',
              color: '#94a3b8', borderRadius: 6, width: 28, height: 28,
              cursor: 'pointer', fontSize: 16, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Summary bar */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
        }}>
          {[
            { label: 'Critical', count: ALERTS.filter(a => a.severity === 'critical').length, color: '#ef4444' },
            { label: 'Warning',  count: ALERTS.filter(a => a.severity === 'warning').length,  color: '#f59e0b' },
            { label: 'Info',     count: ALERTS.filter(a => a.severity === 'info').length,     color: '#3b82f6' },
          ].map(({ label, count, color }) => (
            <div key={label} style={{
              flex: 1, textAlign: 'center', padding: '8px 4px',
              borderRight: label !== 'Info' ? '1px solid #f1f5f9' : undefined,
            }}>
              <div style={{ color, fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{count}</div>
              <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Alert list */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {ALERTS.map(alert => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid #e2e8f0',
          flexShrink: 0,
          background: '#f8fafc',
        }}>
          <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
            Alerts auto-refresh every 15 minutes · Last checked just now
          </div>
        </div>
      </div>
    </>
  )
}
