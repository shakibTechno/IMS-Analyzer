// ─── useKPIs ──────────────────────────────────────────────────────
// Derives KPI card values from the current filtered site list.
// Depends on useFilteredSites — re-computes whenever filters change.

import { useMemo } from 'react'
import { useFilteredSites } from './useFilteredSites'
import { getKPIs } from '@/utils/dataHelpers'
import type { KPIs } from '@/utils/dataHelpers'

export function useKPIs(): KPIs {
  const sites = useFilteredSites()
  return useMemo(() => getKPIs(sites), [sites])
}
