import { useState, useCallback } from 'react'
import type { BTSSite, BTSReportFilters, BTSOperatorKey, AdminLevel } from '@/types/btsReport'
import {
  filterGP,
  filterRobi,
  filterBanglalink,
  filterSummit,
} from '@/utils/btsReportFilter'

type AnyFeature = { properties: Record<string, unknown>; geometry: { type: string; coordinates: number[] } }
type GeoJSON    = { features: AnyFeature[] }
type BoundaryFeature = {
  properties: Record<string, unknown>
  geometry: { type: string; coordinates: unknown; geometries?: unknown[] }
}

const geoCache: Record<string, GeoJSON> = {}

async function load(url: string): Promise<GeoJSON> {
  if (geoCache[url]) return geoCache[url]
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  geoCache[url] = await res.json()
  return geoCache[url]
}

const DATA: Record<BTSOperatorKey, string> = {
  gp:         '/data/gp-sites.geojson',
  robi:       '/data/robi-sites.geojson',
  banglalink: '/data/bl-towers.geojson',
  summit:     '/data/summit-bts.geojson',
}

const BOUNDARY: Record<AdminLevel, string> = {
  division: '/data/bd-divisions.geojson',
  district: '/data/bd-districts.geojson',
  upazila:  '/data/bd-upazilas.geojson',
}

const NAME_FIELD: Record<AdminLevel, string> = {
  division: 'name',
  district: 'name',
  upazila:  'thana_name',
}

async function findBoundary(level: AdminLevel, area: string): Promise<BoundaryFeature | null> {
  const geo = await load(BOUNDARY[level]) as unknown as { features: BoundaryFeature[] }
  const field = NAME_FIELD[level]
  return geo.features.find(
    f => String(f.properties[field] ?? '').toLowerCase() === area.toLowerCase()
  ) ?? null
}

interface UseBTSReportResult {
  results:  BTSSite[]
  loading:  boolean
  error:    string | null
  generate: (filters: BTSReportFilters) => Promise<void>
  clear:    () => void
}

export function useBTSReport(): UseBTSReportResult {
  const [results, setResults] = useState<BTSSite[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const generate = useCallback(async (filters: BTSReportFilters) => {
    const { level, area, operators } = filters
    if (!area || operators.size === 0) return

    setLoading(true)
    setError(null)

    try {
      const keys = [...operators] as BTSOperatorKey[]

      const [loaded, boundary] = await Promise.all([
        Promise.all(keys.map(k => load(DATA[k]).then(g => ({ key: k, features: g.features })))),
        operators.has('summit') ? findBoundary(level, area) : Promise.resolve(null),
      ])

      const sites: BTSSite[] = []

      for (const { key, features } of loaded) {
        switch (key) {
          case 'gp':
            sites.push(...filterGP(features, level, area))
            break
          case 'robi':
            sites.push(...filterRobi(features, level, area))
            break
          case 'banglalink':
            sites.push(...filterBanglalink(features, level, area))
            break
          case 'summit':
            if (boundary) {
              sites.push(...filterSummit(
                features,
                boundary.geometry as Parameters<typeof filterSummit>[1],
                area,
              ))
            }
            break
        }
      }

      sites.sort((a, b) => a.operator.localeCompare(b.operator) || a.siteName.localeCompare(b.siteName))
      setResults(sites)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return { results, loading, error, generate, clear }
}
