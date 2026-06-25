/**
 * Build bd-fiber-highways.geojson
 *
 * Takes the raw bd-highways.geojson (all trunk+primary segments) and:
 *  1. Filters to national highways N1–N8
 *  2. Assigns fiber metadata (tier, status, route name) per highway ref
 *  3. Handles multi-ref tags ("N1;N2" → segment appears in both groups)
 *  4. Outputs a tagged FeatureCollection ready for FiberOverlay
 *
 * Run: node scripts/build-fiber-highways.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir    = dirname(fileURLToPath(import.meta.url))
const ROOT     = resolve(__dir, '..')
const IN_FILE  = resolve(ROOT, 'public', 'data', 'bd-highways.geojson')
const OUT_FILE = resolve(ROOT, 'public', 'data', 'bd-fiber-highways.geojson')

// ── Fiber metadata per national highway ref ───────────────────────
// Maps each OSM highway ref to fiber route properties.
// Status reflects the current disaster scenario (Sylhet flood).
//   N1 : Dhaka–Chittagong           → Tier 1 backbone, active
//   N2 : Dhaka–Sylhet               → Tier 2, degraded (re-routed around Sylhet flood)
//   N3 : Dhaka–Mymensingh           → Tier 2, active
//   N4 : Dhaka–Rajshahi (Jamuna)    → Tier 1 backbone, active
//   N5 : Sirajganj–Rangpur          → Tier 1 backbone, active
//   N6 : Dhaka–Barisal (Padma)      → Tier 2, active
//   N7 : Khulna–Rajshahi (Kushtia)  → Tier 2, active
//   N8 : Barisal–Khulna             → Tier 2, active

const FIBER_META = {
  N1: { tier: 1, status: 'active',   name: 'N1 Backbone — Dhaka → Chittagong'         },
  N2: { tier: 2, status: 'degraded', name: 'N2 Corridor — Dhaka → Sylhet (degraded)'  },
  N3: { tier: 2, status: 'active',   name: 'N3 Corridor — Dhaka → Mymensingh'         },
  N4: { tier: 1, status: 'active',   name: 'N4 Backbone — Dhaka → Rajshahi'           },
  N5: { tier: 1, status: 'active',   name: 'N5 Backbone — Sirajganj → Rangpur'        },
  N6: { tier: 2, status: 'active',   name: 'N6 Padma Bridge — Dhaka → Barisal'        },
  N7: { tier: 2, status: 'active',   name: 'N7 West — Khulna → Rajshahi via Kushtia'  },
  N8: { tier: 2, status: 'active',   name: 'N8 Corridor — Barisal → Khulna'           },
}

const TARGET_REFS = new Set(Object.keys(FIBER_META))

// ── Parse multi-ref tag ("N1;N2" → ['N1','N2']) ───────────────────
function parseRefs(refTag) {
  if (!refTag) return []
  return refTag.split(/[;,]/).map(r => r.trim()).filter(r => TARGET_REFS.has(r))
}

// ── Main ──────────────────────────────────────────────────────────
const raw      = readFileSync(IN_FILE, 'utf8')
const highways = JSON.parse(raw)

const outFeatures = []

for (const feature of highways.features) {
  const refs = parseRefs(feature.properties.ref)
  if (refs.length === 0) continue

  // If a segment carries multiple refs (e.g. N4;N5 on a shared stretch),
  // emit one feature per ref so each gets the correct style.
  for (const ref of refs) {
    const meta = FIBER_META[ref]
    outFeatures.push({
      type: 'Feature',
      properties: {
        ref,
        tier:   meta.tier,
        status: meta.status,
        name:   meta.name,
        highway: feature.properties.highway,
        osm_id:  feature.properties.osm_id,
      },
      geometry: feature.geometry,   // already simplified LineString
    })
  }
}

// Summary
const summary = {}
outFeatures.forEach(f => {
  const r = f.properties.ref
  summary[r] = (summary[r] || 0) + 1
})
console.log('Segments per highway:')
Object.entries(summary).sort().forEach(([k,v]) => console.log(`  ${k}: ${v}`))

const fc   = { type: 'FeatureCollection', features: outFeatures }
const json = JSON.stringify(fc)
writeFileSync(OUT_FILE, json)
console.log(`\nWritten → bd-fiber-highways.geojson`)
console.log(`  ${outFeatures.length} segments, ${(json.length/1024).toFixed(1)} KB`)
