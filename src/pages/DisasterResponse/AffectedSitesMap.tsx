import { useMemo } from 'react'
import BaseMap         from '@/components/map/BaseMap'
import SiteMarkerLayer from '@/components/map/SiteMarkerLayer'
import DivisionLayer   from '@/components/map/DivisionLayer'
import MapLegend       from '@/components/map/MapLegend'
import { useSiteStore } from '@/store/siteStore'
import type { DisasterStats } from '@/hooks/useDisasterStats'

interface Props {
  stats: DisasterStats
}

// ─── AffectedSitesMap ─────────────────────────────────────────────
// Leaflet map zoomed to the disaster division (Sylhet).
// Division layer highlights Sylhet in disaster red; site markers
// show individual sites with pulsing icons for down/degraded sites.

export default function AffectedSitesMap({ stats }: Props) {
  const { scenario } = stats
  const allSites = useSiteStore(s => s.sites)

  const sylhetSites = useMemo(
    () => allSites.filter(s => s.division === scenario.affectedDivision),
    [allSites, scenario.affectedDivision],
  )

  const downCount     = sylhetSites.filter(s => s.status === 'down').length
  const degradedCount = sylhetSites.filter(s => s.status === 'degraded').length
  const activeCount   = sylhetSites.filter(s => s.status === 'active').length

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {scenario.affectedDivision} Division — Site Map
          </span>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
            {sylhetSites.length} sites monitored · ▲ tower  ● BTS  ◆ NTTN
          </div>
        </div>

        {/* Mini status pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: `${activeCount} Active`,     color: '#22c55e' },
            { label: `${degradedCount} Degraded`, color: '#f59e0b' },
            { label: `${downCount} Down`,         color: '#ef4444' },
          ].map(p => (
            <span key={p.label} style={{
              fontSize: 10, fontWeight: 700,
              color: p.color, background: `${p.color}18`,
              borderRadius: 9999, padding: '2px 8px',
            }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Map — centered on Sylhet city, zoomed to division level */}
      <BaseMap
        height={340}
        center={[24.9, 91.87]}
        zoom={9}
        minZoom={7}
      >
        {/* Show all divisions but emphasize Sylhet */}
        <DivisionLayer
          sites={allSites}
          highlightDivision={scenario.affectedDivision}
        />
        <SiteMarkerLayer sites={sylhetSites} />
        <MapLegend position="bottomright" />
      </BaseMap>
    </div>
  )
}
