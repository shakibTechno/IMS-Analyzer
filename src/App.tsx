import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import btrcLogo from '@/assets/Logo/btrcLogo.png'

import Sidebar           from '@/components/layout/Sidebar'
import TopBar            from '@/components/layout/TopBar'
import ErrorBoundary     from '@/components/shared/ErrorBoundary'
import { useSimulation } from '@/hooks/useSimulation'
import { useAuthStore }  from '@/store/authStore'
import Login             from '@/pages/Login'
import LandingPage       from '@/pages/LandingPage'
import NationalOverview  from '@/pages/NationalOverview'
import OperatorDashboard from '@/pages/OperatorDashboard'
import SiteDirectory     from '@/pages/SiteDirectory'
import SiteDetail        from '@/pages/SiteDetail'
import DisasterResponse  from '@/pages/DisasterResponse'
import Reports          from '@/pages/Reports'
import FiberLineReport  from '@/pages/Reports/FiberLineReport'
import BTSReport        from '@/pages/Reports/BTSReport'
import TowerReport      from '@/pages/Reports/TowerReport'
import ISPAnalysis      from '@/pages/ISPAnalysis'

// ─── ThemeApplier — writes data-theme to <html> on every change ──
function ThemeApplier() {
  const theme = useThemeStore(s => s.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link')
    link.rel  = 'icon'
    link.type = 'image/png'
    link.href = btrcLogo
    document.head.appendChild(link)
  }, [])
  return null
}

// ─── SimulationRunner ─────────────────────────────────────────────
function SimulationRunner() {
  useSimulation(10_000)
  return null
}

// ─── Page title mapping ───────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/':                    'Dashboard',
  '/overview':            'National Overview',
  '/operators':           'Operator Dashboard',
  '/sites':               'Site Directory',
  '/disaster':            'Disaster Response Cell',
  '/reports':             'Reports',
  '/reports/fiber':       'Fiber Line Report',
  '/reports/bts':         'BTS Report',
  '/reports/tower':       'Tower Report',
  '/isp-analysis':        'ISP POP Analysis',
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/sites/')) return 'Site Detail'
  return PAGE_TITLES[pathname] ?? 'BTRC IMS'
}

// ─── Protected route ──────────────────────────────────────────────
// Redirects to /login if not authenticated, passing the attempted
// path in location.state so Login can redirect back after sign-in.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user     = useAuthStore(s => s.user)
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

// ─── Layout shell ─────────────────────────────────────────────────
function Layout() {
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  useEffect(() => {
    document.title = `${title} — BTRC IMS`
  }, [title])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <TopBar title={title} />
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-base)' }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/"              element={<LandingPage />}       />
              <Route path="/overview"      element={<NationalOverview />}  />
              <Route path="/operators"     element={<OperatorDashboard />} />
              <Route path="/sites"         element={<SiteDirectory />}     />
              <Route path="/sites/:siteId" element={<SiteDetail />}        />
              <Route path="/disaster"       element={<DisasterResponse />}  />
              <Route path="/reports"        element={<Reports />}           />
              <Route path="/reports/fiber"  element={<FiberLineReport />}   />
              <Route path="/reports/bts"    element={<BTSReport />}         />
              <Route path="/reports/tower"  element={<TowerReport />}       />
              <Route path="/isp-analysis"  element={<ISPAnalysis />}       />
              <Route path="*"              element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

// ─── App root ─────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ThemeApplier />
      <SimulationRunner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
