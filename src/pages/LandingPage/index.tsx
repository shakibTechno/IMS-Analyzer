import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import btrcLogo from '@/assets/Logo/btrcLogo.png'
import { FIBER_ROUTES } from '@/data/fiberRoutes'

const ISP_POP_COUNT     = 12_439
const ISP_COMPANY_COUNT = 557    // licensed ISPs per BTRC register

// Sourced from: MapData/TowerData/ALL TOWERCO Data.xlsx + All MNO Tower data.xlsx
const TOTAL_TOWER_COUNT = 48_148 // EDOTCO 16941 + STL 5432 + KBTL 1110 + FTL 940 + GP 11748 + ROBI 2277 + BL 3912 + TT 5788
const TOWER_COMPANY_COUNT = 8    // 4 TowerCo (EDOTCO, STL, KBTL, FTL) + 4 MNO (GP, Robi, BL, TT)

// Real division tower counts (normalized from Excel data)
const DIVISION_TOWER_DATA = [
  { div: 'Dhaka',       count: 16_517 },
  { div: 'Chattogram',  count: 10_632 },
  { div: 'Khulna',      count:  4_850 },
  { div: 'Rajshahi',    count:  4_309 },
  { div: 'Rangpur',     count:  3_468 },
  { div: 'Sylhet',      count:  3_239 },
  { div: 'Mymensingh',  count:  2_790 },
  { div: 'Barishal',    count:  2_343 },
]

// ISP PoP counts per division — coordinates mapped via geographic bounding boxes
// Source: MapData/ISP pop list.xlsx Sheet2 (11,741 of 12,562 coords mapped; 821 invalid)
const POP_DIVISION_DATA = [
  { div: 'Dhaka',       count: 3_805 },
  { div: 'Mymensingh',  count: 1_257 },
  { div: 'Khulna',      count: 1_416 },
  { div: 'Rajshahi',    count: 1_380 },
  { div: 'Chattogram',  count: 1_139 },
  { div: 'Rangpur',     count: 1_091 },
  { div: 'Barishal',    count:   968 },
  { div: 'Sylhet',      count:   685 },
]

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLng = (b[1] - a[1]) * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

// ─── KPI Card ─────────────────────────────────────────────────────
interface KPIProps {
  label: string
  value: string | number
  accent: string
  lightBg: string
  icon: React.ReactNode
}

function KPICard({ label, value, accent, lightBg, icon }: KPIProps) {
  const isDark = useThemeStore(s => s.theme === 'dark')
  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 0,
      border: '1px solid var(--border)',
      borderTop: `4px solid ${accent}`,
      padding: '22px 20px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
      boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: isDark ? `${accent}22` : lightBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 6 }}>{label}</div>
      </div>
    </div>
  )
}

