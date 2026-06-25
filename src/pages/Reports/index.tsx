import { useNavigate } from 'react-router-dom'

interface ReportCard {
  title:       string
  description: string
  path:        string
  icon:        React.ReactNode
  color:       string
}

const REPORTS: ReportCard[] = [
  {
    title:       'Fiber Line Report',
    description: 'Find fiber segments connecting two geographic areas across operators. Filter by Division, District, or Upazila.',
    path:        '/reports/fiber',
    color:       '#1d4ed8',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18M3 12c0-3.3 2.7-6 6-6M3 12c0 3.3 2.7 6 6 6M21 12c0-3.3-2.7-6-6-6M21 12c0 3.3-2.7 6-6 6M9 6c1 2 1.5 4 1.5 6S10 14 9 18M15 6c-1 2-1.5 4-1.5 6S14 14 15 18"/>
      </svg>
    ),
  },
  {
    title:       'BTS Report',
    description: 'View BTS sites within a Division, District, or Upazila for Grameenphone, Robi, Banglalink, and Summit.',
    path:        '/reports/bts',
    color:       '#059669',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/>
        <path d="M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    ),
  },
  {
    title:       'Tower Report',
    description: 'View towers within a Division, District, or Upazila across MNOs (GP, Robi, BL, Teletalk) and TowerCos (edotco, Summit, KBTL, Frontier).',
    path:        '/reports/tower',
    color:       '#7c3aed',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21l4-16 4 16"/>
        <path d="M6 21h12"/>
        <path d="M9.5 15h5"/>
        <path d="M10.5 9.5h3"/>
      </svg>
    ),
  },
]

export default function Reports() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto', background: 'var(--bg-base)', minHeight: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Reports</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '5px 0 0' }}>
          Select a report type to get started.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {REPORTS.map(r => (
          <button
            key={r.path}
            onClick={() => navigate(r.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              padding: 24,
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = r.color
              e.currentTarget.style.boxShadow = `0 4px 16px ${r.color}30`
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              width: 48, height: 48,
              borderRadius: 10,
              background: r.color + '18',
              color: r.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              {r.icon}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {r.title}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {r.description}
            </div>
            <div style={{
              marginTop: 16,
              fontSize: 12,
              fontWeight: 600,
              color: r.color,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Open report
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
