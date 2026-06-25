import { useState, useCallback } from 'react'
import type { TowerRow, TowerReportFilters, TowerOperatorKey } from '@/types/towerReport'
import { filterTowers } from '@/utils/towerReportFilter'

type AnyFeature = { properties: Record<string, unknown>; geometry: { type: string; coordinates: number[] } }
type GeoJSON    = { features: AnyFeature[] }

const cache: Record<string, GeoJSON> = {}

async function load(url: string): Promise<GeoJSON> {
  if (cache[url]) return cache[url]
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  cache[url] = await res.json()
  return cache[url]
}

interface UseTowerReportResult {
  results:  TowerRow[]
  loading:  boolean
  error:    string | null
  generate: (filters: TowerReportFilters) => Promise<void>
  clear:    () => void
}

export function useTowerReport(): UseTowerReportResult {
  const [results, setResults] = useState<TowerRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const generate = useCallback(async (filters: TowerReportFilters) => {
    const { level, area, operators } = filters
    if (!area || operators.size === 0) return

    setLoading(true)
    setError(null)

    try {
      const keys = [...operators] as TowerOperatorKey[]
      const loaded = await Promise.all(
        keys.map(k => load(`/data/tower-${k}.geojson`).then(g => ({ key: k, features: g.features })))
      )

      const rows: TowerRow[] = []
      for (const { key, features } of loaded) {
        rows.push(...filterTowers(key, features, level, area))
      }

      rows.sort((a, b) => a.operator.localeCompare(b.operator) || a.towerId.localeCompare(b.towerId))
      setResults(rows)
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