// ─── SVG Icons ────────────────────────────────────────────────────
function IconBuilding({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  )
}
function IconGlobe({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}
function IconTower({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <path d="M5 6l7-4 7 4"/><path d="M5 10l7-4 7 4"/>
      <line x1="5" y1="6" x2="12" y2="22"/><line x1="19" y1="6" x2="12" y2="22"/>
    </svg>
  )
}
function IconFiber({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l3-9 4 18 3-9h4"/>
    </svg>
  )
}
function IconWifi({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  )
}
function IconPin({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

// ─── Nav Card ─────────────────────────────────────────────────────
interface NavCardProps {
  to: string
  label: string
  description: string
  icon: React.ReactNode
  color: string
  lightBg: string
}

function NavCard({ to, label, description, icon, color, lightBg }: NavCardProps) {
  const navigate = useNavigate()
  const isDark   = useThemeStore(s => s.theme === 'dark')
  const iconBg   = isDark ? `${color}22` : lightBg
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        background: 'var(--card-bg)', borderRadius: 14,
        border: '1px solid var(--border)',
        padding: '20px 22px',
        display: 'flex', alignItems: 'center', gap: 16,
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.18s ease',
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.2)`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{description}</div>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </button>
  )
}

// ─── Section Label ────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 4, height: 20, background: '#003D7A', borderRadius: 2 }} />
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
        {children}
      </h2>
    </div>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────
export default function LandingPage() {
  const isDark        = useThemeStore(s => s.theme === 'dark')
  const nttnOpsCount  = 7

  const fiberKm = useMemo(() => {
    const total = FIBER_ROUTES.reduce((sum, route) => {
      const routeKm = route.coords.reduce((s, coord, i) => {
        if (i === 0) return s
        return s + haversineKm(route.coords[i - 1], coord)
      }, 0)
      return sum + routeKm
    }, 0)
    return Math.round(total).toLocaleString()
  }, [])

  const divisionData = DIVISION_TOWER_DATA

  const DIV_COLORS = ['#003D7A','#0ea5e9','#6366f1','#8b5cf6','#059669','#d97706','#dc2626','#0891b2']

  const KPI_ITEMS: KPIProps[] = [
    { label: 'Total Tower / Sites',      value: TOTAL_TOWER_COUNT,   accent: '#003D7A', lightBg: '#eff6ff', icon: <IconTower    color="#003D7A" /> },
    { label: 'Total Telecom Operator',   value: TOWER_COMPANY_COUNT, accent: '#7c3aed', lightBg: '#faf5ff', icon: <IconBuilding color="#7c3aed" /> },
    { label: 'Fiber Line Distance (km)', value: fiberKm,             accent: '#0891b2', lightBg: '#e0f2fe', icon: <IconFiber    color="#0891b2" /> },
    { label: 'Total NTTN Operator',      value: nttnOpsCount,        accent: '#16a34a', lightBg: '#f0fdf4', icon: <IconGlobe    color="#16a34a" /> },
    { label: 'Total ISP Covered',        value: ISP_COMPANY_COUNT,   accent: '#d97706', lightBg: '#fffbeb', icon: <IconWifi     color="#d97706" /> },
    { label: 'ISP Points of Presence',   value: ISP_POP_COUNT,       accent: '#059669', lightBg: '#ecfdf5', icon: <IconPin      color="#059669" /> },
  ]

  const NAV_ITEMS: NavCardProps[] = [
    { to: '/overview',  label: 'National Overview',  description: 'Interactive GIS map with site layers, division and district breakdowns', color: '#003D7A', lightBg: '#eff6ff', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#003D7A" strokeWidth="2" strokeLinecap="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg> },
    { to: '/operators', label: 'Operator Dashboard', description: 'Per-operator KPIs, submission compliance, tenancy analytics',           color: '#6366f1', lightBg: '#eef2ff', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
    { to: '/sites',     label: 'Site Directory',     description: 'Full site list with filters, search, and detailed site view',           color: '#0891b2', lightBg: '#e0f2fe', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
    { to: '/reports',   label: 'Reports',            description: 'BTS, fiber line, and tower infrastructure reports',                     color: '#059669', lightBg: '#ecfdf5', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { to: '/disaster',  label: 'Disaster Response',  description: 'Real-time disaster alerts, affected sites, and recovery tracking',      color: '#dc2626', lightBg: '#fef2f2', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  ]

  return (
    <div style={{ padding: '28px 32px', background: 'var(--bg-base)', minHeight: '100%' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* ── Hero Banner ── */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: 18, padding: '40px 48px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 16,
          marginBottom: 32,
          border: '2px solid #16a34a',
          boxShadow: isDark ? '0 4px 24px rgba(22,163,74,0.08)' : '0 4px 24px rgba(22,163,74,0.12)',
        }}>
          {/* Logo */}
          <div style={{ width: 130, height: 130, borderRadius: 20, padding: 3 }}>
            <img src={btrcLogo} alt="BTRC" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          {/* Main title — green */}
          <h1 style={{
            color: '#15803d', fontSize: 34, fontWeight: 900,
            margin: 0, lineHeight: 1.15, letterSpacing: '-0.5px',
          }}>
            Infrastructure Monitoring System
          </h1>

          {/* Subtitle — red */}
          <p style={{
            color: '#dc2626', fontSize: 15, fontWeight: 500,
            margin: 0, lineHeight: 1.6,
          }}>
            Nationwide Tower and Optical Fiber Network — including Disaster Response Cell
          </p>

        </div>

        {/* ── KPI Row ── */}
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>Network Overview</SectionLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}>
            {KPI_ITEMS.map(item => <KPICard key={item.label} {...item} />)}
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>Analytics</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Tower by Division Bar */}
            <div style={{
              background: 'var(--card-bg)', borderRadius: 14,
              border: '1px solid var(--border)',
              padding: '22px 22px 14px',
              boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Towers by Division
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Registered tower infrastructure per administrative division
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={divisionData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e3352' : '#f1f5f9'} vertical={false} />
                  <XAxis dataKey="div" tick={{ fontSize: 10, fill: isDark ? '#3d5a7a' : '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: isDark ? '#3d5a7a' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 13, borderRadius: 10, border: `1px solid ${isDark ? '#1e3352' : '#e2e8f0'}`, background: isDark ? '#0f1a2e' : '#fff', color: isDark ? '#e2e8f0' : '#0f172a', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', padding: '10px 14px' }}
                    formatter={(v) => [v, 'Towers']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {divisionData.map((_, i) => (
                      <Cell key={i} fill={DIV_COLORS[i % DIV_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ISP PoP by Division Bar */}
            <div style={{
              background: 'var(--card-bg)', borderRadius: 14,
              border: '1px solid var(--border)',
              padding: '22px 22px 14px',
              boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                ISP PoP by Division
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Internet Service Provider Points of Presence per division
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={POP_DIVISION_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e3352' : '#f1f5f9'} vertical={false} />
                  <XAxis dataKey="div" tick={{ fontSize: 10, fill: isDark ? '#3d5a7a' : '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: isDark ? '#3d5a7a' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 13, borderRadius: 10, border: `1px solid ${isDark ? '#1e3352' : '#e2e8f0'}`, background: isDark ? '#0f1a2e' : '#fff', color: isDark ? '#e2e8f0' : '#0f172a', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', padding: '10px 14px' }}
                    formatter={(v) => [v, 'PoPs']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {POP_DIVISION_DATA.map((_, i) => (
                      <Cell key={i} fill={['#059669','#0891b2','#7c3aed','#d97706','#003D7A','#dc2626','#6366f1','#16a34a'][i % 8]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Quick Access ── */}
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Quick Access</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {NAV_ITEMS.map(item => <NavCard key={item.to} {...item} />)}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  )
}
