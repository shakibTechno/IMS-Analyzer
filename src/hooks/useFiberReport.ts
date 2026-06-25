import { useState, useCallback } from 'react'
import type { FiberSegment, ReportFilters, OperatorKey, AdminLevel } from '@/types/fiberReport'
import {
  filterBTCL,
  filterBanglalink,
  filterBahon,
  filterBRFiber,
  filterIS3,
  filterOprLines,
} from '@/utils/fiberReportFilter'

type GeoFeature = { properties: Record<string, unknown> }
type GeoJSON    = { features: GeoFeature[] }

const cache: Record<string, GeoJSON> = {}

async function loadGeoJSON(url: string): Promise<GeoJSON> {
  if (cache[url]) return cache[url]
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  cache[url] = await res.json()
  return cache[url]
}

const DATA: Record<OperatorKey, string> = {
  btcl:       '/data/fiber-lines.geojson',
  banglalink: '/data/bl-lines.geojson',
  bahon:      '/data/bahon-lines.geojson',
  brfiber:    '/data/br-fiber-lines.geojson',
  is3:        '/data/is3-lines.geojson',
  oprlines:   '/data/opr-lines.geojson',
}

interface UseFiberReportResult {
  results:    FiberSegment[]
  loading:    boolean
  error:      string | null
  generate:   (filters: ReportFilters) => Promise<void>
  clear:      () => void
}

export function useFiberReport(): UseFiberReportResult {
  const [results, setResults] = useState<FiberSegment[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const generate = useCallback(async (filters: ReportFilters) => {
    const { level, origin, destination, operators } = filters
    if (!origin || !destination || operators.size === 0) return

    setLoading(true)
    setError(null)

    try {
      const keys = [...operators] as OperatorKey[]
      const loaded = await Promise.all(
        keys.map(k => loadGeoJSON(DATA[k]).then(g => ({ key: k, features: g.features })))
      )

      const segments: FiberSegment[] = []

      for (const { key, features } of loaded) {
        switch (key) {
          case 'btcl':
            segments.push(...filterBTCL(features, origin, destination))
            break
          case 'banglalink':
            segments.push(...filterBanglalink(features, level, origin, destination))
            break
          case 'bahon':
            segments.push(...filterBahon(features, level, origin, destination))
            break
          case 'brfiber':
            segments.push(...filterBRFiber(features, origin, destination))
            break
          case 'is3':
            segments.push(...filterIS3(features, origin, destination))
            break
          case 'oprlines':
            segments.push(...filterOprLines(features, origin, destination))
            break
        }
      }

      // Sort: both > origin > destination
      const order: Record<FiberSegment['matchSide'], number> = {
        both: 0, origin: 1, destination: 2, all: 3,
      }
      segments.sort((a, b) => order[a.matchSide] - order[b.matchSide])

      setResults(segments)
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

// ─── Admin options loader ─────────────────────────────────────────
const adminCache: Record<string, string[]> = {}

export async function loadAdminOptions(level: AdminLevel): Promise<string[]> {
  if (adminCache[level]) return adminCache[level]

  const urls: Record<AdminLevel, string> = {
    division: '/data/bd-divisions.geojson',
    district: '/data/bd-districts.geojson',
    upazila:  '/data/bd-upazilas.geojson',
  }
  const nameField: Record<AdminLevel, string> = {
    division: 'name',
    district: 'name',
    upazila:  'thana_name',
  }

  const res = await fetch(urls[level])
  const geo: GeoJSON = await res.json()
  const field = nameField[level]
  const names = [...new Set(
    geo.features
      .map(f => String(f.properties[field] ?? ''))
      .filter(Boolean)
  )].sort()

  adminCache[level] = names
  return names
}
