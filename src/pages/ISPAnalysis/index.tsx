import { useState, useEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Cell,
} from 'recharts'
import BaseMap        from '@/components/map/BaseMap'
import SimplePieChart from '@/components/charts/SimplePieChart'
import Pagination     from '@/components/shared/Pagination'

// ─── Types ────────────────────────────────────────────────────────
interface ISPPop {
  name:         string
  license_type: string
  nttn:         string
  district:     string
  division:     string
  upazila:      string
  lat:          number
  lon:          number
}

interface Filters {
  division:    string
  district:    string
  upazila:     string
  licenseType: string
  nttn:        string
  ispName:     string
}

interface ISPRow {
  name:        string
  licenseType: string
  nttn:        string
  popCount:    number
  divisions:   number
  districts:   number
  upazilas:    number
}

// ─── Color maps ───────────────────────────────────────────────────
const LICENSE_COLORS: Record<string, string> = {
  'Nationwide': '#6366f1',
  'Divisional': '#3b82f6',
  'District':   '#10b981',
  'Upazila':    '#f59e0b',
}
const NTTN_COLORS: Record<string, string> = {
  'Summit Communications': '#8b5cf6',
  'Fiber@Home Limited':    '#0ea5e9',
  'Bahon Limited':         '#10b981',
  'BTCL':                  '#f97316',
}
const FALLBACK_COLOR = '#94a3b8'
const BD_CENTER: [number, number] = [23.685, 90.356]

// ─── Module-level cache ───────────────────────────────────────────
let _dataCache: ISPPop[] | null = null
let _loadingPromise: Promise<ISPPop[]> | null = null

async function fetchISPData(): Promise<ISPPop[]> {
  if (_dataCache) return _dataCache
  if (_loadingPromise) return _loadingPromise
  _loadingPromise = fetch('/data/isp-pops-full.geojson')
    .then(r => r.json())
    .then(gj => {
      _dataCache = (gj.features as any[])
        .map(f => ({
          name:         String(f.properties?.name         ?? ''),
          license_type: String(f.properties?.license_type ?? ''),
          nttn:         String(f.properties?.nttn         ?? ''),
          district:     String(f.properties?.district     ?? ''),
          division:     String(f.properties?.division     ?? ''),
          upazila:      String(f.properties?.upazila      ?? ''),
          lat:          f.geometry?.coordinates?.[1] ?? 0,
          lon:          f.geometry?.coordinates?.[0] ?? 0,
        }))
        .filter(p => p.lat !== 0 && p.lon !== 0)
      return _dataCache
    })
  return _loadingPromise
}

function useISPData() {
  const [data,    setData]    = useState<ISPPop[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchISPData().then(d => { setData(d); setLoading(false) })
  }, [])
  return { data, loading }
}

