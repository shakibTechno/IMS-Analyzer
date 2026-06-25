// ─── useSimulation ────────────────────────────────────────────────
// Mounts a setInterval that fires the site store's tick() action.
// Call this once at the app root — only one timer should be running.
//
// interval: ms between ticks.  Default 10 s — fast enough to look
// "live" in a demo, slow enough not to distract from navigation.

import { useEffect } from 'react'
import { useSiteStore } from '@/store/siteStore'

export function useSimulation(intervalMs = 10_000) {
  const tick = useSiteStore(s => s.tick)

  useEffect(() => {
    const id = setInterval(tick, intervalMs)
    return () => clearInterval(id)
  }, [tick, intervalMs])
}
