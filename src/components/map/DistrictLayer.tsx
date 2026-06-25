// ─── DistrictLayer ────────────────────────────────────────────────
// Loads bd-districts.geojson (64 districts) and renders:
//   • One filled polygon per district, colored by dominant site status
//   • District name labels at centroid
//
// Props:
//   sites             — current filtered/live site list
//   highlightDivision — shade the entire division in disaster color

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { GeoJSON, Marker } from 'react-leaflet'
import L from 'leaflet'
import type { Feature, FeatureCollection } from 'geojson'
import type { Site } from '@/types/site'

// ── Name bridge: GeoJSON adm2_name → site.district ───────────────
// Mismatches between OCHA GeoJSON spelling and our site data
const NAME_MAP: Record<string, string> = {
  Chapainababganj: 'Chapainawabganj',
  Jhalokati:       'Jhalokathi',
  Netrakona:       'Netrokona',
}
function toSiteName(geoName: string): string {
  return NAME_MAP[geoName] ?? geoName
}

// ── Per-district status ───────────────────────────────────────────
type DistrictStatus = 'active' | 'degraded' | 'down' | 'empty'

function districtStatus(districtName: string, sites: Site[]): DistrictStatus {
  const matching = sites.filter(s => s.district === districtName)
  if (matching.length === 0)                      return 'empty'
  if (matching.some(s => s.status === 'down'))    return 'down'
  if (matching.some(s => s.status === 'degraded'))return 'degraded'
  return 'active'
}

// ── Polygon styles ────────────────────────────────────────────────
const DISTRICT_STYLE: Record<DistrictStatus, L.PathOptions> = {
  active: {
    fillColor: '#22c55e', fillOpacity: 0.10,
    color: '#16a34a', weight: 0.8, opacity: 0.55,
  },
  degraded: {
    fillColor: '#f59e0b', fillOpacity: 0.16,
    color: '#d97706', weight: 1.2, opacity: 0.75,
  },
  down: {
    fillColor: '#ef4444', fillOpacity: 0.22,
    color: '#dc2626', weight: 1.8, opacity: 0.90,
  },
  empty: {
    fillColor: '#94a3b8', fillOpacity: 0.06,
    color: '#cbd5e1', weight: 0.6, opacity: 0.4,
  },
}

const NEUTRAL_STYLE: L.PathOptions = {
  fillColor: 'transparent', fillOpacity: 0,
  color: '#6b7c2e', weight: 1.2, opacity: 0.85,
}

const HIGHLIGHT_STYLE: L.PathOptions = {
  fillColor: '#ef4444', fillOpacity: 0.20,
  color: '#ef4444', weight: 2, opacity: 1,
  dashArray: '4 3',
}

// ── Label DivIcon ─────────────────────────────────────────────────
function makeLabelIcon(name: string, status: DistrictStatus, heatmap: boolean): L.DivIcon {
  const colors: Record<DistrictStatus, string> = {
    active:   '#14532d',
    degraded: '#78350f',
    down:     '#7f1d1d',
    empty:    '#334155',
  }
  const color = heatmap ? colors[status] : '#475569'
  return L.divIcon({
    className: '',
    iconSize:  [0, 0],
    iconAnchor:[0, 0],
    html: `<span style="
      display:inline-block;
      font:600 8px/1 system-ui,sans-serif;
      color:${color};
      text-shadow:0 1px 3px rgba(255,255,255,1),0 0 6px rgba(255,255,255,0.9);
      white-space:nowrap;
      pointer-events:none;
      transform:translate(-50%,-50%);
      position:absolute;
      letter-spacing:0.03em;
    ">${name}</span>`,
  })
}

// ─────────────────────────────────────────────────────────────────

interface Props {
  sites:              Site[]
  highlightDivision?: string
  heatmap?:           boolean
}

interface DistrictCentroid {
  name:     string
  division: string
  lat:      number
  lon:      number
  status:   DistrictStatus
}

export default function DistrictLayer({ sites, highlightDivision, heatmap = false }: Props) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/data/bd-districts.geojson')
      .then(r => r.json())
      .then(setGeoData)
      .catch(err => console.warn('DistrictLayer: failed to load districts', err))
  }, [])

  // Per-district status from live sites
  const distStats = useMemo(() => {
    if (!geoData) return {} as Record<string, DistrictStatus>
    return Object.fromEntries(
      geoData.features.map(f => {
        const geoName  = f.properties?.name as string
        const siteName = toSiteName(geoName)
        return [geoName, districtStatus(siteName, sites)]
      })
    )
  }, [geoData, sites])

  // Centroid labels
  const centroids = useMemo<DistrictCentroid[]>(() => {
    if (!geoData) return []
    return geoData.features.map(f => ({
      name:     f.properties?.name     as string,
      division: f.properties?.division as string,
      lat:      f.properties?.lat      as number,
      lon:      f.properties?.lon      as number,
      status:   distStats[f.properties?.name as string] ?? 'empty',
    }))
  }, [geoData, distStats])

  // Style function — stable ref via useCallback
  const styleFunc = useCallback((feature?: Feature) => {
    if (!feature) return NEUTRAL_STYLE
    const name = feature.properties?.name as string
    const div  = feature.properties?.division as string
    if (highlightDivision && div === highlightDivision) return HIGHLIGHT_STYLE
    if (!heatmap) return NEUTRAL_STYLE
    return DISTRICT_STYLE[distStats[name] ?? 'empty']
  }, [distStats, highlightDivision, heatmap])

  // Rekey forces GeoJSON remount when status distribution changes
  const statsKey = useMemo(
    () => Object.entries(distStats).map(([k, v]) => `${k}:${v}`).sort().join('|'),
    [distStats],
  )

  const prevLayerRef = useRef<L.Path | null>(null)

  const onEachDistrict = useCallback((_feat: Feature, layer: L.Layer) => {
    layer.on('click', () => {
      // Reset previous selection
      if (prevLayerRef.current) {
        const prev = prevLayerRef.current
        const pEl = prev.getElement() as SVGPathElement | null
        if (pEl) {
          pEl.style.transition = 'none'
          pEl.style.strokeDasharray = ''
          pEl.style.strokeDashoffset = ''
        }
        const saved = (prev as any)._savedStyle as L.PathOptions | undefined
        if (saved) prev.setStyle(saved)
      }

      const pathLayer = layer as L.Path
      ;(pathLayer as any)._savedStyle = { ...pathLayer.options }
      pathLayer.setStyle({ color: '#6b7c2e', weight: 2, opacity: 1 })
      prevLayerRef.current = pathLayer

      const el = pathLayer.getElement() as SVGPathElement | null
      if (!el) return
      const len = el.getTotalLength()
      if (!len) return

      el.style.transition = 'none'
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = `${len}`
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = 'stroke-dashoffset 0.9s ease-in-out'
          el.style.strokeDashoffset = '0'
        })
      })
    })
  }, [])

  if (!geoData) return null

  return (
    <>
      {/* ── District polygons ──────────────────────────────── */}
      <GeoJSON
        key={statsKey}
        data={geoData}
        style={styleFunc as () => L.PathOptions}
        onEachFeature={onEachDistrict}
      />

      {/* ── District name labels ──────────────────────────── */}
      {centroids.map(c => (
        <Marker
          key={c.name}
          position={[c.lat, c.lon]}
          icon={makeLabelIcon(c.name, c.status, heatmap)}
          interactive={false}
          zIndexOffset={500}
        />
      ))}
    </>
  )
}