// ─── Map layer ────────────────────────────────────────────────────
function ISPMapLayer({ pops }: { pops: ISPPop[] }) {
  const map = useMap()
  useEffect(() => {
    const renderer = L.canvas({ padding: 0.5 })
    const group    = L.layerGroup().addTo(map)
    pops.forEach(p => {
      const color  = LICENSE_COLORS[p.license_type] ?? FALLBACK_COLOR
      const marker = L.circleMarker([p.lat, p.lon], {
        radius: 3, fillColor: color, color: 'white', weight: 0.5, fillOpacity: 0.85, renderer,
      })
      const row = (k: string, v: string) =>
        v ? `<tr><td style="color:#94a3b8;font-weight:600;padding:2px 10px 2px 0;white-space:nowrap;font-size:11px">${k}</td>` +
            `<td style="color:#1e293b;font-size:11px;max-width:200px;word-break:break-word">${v}</td></tr>` : ''
      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:210px">
          <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:6px">${p.name || '—'}</div>
          <table style="border-collapse:collapse;width:100%">
            ${row('License',  p.license_type)}
            ${row('NTTN',     p.nttn)}
            ${row('Division', p.division)}
            ${row('District', p.district)}
            ${row('Upazila',  p.upazila)}
          </table>
        </div>`, { maxWidth: 320, offset: L.point(0, -4) })
      marker.bindTooltip(
        `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${p.name || '—'}</span>`,
        { sticky: true, offset: [10, 0], opacity: 0.95 })
      group.addLayer(marker)
    })
    if (pops.length > 0) {
      try {
        const bounds = L.latLngBounds(pops.map(p => [p.lat, p.lon] as [number, number]))
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
      } catch { /* border guard */ }
    } else {
      map.setView(BD_CENTER, 7)
    }
    return () => { group.remove() }
  }, [map, pops])
  return null
}

// ─── Boundary highlight layer ─────────────────────────────────────
type BoundaryLevel = 'division' | 'district' | 'upazila'

const BOUNDARY_URLS: Record<BoundaryLevel, string> = {
  division: '/data/bd-divisions.geojson',
  district: '/data/bd-districts.geojson',
  upazila:  '/data/bd-upazilas.geojson',
}

// ISP data uses upazila-GeoJSON division names; bd-divisions.geojson uses official names
const DIV_TO_GEO: Record<string, string> = {
  'Barisal':    'Barishal',
  'Chittagong': 'Chattogram',
}

function getPropName(level: BoundaryLevel, props: Record<string, unknown>): string {
  if (level === 'upazila') return String(props.thana_name ?? '')
  return String(props.name ?? '')
}

function ISPBoundaryLayer({ division, district, upazila }: { division: string; district: string; upazila: string }) {
  const map = useMap()
  const level: BoundaryLevel | null = upazila ? 'upazila' : district ? 'district' : division ? 'division' : null
  const rawSelected = upazila || district || division
  const selected = level === 'division' ? (DIV_TO_GEO[rawSelected] ?? rawSelected) : rawSelected

  useEffect(() => {
    if (!level || !selected) return
    let geoLayer: L.GeoJSON | null = null
    fetch(BOUNDARY_URLS[level])
      .then(r => r.json())
      .then(gj => {
        geoLayer = L.geoJSON(gj, {
          style: (feature) => {
            const name = getPropName(level, (feature?.properties ?? {}) as Record<string, unknown>)
            return name.toLowerCase() === selected.toLowerCase()
              ? { fillColor: '#3b82f6', fillOpacity: 0.10, color: '#1d4ed8', weight: 2.5, opacity: 1 }
              : { fillColor: 'transparent', fillOpacity: 0, color: '#94a3b8', weight: 0.4, opacity: 0.28 }
          },
        }).addTo(map)
      })
      .catch(() => {})
    return () => { geoLayer?.remove() }
  }, [map, level, selected])

  return null
}

// ─── Map panel ────────────────────────────────────────────────────
interface MapPanelProps {
  pops:     ISPPop[]
  label:    string
  division: string
  district: string
  upazila:  string
}

function ISPAnalysisMap({ pops, label, division, district, upazila }: MapPanelProps) {
  const licCounts = useMemo(() => {
    const m: Record<string, number> = {}
    pops.forEach(p => { m[p.license_type] = (m[p.license_type] ?? 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [pops])

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ISP PoP Map — {label}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            {pops.length.toLocaleString()} PoPs · color = license type · click for details
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', justifyContent: 'flex-end', maxWidth: '55%' }}>
          {licCounts.map(([type, count]) => (
            <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: LICENSE_COLORS[type] ?? FALLBACK_COLOR, flexShrink: 0 }} />
              {type} ({count.toLocaleString()})
            </span>
          ))}
        </div>
      </div>
      <BaseMap center={BD_CENTER} zoom={7} minZoom={5} style={{ flex: 1, minHeight: 300 }}>
        <ISPBoundaryLayer division={division} district={district} upazila={upazila} />
        <ISPMapLayer pops={pops} />
      </BaseMap>
    </div>
  )
}

// ─── KPI cards ────────────────────────────────────────────────────
function KPICards({ pops }: { pops: ISPPop[] }) {
  const uniq = (k: keyof ISPPop) => new Set(pops.map(p => p[k]).filter(Boolean)).size
  const cards = [
    { label: 'Total PoPs',  value: pops.length.toLocaleString(),   color: '#3b82f6' },
    { label: 'Unique ISPs', value: uniq('name').toLocaleString(),   color: '#10b981' },
    { label: 'Divisions',   value: uniq('division').toLocaleString(), color: '#6366f1' },
    { label: 'Districts',   value: uniq('district').toLocaleString(), color: '#f59e0b' },
    { label: 'Upazilas',    value: uniq('upazila').toLocaleString(),  color: '#ec4899' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${c.color}` }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 5 }}>{c.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Area bar chart ───────────────────────────────────────────────
function AreaBarChart({ pops, division }: { pops: ISPPop[]; division: string }) {
  const keyField: keyof ISPPop = division ? 'district' : 'division'
  const axisLabel = division ? 'District' : 'Division'
  const data = useMemo(() => {
    const m: Record<string, number> = {}
    pops.forEach(p => { const k = p[keyField] || 'Unknown'; m[k] = (m[k] ?? 0) + 1 })
    return Object.entries(m).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 15)
  }, [pops, keyField])
  if (!data.length) return null
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
        PoPs by {axisLabel}
      </div>
      <ResponsiveContainer width="100%" height={Math.min(data.length * 22 + 20, 220)}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} width={95} />
          <RTooltip formatter={(v) => [Number(v).toLocaleString(), 'PoPs']} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => <Cell key={i} fill={`hsl(${215 - i * 7}, 72%, ${55 + i * 1.5}%)`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Top ISPs mini bars ───────────────────────────────────────────
function TopISPs({ pops }: { pops: ISPPop[] }) {
  const data = useMemo(() => {
    const m: Record<string, number> = {}
    pops.forEach(p => { if (p.name) m[p.name] = (m[p.name] ?? 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 10)
  }, [pops])
  const max = data[0]?.[1] ?? 1
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
        Top ISPs by PoP Count
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {data.map(([name, count], i) => (
          <div key={name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-primary)', fontWeight: i === 0 ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '78%' }}>{name}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3b82f6', marginLeft: 6, flexShrink: 0 }}>{count}</span>
            </div>
            <div style={{ height: 5, background: 'var(--border)', borderRadius: 3 }}>
              <div style={{ height: '100%', borderRadius: 3, background: `hsl(${215 - i * 12}, 72%, 55%)`, width: `${(count / max) * 100}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ISP Summary Table ────────────────────────────────────────────
type ISPRowSortKey = 'name' | 'popCount' | 'divisions' | 'districts' | 'upazilas' | 'licenseType' | 'nttn'

function ISPSummaryTable({ pops }: { pops: ISPPop[] }) {
  const [sortKey, setSortKey] = useState<ISPRowSortKey>('popCount')
  const [sortAsc, setSortAsc] = useState(false)
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(1)
  const [pageSize,setPageSize]= useState(25)

  const rows = useMemo((): ISPRow[] => {
    const m: Record<string, ISPPop[]> = {}
    pops.forEach(p => { if (p.name) (m[p.name] ??= []).push(p) })
    return Object.entries(m).map(([name, ps]) => {
      // most common NTTN for this ISP
      const nttnCounts: Record<string, number> = {}
      ps.forEach(p => { if (p.nttn) nttnCounts[p.nttn] = (nttnCounts[p.nttn] ?? 0) + 1 })
      const topNttn = Object.entries(nttnCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
      return {
        name,
        licenseType: ps[0]?.license_type ?? '',
        nttn:        topNttn,
        popCount:    ps.length,
        divisions:   new Set(ps.map(p => p.division).filter(Boolean)).size,
        districts:   new Set(ps.map(p => p.district).filter(Boolean)).size,
        upazilas:    new Set(ps.map(p => p.upazila).filter(Boolean)).size,
      }
    })
  }, [pops])

  const maxPops = useMemo(() => Math.max(...rows.map(r => r.popCount), 1), [rows])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(r => !q || r.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        const cmp = typeof av === 'number' ? (av as number) - (bv as number) : String(av).localeCompare(String(bv))
        return sortAsc ? cmp : -cmp
      })
  }, [rows, search, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible    = filtered.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(k: ISPRowSortKey) {
    if (sortKey === k) setSortAsc(v => !v)
    else { setSortKey(k); setSortAsc(k === 'name') }
    setPage(1)
  }

  function exportCSV() {
    const hdr  = ['ISP Name', 'License Type', 'Primary NTTN', 'POP Count', 'Divisions', 'Districts', 'Upazilas']
    const rows2 = filtered.map(r => [`"${r.name.replace(/"/g,'""')}"`, r.licenseType, r.nttn, r.popCount, r.divisions, r.districts, r.upazilas])
    const blob = new Blob([[hdr,...rows2].map(r=>r.join(',')).join('\n')],{type:'text/csv'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'isp-summary.csv'; a.click()
  }

  const thSty = (k: ISPRowSortKey, right = false, minW = 90): React.CSSProperties => ({
    padding: '8px 12px', textAlign: right ? 'right' : 'left', fontSize: 11, fontWeight: 700,
    color: sortKey === k ? '#1d4ed8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em',
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
    borderBottom: '2px solid var(--border)', background: 'var(--card-bg-2)', minWidth: minW,
  })
  const tdS: React.CSSProperties = { padding: '7px 12px', fontSize: 12, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>ISP Summary</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{rows.length} ISPs · {pops.length.toLocaleString()} total PoPs</div>
        </div>
        <input type="text" placeholder="Search ISP name…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ padding: '6px 11px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', width: 200 }} />
        <button onClick={exportCSV} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #d1fae5', background: '#ecfdf5', color: '#065f46', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>↓ CSV</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thSty('name', false, 36), cursor: 'default', color: '#64748b' }}>#</th>
              <th style={thSty('name', false, 220)} onClick={() => toggleSort('name')}>ISP Name {sortKey==='name'?(sortAsc?'↑':'↓'):''}</th>
              <th style={thSty('licenseType', false, 110)} onClick={() => toggleSort('licenseType')}>License {sortKey==='licenseType'?(sortAsc?'↑':'↓'):''}</th>
              <th style={thSty('nttn', false, 160)} onClick={() => toggleSort('nttn')}>NTTN {sortKey==='nttn'?(sortAsc?'↑':'↓'):''}</th>
              <th style={thSty('popCount', true, 120)} onClick={() => toggleSort('popCount')}>PoP Count {sortKey==='popCount'?(sortAsc?'↑':'↓'):''}</th>
              <th style={{ ...thSty('divisions', false, 180), cursor: 'default', color: '#64748b' }}>Coverage</th>
              <th style={thSty('divisions', true, 50)} onClick={() => toggleSort('divisions')}>Div {sortKey==='divisions'?(sortAsc?'↑':'↓'):''}</th>
              <th style={thSty('districts', true, 50)} onClick={() => toggleSort('districts')}>Dist {sortKey==='districts'?(sortAsc?'↑':'↓'):''}</th>
              <th style={thSty('upazilas', true, 50)} onClick={() => toggleSort('upazilas')}>Upa {sortKey==='upazilas'?(sortAsc?'↑':'↓'):''}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => {
              const rank  = (page - 1) * pageSize + i + 1
              const lc    = LICENSE_COLORS[r.licenseType] ?? FALLBACK_COLOR
              const nc    = NTTN_COLORS[r.nttn] ?? FALLBACK_COLOR
              const barW  = `${(r.popCount / maxPops) * 100}%`
              return (
                <tr key={r.name} style={{ background: i % 2 === 0 ? 'var(--card-bg)' : 'var(--card-bg-2)' }}>
                  <td style={{ ...tdS, color: '#94a3b8', fontSize: 11, textAlign: 'right' }}>{rank}</td>
                  <td style={{ ...tdS, fontWeight: 500, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</td>
                  <td style={tdS}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: lc + '1a', color: lc }}>
                      {r.licenseType || '—'}
                    </span>
                  </td>
                  <td style={tdS}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: nc + '18', color: nc }}>
                      {r.nttn || '—'}
                    </span>
                  </td>
                  <td style={{ ...tdS, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <div style={{ width: 60, height: 6, background: 'var(--border)', borderRadius: 3, flexShrink: 0 }}>
                        <div style={{ height: '100%', borderRadius: 3, background: lc, width: barW, transition: 'width 0.3s ease' }} />
                      </div>
                      <span style={{ fontWeight: 700, color: '#1d4ed8', minWidth: 36, textAlign: 'right' }}>{r.popCount}</span>
                    </div>
                  </td>
                  <td style={{ ...tdS, fontSize: 11, color: '#64748b' }}>
                    {r.divisions > 0 ? `${r.divisions} div · ${r.districts} dist · ${r.upazilas} upa` : '—'}
                  </td>
                  <td style={{ ...tdS, textAlign: 'right', color: '#64748b' }}>{r.divisions}</td>
                  <td style={{ ...tdS, textAlign: 'right', color: '#64748b' }}>{r.districts}</td>
                  <td style={{ ...tdS, textAlign: 'right', color: '#64748b' }}>{r.upazilas}</td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 36, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No ISPs found.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1) }} />
      </div>
    </div>
  )
}

// ─── Individual PoP data table ────────────────────────────────────
type SortKey = 'name' | 'license_type' | 'nttn' | 'division' | 'district' | 'upazila'

function ISPDataTable({ pops, label }: { pops: ISPPop[]; label: string }) {
  const [sortKey,  setSortKey]  = useState<SortKey>('name')
  const [sortAsc,  setSortAsc]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(v => !v)
    else { setSortKey(k); setSortAsc(true) }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return pops
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.district.toLowerCase().includes(q) || p.upazila.toLowerCase().includes(q) || p.division.toLowerCase().includes(q) || p.nttn.toLowerCase().includes(q))
      .sort((a, b) => {
        const cmp = a[sortKey].localeCompare(b[sortKey], undefined, { sensitivity: 'base' })
        return sortAsc ? cmp : -cmp
      })
  }, [pops, search, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible    = filtered.slice((page - 1) * pageSize, page * pageSize)

  function exportCSV() {
    const hdr  = ['ISP Name', 'License Type', 'NTTN', 'Division', 'District', 'Upazila', 'Lat', 'Lon']
    const rows = filtered.map(p => [`"${p.name.replace(/"/g,'""')}"`, p.license_type, p.nttn, p.division, p.district, p.upazila, p.lat, p.lon])
    const blob = new Blob([[hdr,...rows].map(r=>r.join(',')).join('\n')],{type:'text/csv'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `isp-pops-${(label||'all').replace(/[^a-zA-Z0-9-_]/g,'_')}.csv`; a.click()
  }

  const th = (k: SortKey, lbl: string, minW = 110) => (
    <th key={k} onClick={() => toggleSort(k)} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: sortKey===k?'#1d4ed8':'#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', borderBottom: '2px solid var(--border)', background: 'var(--card-bg-2)', minWidth: minW }}>
      {lbl} {sortKey===k?(sortAsc?'↑':'↓'):''}
    </th>
  )
  const tdS: React.CSSProperties = { padding: '7px 12px', fontSize: 12, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search ISP name, NTTN, district, upazila…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ flex: 1, minWidth: 240, padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{filtered.length.toLocaleString()}</strong> PoPs
        </span>
        <button onClick={exportCSV} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #d1fae5', background: '#ecfdf5', color: '#065f46', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>↓ CSV</button>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {th('name',         'ISP Name',     200)}
              {th('license_type', 'License Type', 120)}
              {th('nttn',         'NTTN',         160)}
              {th('division',     'Division')}
              {th('district',     'District')}
              {th('upazila',      'Upazila')}
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => {
              const lc = LICENSE_COLORS[p.license_type] ?? FALLBACK_COLOR
              const nc = NTTN_COLORS[p.nttn]            ?? FALLBACK_COLOR
              return (
                <tr key={i} style={{ background: i%2===0?'var(--card-bg)':'var(--card-bg-2)' }}>
                  <td style={{ ...tdS, fontWeight: 500 }}>{p.name || '—'}</td>
                  <td style={tdS}>
                    <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700, background:lc+'1a', color:lc }}>{p.license_type||'—'}</span>
                  </td>
                  <td style={tdS}>
                    <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600, background:nc+'18', color:nc }}>{p.nttn||'—'}</span>
                  </td>
                  <td style={tdS}>{p.division||'—'}</td>
                  <td style={tdS}>{p.district||'—'}</td>
                  <td style={tdS}>{p.upazila ||'—'}</td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#94a3b8', fontSize:13 }}>No ISP PoPs found.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} onPageSizeChange={s=>{setPageSize(s);setPage(1)}} />
      </div>
    </div>
  )
}

// ─── Searchable ISP combobox ──────────────────────────────────────
function ISPCombobox({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [query, setQuery] = useState('')
  const [open,  setOpen]  = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery('') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const visible = useMemo(() => { const q = query.toLowerCase(); return q ? options.filter(o => o.toLowerCase().includes(q)) : options }, [options, query])
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input type="text" value={open ? query : value} placeholder="All ISPs"
          onFocus={() => { setOpen(true); setQuery('') }}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          style={{ width: '100%', padding: '8px 30px 8px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        {value
          ? <button onMouseDown={e => { e.preventDefault(); onChange(''); setQuery(''); setOpen(false) }} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16, lineHeight:1, padding:2 }}>×</button>
          : <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:10, pointerEvents:'none' }}>▼</span>
        }
      </div>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 2px)', left:0, right:0, background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.15)', zIndex:200, maxHeight:220, overflowY:'auto' }}>
          <div onMouseDown={e => { e.preventDefault(); onChange(''); setQuery(''); setOpen(false) }} style={{ padding:'8px 12px', fontSize:12, color:'#94a3b8', cursor:'pointer', borderBottom:'1px solid var(--border)' }}>— All ISPs —</div>
          {visible.slice(0, 60).map(o => (
            <div key={o} onMouseDown={e => { e.preventDefault(); onChange(o); setQuery(''); setOpen(false) }}
              style={{ padding:'8px 12px', fontSize:12, cursor:'pointer', color:o===value?'#1d4ed8':'var(--text-primary)', background:o===value?'#eff6ff':'transparent', fontWeight:o===value?700:400 }}
              onMouseEnter={e => { if (o!==value) (e.currentTarget as HTMLElement).style.background='var(--card-bg-2)' }}
              onMouseLeave={e => { if (o!==value) (e.currentTarget as HTMLElement).style.background='transparent' }}
            >{o}</div>
          ))}
          {visible.length > 60 && <div style={{ padding:'6px 12px', fontSize:11, color:'#94a3b8', borderTop:'1px solid var(--border)', fontStyle:'italic' }}>{visible.length - 60} more — type to narrow</div>}
          {visible.length === 0 && <div style={{ padding:'12px', fontSize:12, color:'#94a3b8', textAlign:'center' }}>No match</div>}
        </div>
      )}
    </div>
  )
}

