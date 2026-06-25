import { type ReactNode, useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import BangladeshOverlay from './BangladeshOverlay'
import FullscreenControl from './FullscreenControl'

// ─── InvalidateSize ───────────────────────────────────────────────
function InvalidateSize() {
  const map = useMap()
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => cancelAnimationFrame(frame)
  }, [map])
  return null
}

// ─── TileModeControl ─────────────────────────────────────────────
// Two stacked buttons: CARTO and LOCAL. Active = blue, inactive = white.
type TileMode = 'osm' | 'carto' | 'google' | 'local'

function TileModeControl({ mode, onSet }: { mode: TileMode; onSet: (m: TileMode) => void }) {
  const map = useMap()

  useEffect(() => {
    const Ctrl = L.Control.extend({
      onAdd() {
        const wrap = L.DomUtil.create('div', 'leaflet-bar leaflet-control')

        const GOOGLE_G = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>`

        const makeBtn = (key: TileMode, title: string, html: string) => {
          const a = L.DomUtil.create('a', '', wrap) as HTMLAnchorElement
          a.href  = '#'
          a.title = title
          const active = mode === key
          a.style.cssText = [
            'display:flex', 'align-items:center', 'justify-content:center',
            'width:30px', 'height:30px', 'cursor:pointer',
            'font-size:8px', 'font-weight:700', 'letter-spacing:0.04em',
            'text-decoration:none', 'line-height:1',
            active ? 'background:#e8f0fe;outline:2px solid #1d4ed8;outline-offset:-2px;' : 'background:white;color:#475569;',
          ].join(';')
          a.innerHTML = html
          L.DomEvent.on(a, 'click', (e: Event) => {
            L.DomEvent.preventDefault(e)
            L.DomEvent.stopPropagation(e)
            onSet(key)
          })
        }

        makeBtn('osm',    'OpenStreetMap',    '<span style="color:inherit">OSM</span>')
        makeBtn('carto',  'CartoDB light map', '<span style="color:inherit">CARTO</span>')
        makeBtn('google', 'Google Roadmap',    GOOGLE_G)
        return wrap
      },
      onRemove() {},
    })
    const ctrl = new Ctrl({ position: 'topleft' })
    ctrl.addTo(map)
    return () => { ctrl.remove() }
  }, [map, mode, onSet])
  return null
}

// Bangladesh geographic center
const BD_CENTER: LatLngExpression = [23.685, 90.356]
const BD_DEFAULT_ZOOM = 7

interface Props {
  center?:   LatLngExpression
  zoom?:     number
  height?:   number | string
  style?:    React.CSSProperties
  children?: ReactNode
  minZoom?:  number
  maxZoom?:  number
}

export default function BaseMap({
  center   = BD_CENTER,
  zoom     = BD_DEFAULT_ZOOM,
  height   = '100%',
  style,
  minZoom  = 5,
  maxZoom  = 18,
  children,
}: Props) {
  const [tileMode, setTileMode] = useState<TileMode>('osm')

  return (
    <div style={{ height, width: '100%', position: 'relative', ...style }}>
      <style>{`
        .leaflet-container:-webkit-full-screen { width: 100% !important; height: 100% !important; }
        .leaflet-container:fullscreen           { width: 100% !important; height: 100% !important; }
        *:-webkit-full-screen .leaflet-container { width: 100% !important; height: 100% !important; }
        *:fullscreen .leaflet-container          { width: 100% !important; height: 100% !important; }
        ${tileMode === 'carto' ? '.leaflet-tile-pane { filter: saturate(1.8); }' : ''}
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        style={{ height: '100%', width: '100%' }}
        maxBounds={[[20.0, 87.0], [27.0, 93.5]]}
        maxBoundsViscosity={0.8}
      >
        <InvalidateSize />
        <FullscreenControl />
        <TileModeControl mode={tileMode} onSet={setTileMode} />

        {tileMode === 'carto' && (
          <TileLayer
            key="carto"
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
        )}
        {tileMode === 'google' && (
          <TileLayer
            key="google"
            url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['0', '1', '2', '3']}
            attribution='&copy; Google Maps'
            maxZoom={20}
          />
        )}
        {tileMode === 'local' && (
          <TileLayer
            key="local"
            url="http://localhost:8090/styles/osm-nolabels/{z}/{x}/{y}.png"
            attribution='Local TileServer &copy; OpenMapTiles &copy; OpenStreetMap contributors'
            maxZoom={18}
          />
        )}
        {tileMode === 'osm' && (
          <TileLayer
            key="osm"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}

        <BangladeshOverlay />
        {children}
      </MapContainer>
    </div>
  )
}
