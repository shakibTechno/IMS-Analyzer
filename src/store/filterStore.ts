import { create } from 'zustand'
import type { FilterState, TimePeriod } from '@/types/filters'
import type { SiteStatus, AssetType } from '@/types/site'
import type { OperatorType } from '@/types/operator'

// ─── Store shape: state + actions in one flat object ─────────────
interface FilterStore extends FilterState {
  // Setters
  setPeriod:       (period: TimePeriod) => void
  setDivision:     (division: string | null) => void
  setDistrict:     (district: string | null) => void
  setOperatorId:   (id: string | null) => void
  setOperatorType: (type: OperatorType | null) => void
  setAssetType:    (type: AssetType | null) => void
  setStatusFilter: (statuses: SiteStatus[] | null) => void
  resetFilters:    () => void

  // Derived helper
  hasActiveFilters: () => boolean
}

const DEFAULT_STATE: FilterState = {
  period:       'live',
  division:     null,
  district:     null,
  operatorId:   null,
  operatorType: null,
  assetType:    null,
  statusFilter: null,
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...DEFAULT_STATE,

  setPeriod:       (period)       => set({ period }),
  setDivision:     (division)     => set({ division, district: null }),  // reset district on division change
  setDistrict:     (district)     => set({ district }),
  setOperatorId:   (operatorId)   => set({ operatorId }),
  setOperatorType: (operatorType) => set({ operatorType, operatorId: null }),  // clear specific op when type changes
  setAssetType:    (assetType)    => set({ assetType }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  resetFilters:    ()             => set({ ...DEFAULT_STATE }),

  hasActiveFilters: () => {
    const s = get()
    return (
      s.division     !== null ||
      s.district     !== null ||
      s.operatorId   !== null ||
      s.operatorType !== null ||
      s.assetType    !== null ||
      s.statusFilter !== null
    )
  },
}))