// ─── Filter panel ─────────────────────────────────────────────────
const selectSty: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 7,
  border: '1px solid var(--border)', background: 'var(--card-bg)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer',
}
function FilterLabel({ text }: { text: string }) {
  return <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{text}</label>
}

function FilterPanel({ allData, onAnalyze, loading }: { allData: ISPPop[]; onAnalyze: (f: Filters) => void; loading: boolean }) {
  const [division,    setDivision]    = useState('')
  const [district,    setDistrict]    = useState('')
  const [upazila,     setUpazila]     = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [nttn,        setNttn]        = useState('')
  const [ispName,     setIspName]     = useState('')

  const divisions    = useMemo(() => [...new Set(allData.map(p => p.division).filter(Boolean))].sort(), [allData])
  const districts    = useMemo(() => [...new Set(allData.filter(p => !division || p.division===division).map(p => p.district).filter(Boolean))].sort(), [allData, division])
  const upazilas     = useMemo(() => [...new Set(allData.filter(p => (!division||p.division===division)&&(!district||p.district===district)).map(p => p.upazila).filter(Boolean))].sort(), [allData, division, district])
  const licenseTypes = useMemo(() => [...new Set(allData.map(p => p.license_type).filter(Boolean))].sort(), [allData])
  const nttnProviders= useMemo(() => [...new Set(allData.map(p => p.nttn).filter(Boolean))].sort(), [allData])
  const ispNames     = useMemo(() => [...new Set(allData.filter(p =>
    (!division||p.division===division)&&(!district||p.district===district)&&
    (!upazila||p.upazila===upazila)&&(!licenseType||p.license_type===licenseType)&&(!nttn||p.nttn===nttn)
  ).map(p => p.name).filter(Boolean))].sort(), [allData, division, district, upazila, licenseType, nttn])

  function resetAll() { setDivision(''); setDistrict(''); setUpazila(''); setLicenseType(''); setNttn(''); setIspName('') }
  const activeCount = [division, district, upazila, licenseType, nttn, ispName].filter(Boolean).length

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border)', padding: 20, marginBottom: 20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
          Filter Parameters
          {activeCount > 0 && <span style={{ marginLeft:8, fontSize:11, fontWeight:700, color:'#1d4ed8', background:'#eff6ff', borderRadius:9999, padding:'1px 8px' }}>{activeCount} active</span>}
        </div>
        {activeCount > 0 && <button onClick={resetAll} style={{ fontSize:11, color:'#64748b', background:'none', border:'1px solid var(--border)', borderRadius:5, padding:'3px 9px', cursor:'pointer' }}>Clear all</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 14, marginBottom: 18 }}>
        <div>
          <FilterLabel text="Division" />
          <select value={division} onChange={e => { setDivision(e.target.value); setDistrict(''); setUpazila(''); setIspName('') }} style={selectSty}>
            <option value="">All Divisions</option>
            {divisions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <FilterLabel text="District" />
          <select value={district} onChange={e => { setDistrict(e.target.value); setUpazila(''); setIspName('') }} style={selectSty} disabled={!division}>
            <option value="">All Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <FilterLabel text="Upazila" />
          <select value={upazila} onChange={e => { setUpazila(e.target.value); setIspName('') }} style={selectSty} disabled={!district}>
            <option value="">All Upazilas</option>
            {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <FilterLabel text="License Type" />
          <select value={licenseType} onChange={e => { setLicenseType(e.target.value); setIspName('') }} style={selectSty}>
            <option value="">All Types</option>
            {licenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <FilterLabel text="NTTN Provider" />
          <select value={nttn} onChange={e => { setNttn(e.target.value); setIspName('') }} style={selectSty}>
            <option value="">All NTTNs</option>
            {nttnProviders.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <FilterLabel text="ISP Name" />
          <ISPCombobox value={ispName} onChange={setIspName} options={ispNames} />
        </div>
      </div>

      <button onClick={() => onAnalyze({ division, district, upazila, licenseType, nttn, ispName })} disabled={loading}
        style={{ padding:'10px 28px', borderRadius:8, border:'none', background:loading?'#e2e8f0':'#1d4ed8', color:loading?'#94a3b8':'white', fontSize:13, fontWeight:700, cursor:loading?'not-allowed':'pointer', transition:'background 0.15s' }}>
        {loading ? 'Loading data…' : 'Analyze'}
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────
export default function ISPAnalysis() {
  const { data, loading } = useISPData()
  const [filters,  setFilters]  = useState<Filters | null>(null)
  const [analyzed, setAnalyzed] = useState(false)

  const filtered = useMemo(() => {
    if (!filters) return data
    return data.filter(p =>
      (!filters.division    || p.division    === filters.division)    &&
      (!filters.district    || p.district    === filters.district)    &&
      (!filters.upazila     || p.upazila     === filters.upazila)     &&
      (!filters.licenseType || p.license_type === filters.licenseType) &&
      (!filters.nttn        || p.nttn        === filters.nttn)        &&
      (!filters.ispName     || p.name        === filters.ispName)
    )
  }, [data, filters])

  const areaLabel = useMemo(() => {
    if (!filters) return 'All Bangladesh'
    const parts = [filters.ispName, filters.upazila, filters.district, filters.division, filters.licenseType, filters.nttn].filter(Boolean)
    return parts.length ? parts.join(', ') : 'All Bangladesh'
  }, [filters])

  const licenseData = useMemo(() => {
    const m: Record<string, number> = {}
    filtered.forEach(p => { if (p.license_type) m[p.license_type] = (m[p.license_type] ?? 0) + 1 })
    return Object.entries(m).map(([name, value]) => ({ name, value, color: LICENSE_COLORS[name] ?? FALLBACK_COLOR }))
  }, [filtered])

  const nttnData = useMemo(() => {
    const m: Record<string, number> = {}
    filtered.forEach(p => { if (p.nttn) m[p.nttn] = (m[p.nttn] ?? 0) + 1 })
    return Object.entries(m).map(([name, value]) => ({ name, value, color: NTTN_COLORS[name] ?? FALLBACK_COLOR }))
  }, [filtered])

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto', background: 'var(--bg-base)', minHeight: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>ISP POP Analysis</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          {loading ? 'Loading ISP data…' : `Geographic analysis of ${data.length.toLocaleString()} licensed ISP Points of Presence · ${new Set(data.map(p=>p.name)).size} ISPs across Bangladesh.`}
        </p>
      </div>

      <FilterPanel allData={data} onAnalyze={f => { setFilters(f); setAnalyzed(true) }} loading={loading} />

      {loading && <div style={{ padding:48, textAlign:'center', color:'var(--text-secondary)', fontSize:13 }}>Loading ISP POP data…</div>}

      {analyzed && !loading && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Results — {areaLabel}</h2>
            <button onClick={() => { setAnalyzed(false); setFilters(null) }} style={{ fontSize:12, color:'var(--text-secondary)', background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'3px 10px', cursor:'pointer' }}>Reset</button>
          </div>

          <KPICards pops={filtered} />

          {/* Map + charts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:16, marginBottom:20, alignItems:'stretch' }}>
            <ISPAnalysisMap pops={filtered} label={areaLabel} division={filters?.division ?? ''} district={filters?.district ?? ''} upazila={filters?.upazila ?? ''} />
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <AreaBarChart pops={filtered} division={filters?.division ?? ''} />
              <SimplePieChart title="PoPs by License Type" data={licenseData} />
              <SimplePieChart title="PoPs by NTTN Provider" data={nttnData} />
              <TopISPs pops={filtered} />
            </div>
          </div>

          {/* ISP summary table */}
          <ISPSummaryTable pops={filtered} />

          {/* Individual PoP records */}
          <div style={{ background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:10, padding:16, marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:14 }}>Individual PoP Records</div>
            <ISPDataTable pops={filtered} label={areaLabel} />
          </div>
        </>
      )}
    </div>
  )
}
