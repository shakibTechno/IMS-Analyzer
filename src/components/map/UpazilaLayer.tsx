// ─── UpazilaLayer ────────────────────────────────────────────────────
// Renders 544 upazila (thana) boundaries from bd-upazilas.geojson.
// Polygons coloured by division; labels appear at zoom ≥ 9.

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { GeoJSON, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Feature, FeatureCollection } from 'geojson'

// ── Division colour palette ───────────────────────────────────────
// Keyed by division_c (code string)
const DIV_FILL: Record<string, string> = {
  '10': '#fef9c3',  // Barisal    — yellow
  '20': '#dbeafe',  // Chittagong — blue
  '30': '#dcfce7',  // Dhaka      — green
  '40': '#fce7f3',  // Khulna     — pink
  '45': '#fdf4ff',  // Mymensingh — purple-rose
  '50': '#ede9fe',  // Rajshahi   — violet
  '55': '#fff7ed',  // Rangpur    — orange
  '60': '#ecfdf5',  // Sylhet     — emerald
}
const DIV_STROKE: Record<string, string> = {
  '10': '#ca8a04',
  '20': '#2563eb',
  '30': '#16a34a',
  '40': '#db2777',
  '45': '#a21caf',
  '50': '#7c3aed',
  '55': '#ea580c',
  '60': '#059669',
}
const DIV_LABEL: Record<string, string> = {
  '10': '#854d0e',
  '20': '#1e40af',
  '30': '#14532d',
  '40': '#9d174d',
  '45': '#701a75',
  '50': '#4c1d95',
  '55': '#9a3412',
  '60': '#064e3b',
}

function divStyle(feature?: Feature): L.PathOptions {
  const code = String(feature?.properties?.division_c ?? '')
  return {
    fillColor:   DIV_FILL[code]   ?? '#f1f5f9',
    fillOpacity: 0.30,
    color:       DIV_STROKE[code] ?? '#94a3b8',
    weight:      0.6,
    opacity:     0.65,
  }
}

const HOVER_STYLE: Partial<L.PathOptions> = {
  fillOpacity: 0.55,
  weight:      1.4,
  opacity:     1,
}

// ── Label DivIcon ─────────────────────────────────────────────────
function makeLabelIcon(name: string, divCode: string): L.DivIcon {
  const color = DIV_LABEL[divCode] ?? '#334155'
  return L.divIcon({
    className: '',
    iconSize:  [0, 0],
    iconAnchor:[0, 0],
    html: `<span style="
      display:inline-block;
      font:500 7.5px/1 system-ui,sans-serif;
      color:${color};
      text-shadow:0 1px 3px rgba(255,255,255,1),0 0 6px rgba(255,255,255,0.9);
      white-space:nowrap;
      pointer-events:none;
      transform:translate(-50%,-50%);
      position:absolute;
      letter-spacing:0.02em;
    ">${name}</span>`,
  })
}

// ── Popup HTML ────────────────────────────────────────────────────
function buildPopup(p: Record<string, unknown>): string {
  const divCode = String(p.division_c ?? '')
  const color   = DIV_STROKE[divCode] ?? '#64748b'
  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;min-width:175px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:2px">
        ${p.thana_name ?? '—'}
      </div>
      <div style="font-size:10px;color:#64748b;margin-bottom:7px">Upazila / Thana</div>
      <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:#475569">
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:58px;flex-shrink:0">District</span>
          <span style="font-weight:600;color:#374151">${p.district_n ?? '—'}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:58px;flex-shrink:0">Division</span>
          <span>
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;
                         background:${color};margin-right:4px;vertical-align:middle"></span>
            ${p.division_n ?? '—'}
          </span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:58px;flex-shrink:0">Thana code</span>
          <span style="font-family:monospace">${p.thana_code ?? '—'}</span>
        </div>
      </div>
    </div>`
}

// ─────────────────────────────────────────────────────────────────

interface Props {
  sites?: unknown[]   // reserved for future status coloring
}

interface Centroid {
  key:     string
  name:    string
  divCode: string
  lat:     number
  lon:     number
}

// Zoom watcher — re-renders parent with current zoom level
function useZoom(): number {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useEffect(() => {
    const handler = () => setZoom(map.getZoom())
    map.on('zoomend', handler)
    return () => { map.off('zoomend', handler) }
  }, [map])
  return zoom
}

export default function UpazilaLayer(_props: Props) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)
  const zoom = useZoom()
  const prevRef = useRef<L.Path | null>(null)

  useEffect(() => {
    fetch('/data/bd-upazilas.geojson?v=1')
      .then(r => r.json())
      .then(setGeoData)
      .catch(err => console.warn('UpazilaLayer: load failed', err))
  }, [])

  const centroids = useMemo<Centroid[]>(() => {
    if (!geoData) return []
    return geoData.features.map(f => ({
      key:     String(f.properties?.thana_code ?? f.properties?.thana_name),
      name:    String(f.properties?.thana_name ?? ''),
      divCode: String(f.properties?.division_c ?? ''),
      lat:     Number(f.properties?.cy ?? 0),
      lon:     Number(f.properties?.cx ?? 0),
    })).filter(c => c.lat !== 0 && c.lon !== 0)
  }, [geoData])

  const onEachFeature = useCallback((_feat: Feature, layer: L.Layer) => {
    const p   = _feat.properties ?? {}
    const key = String(p.division_c ?? '')
    const baseStyle  = divStyle(_feat)
    const hoverStyle = { ...baseStyle, ...HOVER_STYLE, color: DIV_STROKE[key] ?? '#64748b' }

    layer.on('mouseover', () => {
      if (prevRef.current && prevRef.current !== (layer as L.Path)) {
        prevRef.current.setStyle(divStyle(_feat))
      }
      ;(layer as L.Path).setStyle(hoverStyle)
      ;(layer as L.Path).bringToFront()
    })
    layer.on('mouseout', () => {
      ;(layer as L.Path).setStyle(baseStyle)
    })
    layer.bindPopup(buildPopup(p), { maxWidth: 240 })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${p.thana_name ?? ''}</span>
       <span style="font:400 10px system-ui,sans-serif;color:#64748b;margin-left:4px">${p.district_n ?? ''}</span>`,
      { sticky: true, offset: [8, 0], opacity: 0.95 }
    )
  }, [])

  if (!geoData) return null

  const showLabels = zoom >= 9

  return (
    <>
      <GeoJSON
        key="upazila-polygons"
        data={geoData}
        style={divStyle as () => L.PathOptions}
        onEachFeature={onEachFeature}
      />
      {showLabels && centroids.map(c => (
        <Marker
          key={c.key}
          position={[c.lat, c.lon]}
          icon={makeLabelIcon(c.name, c.divCode)}
          interactive={false}
          zIndexOffset={200}
        />
      ))}
    </>
  )
}
