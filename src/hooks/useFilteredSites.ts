// ─── useFilteredSites ─────────────────────────────────────────────
// Reads sites from the live simulation store + the global filter state,
// returning the filtered subset.  Re-renders whenever filters or the
// simulation tick changes either site statuses.

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useFilterStore } from '@/store/filterStore'
import { useSiteStore }   from '@/store/siteStore'
import { getFilteredSites } from '@/utils/dataHelpers'
import type { Site } from '@/types/site'

// useShallow prevents the "getSnapshot should be cached" infinite loop in
// React 19: object literals returned from selectors get a new reference
// every call, which useSyncExternalStore treats as a state change.

export function useFilteredSites(): Site[] {
  const sites   = useSiteStore(s => s.sites)

  const filters = useFilterStore(useShallow(s => ({
    period:       s.period,
    division:     s.division,
    district:     s.district,
    operatorId:   s.operatorId,
    operatorType: s.operatorType,
    assetType:    s.assetType,
    statusFilter: s.statusFilter,
  })))

  return useMemo(
    () => getFilteredSites(sites, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      sites,                       // re-run when simulation mutates a site
      filters.period,
      filters.division,
      filters.district,
      filters.operatorId,
      filters.operatorType,
      filters.assetType,
      JSON.stringify(filters.statusFilter),
    ],
  )
}
