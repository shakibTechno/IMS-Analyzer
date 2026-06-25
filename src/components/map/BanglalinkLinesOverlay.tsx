// ─── BanglalinkLinesOverlay ──────────────────────────────────────────
// 172 Banglalink backbone fiber segments, colour-coded by core count.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

// ── Color by core count ───────────────────────────────────────────
function coreColor(coreno: unknown): string {
  const n = Number(coreno ?? 0)
  if (n >= 72) return '#7c3aed'   // violet
  if (n >= 48) return '#2563eb'   // blue
  return '#0891b2'                // cyan (32 core)
}

function coreWeight(coreno: unknown): number {
  const n = Number(coreno ?? 0)
  if (n >= 72) return 3.2
  if (n >= 48) return 2.4
  return 1.8
}

function lineStyle(feature?: Feature): L.PathOptions {
  const p = feature?.properties ?? {}
  return {
    color:    coreColor(p.coreno),
    weight:   coreWeight(p.coreno),
    opacity:  0.85,
    lineCap:  'round',
    lineJoin: 'round',
  }
}

// ── Utilisation bar ───────────────────────────────────────────────
function utilBar(used: number, total: number): string {
  if (total === 0) return ''
  const pct = Math.min(100, Math.round((used / total) * 100))
  const barColor = pct >= 80 ? '#dc2626' : pct >= 50 ? '#d97706' : '#16a34a'
  return `
    <div style="margin-top:4px;">
      <div style="display:flex;justify-content:space-between;font-size:10px;
                  color:#64748b;margin-bottom:2px;">
        <span>Core utilisation</span>
        <span style="font-weight:600;color:${barColor}">${pct}%</span>
      </div>
      <div style="height:5px;background:#e2e8f0;border-radius:9999px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${barColor};
                    border-radius:9999px;transition:width 0.3s;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;
                  color:#94a3b8;margin-top:2px;">
        <span>${used} used</span>
        <span>${total - used} free / ${total} total</span>
      </div>
    </div>`
}

// ── Card popup ────────────────────────────────────────────────────
function buildPopup(p: Record<string, unknown>): string {
  const linename   = String(p.linename   ?? '—')
  const linetype   = String(p.linetype   ?? '—')
  const pathalong  = String(p.pathalong  ?? '—')
  const coreno     = Number(p.coreno     ?? 0)
  const coreuse    = Number(p.coreuse    ?? 0)
  const coreready  = Number(p.coreready  ?? 0)
  const routelen   = Number(p.routelenkm ?? 0)
  const ductno     = Number(p.ductno     ?? 0)
  const ductuse    = Number(p.ductuse    ?? 0)
  const netcap     = String(p.netcap     ?? '—')
  const capuse     = String(p.capuse     ?? '—')
  const yyyy       = String(p.yyyy       ?? '—')
  const division   = String(p.division   ?? '—')
  const district   = String(p.district   ?? '—')
  const upazila    = String(p.upazila    ?? '—')
  const color      = coreColor(coreno)

  const pathColor  = pathalong === 'Metro' ? '#7c3aed' : '#0891b2'
  const typeColor  = '#059669'

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                min-width:240px;max-width:300px;">

      <!-- Header -->
      <div style="margin-bottom:6px;">
        <div style="font-weight:700;color:#1e293b;font-size:13.5px;line-height:1.3;
                    margin-bottom:3px;">${linename}</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;">
          <span style="display:inline-flex;align-items:center;padding:2px 8px;
                       border-radius:9999px;font-size:10px;font-weight:700;
                       background:${color}18;border:1px solid ${color}44;color:${color};">
            ${coreno} Core
          </span>
          <span style="display:inline-flex;align-items:center;padding:2px 8px;
                       border-radius:9999px;font-size:10px;font-weight:600;
                       background:${typeColor}15;border:1px solid ${typeColor}44;color:${typeColor};">
            ${linetype}
          </span>
          <span style="display:inline-flex;align-items:center;padding:2px 8px;
                       border-radius:9999px;font-size:10px;font-weight:600;
                       background:${pathColor}15;border:1px solid ${pathColor}44;color:${pathColor};">
            ${pathalong}
          </span>
        </div>
      </div>

      <!-- Utilisation bar -->
      ${utilBar(coreuse, coreno)}

      <!-- Divider -->
      <div style="border-top:1px solid #f1f5f9;margin:7px 0;"></div>

      <!-- Route details -->
      <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;
                  color:#475569;margin-bottom:7px;">
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Route length</span>
          <span style="font-weight:500">${routelen > 0 ? routelen.toFixed(2) + ' km' : '—'}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Cores free</span>
          <span style="font-weight:500;color:#16a34a">${coreready > 0 ? coreready : coreno - coreuse} ready</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Ducts</span>
          <span>${ductno} total · ${ductuse} in use</span>
        </div>
      </div>

      <!-- Divider -->
      <div style="border-top:1px solid #f1f5f9;margin:7px 0;"></div>

      <!-- Capacity -->
      <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;
                  color:#475569;margin-bottom:7px;">
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Net capacity</span>
          <span style="word-break:break-word">${netcap !== '0' && netcap !== '—' ? netcap : '—'}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Capacity used</span>
          <span style="word-break:break-word">${capuse !== '—' ? capuse : '—'}</span>
        </div>
      </div>

      <!-- Divider -->
      <div style="border-top:1px solid #f1f5f9;margin:7px 0;"></div>

      <!-- Location & meta -->
      <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:#475569;">
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Division</span>
          <span>${division}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">District</span>
          <span>${district}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Upazila</span>
          <span>${upazila}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Est. year</span>
          <span>${yyyy}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Operator</span>
          <span style="font-weight:600;color:#374151">Banglalink</span>
        </div>
      </div>
    </div>`
}

// ── Filter helpers ────────────────────────────────────────────────
export type BLLineFilter = Set<'72' | '48' | '32'>

function passesFilter(p: Record<string, unknown>, filter: BLLineFilter): boolean {
  const n = Number(p.coreno ?? 0)
  if (filter.has('72') && n >= 72) return true
  if (filter.has('48') && n >= 48 && n < 72) return true
  if (filter.has('32') && n < 48) return true
  return false
}

// ── Component ─────────────────────────────────────────────────────

interface Props {
  visible:    boolean
  lineFilter: BLLineFilter
}

export default function BanglalinkLinesOverlay({ visible, lineFilter }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || lineFilter.size === 0 || data) return
    fetch('/data/bl-lines.geojson?v=1')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('BanglalinkLinesOverlay: fetch failed', err))
  }, [visible, lineFilter, data])

  const filtered = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      features: data.features.filter(f =>
        passesFilter(f.properties ?? {}, lineFilter)
      ),
    }
  }, [data, lineFilter])

  const filterKey = [...lineFilter].sort().join(',')

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p = feat.properties ?? {}
    layer.bindPopup(buildPopup(p), { maxWidth: 310, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${p.linename ?? ''}</span>
       <span style="font:400 10px system-ui,sans-serif;color:#64748b;margin-left:5px">${p.coreno ?? ''}c · ${p.routelenkm ? Number(p.routelenkm).toFixed(1) + ' km' : ''}</span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [])

  if (!visible || !filtered || filtered.features.length === 0) return null

  return (
    <GeoJSON
      key={`bl-lines-${filterKey}`}
      data={filtered}
      style={lineStyle as () => L.PathOptions}
      onEachFeature={onEach}
    />
  )
}
