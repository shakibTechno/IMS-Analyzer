import { useState, useEffect, type ReactNode } from 'react'
import AlertBell from '@/components/alerts/AlertBell'
import { useFilterStore } from '@/store/filterStore'
import { useSiteStore }   from '@/store/siteStore'
import { useThemeStore }  from '@/store/themeStore'
import btrcLogo from '@/assets/Logo/btrcLogo.png'

// ─── Live clock ───────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ color: 'var(--text-muted)', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
      {time.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      })} UTC+6
    </span>
  )
}

// ─── Synced-ago counter ───────────────────────────────────────────
function SyncedAgo() {
  const tickCount = useSiteStore(s => s.tickCount)
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => { setElapsed(0) }, [tickCount])
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ fontSize: 8, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
      synced {elapsed}s ago
    </span>
  )
}

// ─── Active filter pill ───────────────────────────────────────────
function ActiveFilterBadge() {
  const hasActive    = useFilterStore(s => s.hasActiveFilters())
  const resetFilters = useFilterStore(s => s.resetFilters)
  const isDark       = useThemeStore(s => s.theme === 'dark')
  if (!hasActive) return null
  return (
    <button
      onClick={resetFilters}
      title="Clear all filters"
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 20,
        background: isDark ? 'rgba(59,130,246,0.12)' : '#eff6ff',
        color:      isDark ? '#93c5fd' : '#1d4ed8',
        border:     isDark ? '1px solid rgba(59,130,246,0.25)' : '1px solid #bfdbfe',
        fontSize: 11, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      <span>Filters active</span>
      <span style={{ fontSize: 13, lineHeight: 1 }}>×</span>
    </button>
  )
}

// ─── Sun icon (shown in dark mode → click to go light) ───────────
function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

// ─── Moon icon (shown in light mode → click to go dark) ──────────
function IconMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

// ─── Theme toggle button ──────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggle } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 8,
        background:  isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
        border:      isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        color:       isDark ? '#7dd3fc' : '#475569',
        cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = isDark ? 'rgba(125,211,252,0.12)' : '#e2e8f0'
        e.currentTarget.style.color      = isDark ? '#38bdf8' : '#1e293b'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'
        e.currentTarget.style.color      = isDark ? '#7dd3fc' : '#475569'
      }}
    >
      {isDark ? <IconSun /> : <IconMoon />}
    </button>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────
interface Props {
  title: string
  extra?: ReactNode
}

export default function TopBar({ title, extra }: Props) {
  const isDark = useThemeStore(s => s.theme === 'dark')

  return (
    <header style={{
      height: 35, minHeight: 35,
      background:   'var(--topbar-bg)',
      borderBottom: '1px solid var(--topbar-border)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 10px',
      flexShrink: 0,
      gap: 8,
    }}>

      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
        <img src={btrcLogo} alt="BTRC" style={{ height: 24, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
        <div style={{ width: 1, height: 14, background: 'var(--topbar-divider)', flexShrink: 0 }} />
        <h1 style={{ margin: 0, fontSize: 10, fontWeight: 600, color: 'var(--topbar-title)', whiteSpace: 'nowrap' }}>
          {title}
        </h1>

        {/* LIVE pulse */}
        <span style={{
          display: 'flex', alignItems: 'center', gap: 3,
          fontSize: 8, fontWeight: 700, padding: '1px 4px',
          borderRadius: 9999, letterSpacing: '0.05em', flexShrink: 0,
          background: isDark ? 'rgba(22,163,74,0.12)' : '#f0fdf4',
          color:      isDark ? '#4ade80' : '#16a34a',
          border:     isDark ? '1px solid rgba(22,163,74,0.25)' : '1px solid #bbf7d0',
        }}>
          <span style={{
            width: 4, height: 4, borderRadius: '50%',
            background: isDark ? '#4ade80' : '#16a34a',
            animation: 'livePulse 2s infinite',
          }} />
          LIVE
        </span>

        <SyncedAgo />
        <ActiveFilterBadge />

        {extra && (
          <>
            <div style={{ width: 1, height: 14, background: 'var(--topbar-divider)', flexShrink: 0 }} />
            {extra}
          </>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <LiveClock />
        <div style={{ width: 1, height: 14, background: 'var(--topbar-divider)' }} />
        <ThemeToggle />
        <div style={{ width: 1, height: 14, background: 'var(--topbar-divider)' }} />
        <AlertBell />
      </div>

      <style>{`
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); }
          70%  { box-shadow: 0 0 0 6px rgba(22,163,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
        }
      `}</style>
    </header>
  )
}
