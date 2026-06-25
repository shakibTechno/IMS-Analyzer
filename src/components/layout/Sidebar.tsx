import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import btrcLogo from '@/assets/Logo/btrcLogo.png'

interface NavItem {
  to:     string
  label:  string
  icon:   React.ReactNode
  end?:   boolean
  badge?: React.ReactNode
}

// ─── Icons ────────────────────────────────────────────────────────
const I = ({ d, d2, fill }: { d: string; d2?: string; fill?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'}
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />{d2 && <path d={d2} />}
  </svg>
)

function IconHome()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function IconMap()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg> }
function IconBuilding() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> }
function IconList()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function IconReport()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> }
function IconDisaster() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
function IconISP()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M7.76 16.24a6 6 0 0 1 0-8.49"/><path d="M20.07 4.93a10 10 0 0 1 0 14.14"/><path d="M3.93 19.07a10 10 0 0 1 0-14.14"/></svg> }
function IconLogout()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
void I

// ─── User menu ────────────────────────────────────────────────────
function UserMenu({ collapsed }: { collapsed: boolean }) {
  const user   = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const isDark = useThemeStore(s => s.theme === 'dark')
  const [open, setOpen] = useState(false)

  if (!user) return null

  const roleColor: Record<string, string> = { admin: '#818cf8', viewer: '#38bdf8', operator: '#34d399' }
  const color = roleColor[user.role] ?? '#64748b'

  const hoverBg      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  const hoverBorder  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const activeBg     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'
  const nameColor    = isDark ? '#e2e8f0' : '#1e293b'
  const dropdownBg   = isDark ? 'linear-gradient(135deg, #1a2744 0%, #141e35 100%)' : '#ffffff'
  const dropdownBdr  = isDark ? 'rgba(99,179,237,0.15)' : '#e2e8f0'
  const dropdownShad = isDark ? '0 -12px 40px rgba(0,0,0,0.5)' : '0 -8px 24px rgba(0,0,0,0.12)'
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'
  const borderTop    = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0'

  return (
    <div style={{
      padding: collapsed ? '10px 6px' : '10px 12px',
      borderTop: borderTop,
      flexShrink: 0, position: 'relative',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        title={collapsed ? user.displayName : undefined}
        style={{
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: '100%', padding: collapsed ? '6px' : '8px 10px',
          borderRadius: 10, cursor: 'pointer',
          background: open ? activeBg : 'transparent',
          border: '1px solid transparent',
          outline: 'none', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.borderColor = hoverBorder }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? activeBg : 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${color}cc, ${color}66)`,
          border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 11, fontWeight: 800, letterSpacing: '0.03em',
        }}>
          {user.initials}
        </div>
        {!collapsed && (
          <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: nameColor, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.displayName}
            </div>
            <div style={{
              display: 'inline-block', marginTop: 3, fontSize: 9, fontWeight: 700,
              color, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {user.role}
            </div>
          </div>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 8px)',
            left: collapsed ? -8 : 12, right: collapsed ? -8 : 12,
            background: dropdownBg,
            borderRadius: 12, border: `1px solid ${dropdownBdr}`,
            boxShadow: dropdownShad,
            zIndex: 100, overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${dividerColor}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: nameColor }}>{user.displayName}</div>
              <div style={{
                display: 'inline-block', marginTop: 4, padding: '2px 8px',
                borderRadius: 20, background: color + '22', color,
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {user.role}
              </div>
            </div>
            <button
              onClick={() => { setOpen(false); logout() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '10px 14px', border: 'none', background: 'none',
                cursor: 'pointer', fontSize: 12, color: '#f87171', fontWeight: 600,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <IconLogout /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true)
  const isDark = useThemeStore(s => s.theme === 'dark')

  // Theme-derived constants (avoids inline ternary clutter)
  const sidebarBg      = isDark ? 'linear-gradient(180deg, #080d1a 0%, #0b1221 50%, #0a1020 100%)' : '#ffffff'
  const sidebarBorder  = isDark ? 'rgba(56,189,248,0.07)' : '#e2e8f0'
  const brandBorder    = isDark ? 'rgba(255,255,255,0.04)' : '#e8edf2'
  const titleColor     = isDark ? '#f0f6ff' : '#1e293b'
  const subtitleColor  = isDark ? '#2d4a6e' : '#94a3b8'
  const navLabelColor  = isDark ? '#1e3352' : '#94a3b8'
  const navInactive    = isDark ? '#8db8d8' : '#64748b'
  const navActive      = isDark ? '#e0f0ff' : '#1d4ed8'
  const navActiveBg    = isDark
    ? 'linear-gradient(90deg, rgba(0,90,160,0.5) 0%, rgba(0,90,160,0.1) 100%)'
    : 'linear-gradient(90deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.04) 100%)'
  const navHoverBg     = isDark ? 'rgba(56,189,248,0.07)' : 'rgba(59,130,246,0.06)'
  const navHoverColor  = isDark ? '#c4e0f8' : '#1e40af'
  const btnBg          = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const btnBorder      = isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'
  const btnColor       = isDark ? '#334155' : '#64748b'
  const expandBg       = isDark ? 'rgba(56,189,248,0.05)' : 'rgba(59,130,246,0.04)'
  const expandBorder   = isDark ? 'rgba(56,189,248,0.1)' : '#e2e8f0'
  const expandColor    = isDark ? '#1e3352' : '#64748b'

  const NAV_ITEMS: NavItem[] = [
    { to: '/',          label: 'Home',               icon: <IconHome />,     end: true  },
    { to: '/overview',  label: 'National Overview',  icon: <IconMap />,      end: true  },
    { to: '/operators', label: 'Operator Dashboard', icon: <IconBuilding />, end: false },
    { to: '/sites',        label: 'Site Directory',     icon: <IconList />,    end: false },
    { to: '/isp-analysis', label: 'ISP POP Analysis', icon: <IconISP />,     end: false },
    { to: '/reports',      label: 'Reports',           icon: <IconReport />,  end: false },
    {
      to: '/disaster', label: 'Disaster Response', icon: <IconDisaster />, end: false,
      badge: (
        <span style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white', fontSize: 8, fontWeight: 800,
          padding: '2px 6px', borderRadius: 20,
          letterSpacing: '0.08em',
          boxShadow: '0 0 8px rgba(239,68,68,0.5)',
        }}>
          LIVE
        </span>
      ),
    },
  ]

  const W = collapsed ? 64 : 256

  return (
    <aside style={{
      width: W, minWidth: W,
      background: sidebarBg,
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
      borderRight: `1px solid ${sidebarBorder}`,
      transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
      position: 'relative',
    }}>

      {/* Subtle vertical glow line on right edge (dark only) */}
      {isDark && (
        <div style={{
          position: 'absolute', top: '10%', right: 0, width: 1, height: '80%',
          background: 'linear-gradient(180deg, transparent, rgba(56,189,248,0.15), transparent)',
          pointerEvents: 'none',
        }} />
      )}

      {/* ── Brand ── */}
      <div style={{
        padding: collapsed ? '16px 10px 14px' : '16px 16px 14px',
        borderBottom: `1px solid ${brandBorder}`,
        flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', minWidth: 0 }}>
          {/* Logo */}
          <div style={{
            width: collapsed ? 40 : 44, height: collapsed ? 40 : 44,
            borderRadius: 12, flexShrink: 0,
            background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 2,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.4)',
            transition: 'width 0.22s, height 0.22s',
          }}>
            <img src={btrcLogo} alt="BTRC" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                color: titleColor, fontSize: 14, fontWeight: 800, lineHeight: 1.2,
                whiteSpace: 'nowrap', letterSpacing: '-0.3px',
              }}>
                BTRC IMS
              </div>
              <div style={{
                color: subtitleColor, fontSize: 9.5, lineHeight: 1.4, whiteSpace: 'nowrap',
                fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                Infrastructure Monitor
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              flexShrink: 0, width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: btnBg,
              border: `1px solid ${btnBorder}`,
              borderRadius: 7, cursor: 'pointer', color: btnColor,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = btnBg; e.currentTarget.style.color = btnColor; e.currentTarget.style.borderColor = btnBorder }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav style={{ padding: collapsed ? '12px 8px' : '12px 10px', flexShrink: 0 }}>
        {!collapsed && (
          <div style={{
            fontSize: 9, fontWeight: 700, color: navLabelColor,
            textTransform: 'uppercase', letterSpacing: '0.14em',
            padding: '0 6px', marginBottom: 6,
          }}>
            Navigation
          </div>
        )}

        {NAV_ITEMS.map(({ to, label, icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '9px 10px',
              borderRadius: 10, marginBottom: 2,
              fontSize: 14, fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
              transition: 'all 0.15s',
              background: isActive ? navActiveBg : 'transparent',
              color: isActive ? navActive : navInactive,
              boxShadow: isActive ? 'inset 3px 0 0 #3b82f6' : 'inset 3px 0 0 transparent',
              position: 'relative',
            })}
            onMouseEnter={e => {
              const el = e.currentTarget
              if (!el.classList.contains('active')) {
                el.style.background = navHoverBg
                el.style.color = navHoverColor
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              if (!el.classList.contains('active')) {
                el.style.background = 'transparent'
                el.style.color = navInactive
              }
            }}
          >
            <span style={{ flexShrink: 0 }}>{icon}</span>
            {!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{label}</span>}
            {!collapsed && badge}
          </NavLink>
        ))}

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '10px 0', marginTop: 6,
              background: expandBg,
              border: `1px solid ${expandBorder}`,
              borderRadius: 10, cursor: 'pointer', color: expandColor,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = expandBg; e.currentTarget.style.color = expandColor; e.currentTarget.style.borderColor = expandBorder }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}
      </nav>

      <div style={{ flex: 1 }} />

      {/* ── User menu ── */}
      <UserMenu collapsed={collapsed} />

    </aside>
  )
}
