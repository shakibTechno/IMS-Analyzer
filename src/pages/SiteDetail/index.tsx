import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import EmptyState  from '@/components/shared/EmptyState'
import { getSiteById } from '@/data/sites'
import SiteAttributesCard  from './SiteAttributesCard'
import StatusHistoryPanel  from './StatusHistoryPanel'
import TenancyDetailsPanel from './TenancyDetailsPanel'
import OutageIncidentLog   from './OutageIncidentLog'

// ─── SiteDetail ───────────────────────────────────────────────────
// Route: /sites/:siteId
// Renders full detail for a single site.
// Handles invalid siteId gracefully.

export default function SiteDetail() {
  const { siteId } = useParams<{ siteId: string }>()
  const navigate   = useNavigate()
  const site       = siteId ? getSiteById(siteId) : undefined

  // ── Not found ────────────────────────────────────────────────────
  if (!site) {
    return (
      <PageWrapper>
        <EmptyState
          icon="📍"
          title="Site not found"
          message={
            siteId
              ? `No site with ID "${siteId}" exists in the dataset.`
              : 'No site ID provided in the URL.'
          }
          action={
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '8px 16px', borderRadius: 6, border: 'none',
                background: '#003D7A', color: 'white', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
              }}
            >
              ← Back to Overview
            </button>
          }
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {/* ── Back breadcrumb ─────────────────────────────────── */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: '#64748b', padding: 0,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← Back
        </button>
        <span style={{ color: '#e2e8f0', fontSize: 12 }}>/</span>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>Sites</span>
        <span style={{ color: '#e2e8f0', fontSize: 12 }}>/</span>
        <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{site.name}</span>
      </div>

      {/* ── Main layout ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <SiteAttributesCard site={site} />
        <StatusHistoryPanel siteId={site.id} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TenancyDetailsPanel site={site} />
        <OutageIncidentLog   siteId={site.id} />
      </div>
    </PageWrapper>
  )
}
