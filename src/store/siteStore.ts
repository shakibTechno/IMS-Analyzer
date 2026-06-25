import { create } from 'zustand'
import { SITES as INITIAL_SITES } from '@/data/sites'
import type { Site, SiteStatus } from '@/types/site'

// ─── Simulation constants ─────────────────────────────────────────
// Sylhet sites are locked to preserve the disaster response narrative.
// The simulation only fluctuates the other 42 sites.
const LOCKED_IDS = new Set([
  'SYL-001', 'SYL-002', 'SYL-003', 'SYL-004',
  'SYL-005', 'SYL-006', 'SYL-007', 'SYL-008',
])

// Per-status transition probabilities on each tick
// Weighted heavily toward active → keeps the dashboard mostly green
const TRANSITION: Record<SiteStatus, { to: SiteStatus; prob: number }[]> = {
  active:   [{ to: 'degraded', prob: 0.06 }],
  degraded: [{ to: 'active',   prob: 0.55 }, { to: 'down', prob: 0.10 }],
  down:     [{ to: 'degraded', prob: 0.25 }],
}

function nextStatus(current: SiteStatus, rand: number): SiteStatus {
  let cumulative = 0
  for (const { to, prob } of TRANSITION[current]) {
    cumulative += prob
    if (rand < cumulative) return to
  }
  return current
}

// ─── Store shape ──────────────────────────────────────────────────
interface SiteStore {
  sites:     Site[]
  tickCount: number   // monotone counter — useful for downstream deps
  tick:      () => void
}

export const useSiteStore = create<SiteStore>((set) => ({
  sites:     [...INITIAL_SITES],
  tickCount: 0,

  tick: () => set(state => {
    const sites = [...state.sites]
    const now   = new Date().toISOString()

    // Pick 2 random non-locked sites to potentially transition
    const candidates = sites
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => !LOCKED_IDS.has(s.id))

    // Shuffle and take up to 2
    for (let k = candidates.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [candidates[k], candidates[j]] = [candidates[j], candidates[k]]
    }

    for (const { s, i } of candidates.slice(0, 2)) {
      const newStatus = nextStatus(s.status, Math.random())
      const changed   = newStatus !== s.status

      if (changed) {
        sites[i] = {
          ...s,
          status:         newStatus,
          hasActiveOutage: newStatus !== 'active',
          lastSubmission: newStatus === 'active' ? now : s.lastSubmission,
          submissionStatus: newStatus === 'active' ? 'on_time' : s.submissionStatus,
        }
      } else if (s.status === 'active') {
        // Simulate a fresh submission heartbeat for active sites
        sites[i] = { ...s, lastSubmission: now }
      }
    }

    return { sites, tickCount: state.tickCount + 1 }
  }),
}))
