// ─── BTCLKmzLinesOverlay ──────────────────────────────────────────
// 8,163 BTCL-owned fiber line segments from fiber_network_multiple_district.kmz.
// All lines owner = "BTCL". Coloured by tenant (who leases each corridor).

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

export type BTCLTenant = 'BTCL' | 'GP' | 'Robi' | 'MOTN' | 'BL' | 'BSCCL'
export type BTCLTenantFilter = Set<BTCLTenant>

export const BTCL_TENANT_COLORS: Record<BTCLTenant, string> = {
  BTCL:  '#0891b2',
  GP:    '#e11d48',
  Robi:  '#ea580c',
  MOTN:  '#8b5cf6',
  BL:    '#f59e0b',
  BSCCL: '#10b981',
}

export const BTCL_TENANT_LABELS: Record<BTCLTenant, string> = {
  BTCL:  'BTCL Backbone',
  GP:    'Grameenphone (on BTCL)',
  Robi:  'Robi (on BTCL)',
  MOTN:  'MOTN (on BTCL)',
  BL:    'Banglalink (on BTCL)',
  BSCCL: 'BSCCL (on BTCL)',
}

function lineStyle(feature?: Feature): L.PathOptions {
  const tenant = (feature?.properties?.tenant ?? 'BTCL') as BTCLTenant
  return {
    color:    BTCL_TENANT_COLORS[tenant] ?? '#0891b2',
    weight:   1.8,
    opacity:  0.82,
    lineCap:  'round',
    lineJoin: 'round',
  }
}

function buildPopup(p: Record<string, unknown>): string {
  const name    = String(p.name    ?? '—')
  const tenant  = (p.tenant  ?? 'BTCL') as BTCLTenant
  const dist    = p.dist_km != null ? `${Number(p.dist_km).toFixed(2)} km` : '—'
  const color   = BTCL_TENANT_COLORS[tenant] ?? '#0891b2'
  const label   = BTCL_TENANT_LABELS[tenant]  ?? tenant

  const match  = name.match(/^(.+?)\s*[-–]\s*(.+?)\s*\(/)
  const origin = match ? match[1].trim() : name
  const dest   = match ? match[2].trim() : '—'

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                min-width:220px;max-width:300px;">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:4px;
                  word-break:break-word;">${name}</div>
      <div style="display:flex;gap:5px;margin-bottom:7px;flex-wrap:wrap;">
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;
                     font-size:10px;font-weight:700;
                     background:#0891b218;border:1px solid #0891b244;color:#0891b2;">
          Owner: BTCL
        </span>
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;
                     font-size:10px;font-weight:700;
                     background:${color}18;border:1px solid ${color}44;color:${color};">
          ${label}
        </span>
      </div>
      <div style="border-top:1px solid #f1f5f9;margin:5px 0;"></div>
      <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:#475569;">
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:68px;flex-shrink:0;">From</span>
          <span style="font-weight:500;word-break:break-word">${origin}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:68px;flex-shrink:0;">To</span>
          <span style="font-weight:500;word-break:break-word">${dest}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:68px;flex-shrink:0;">Distance</span>
          <span>${dist}</span>
        </div>
      </div>
    </div>`
}

interface Props {
  visible:      boolean
  tenantFilter: BTCLTenantFilter
}

export default function BTCLKmzLinesOverlay({ visible, tenantFilter }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || tenantFilter.size === 0 || data) return
    fetch('/data/fiber-lines.geojson?v=2')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('BTCLKmzLinesOverlay: fetch failed', err))
  }, [visible, tenantFilter, data])

  const filtered = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      features: data.features.filter(f =>
        f.properties?.owner === 'BTCL' &&
        tenantFilter.has((f.properties?.tenant ?? 'BTCL') as BTCLTenant)
      ),
    }
  }, [data, tenantFilter])

  const filterKey = [...tenantFilter].sort().join(',')

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p = feat.properties ?? {}
    layer.bindPopup(buildPopup(p), { maxWidth: 320, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">
        ${String(p.name ?? '').substring(0, 60)}
      </span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [])

  if (!visible || !filtered || filtered.features.length === 0) return null

  return (
    <GeoJSON
      key={`btcl-kmz-lines-${filterKey}`}
      data={filtered}
      style={lineStyle as () => L.PathOptions}
      onEachFeature={onEach}
    />
  )
}
