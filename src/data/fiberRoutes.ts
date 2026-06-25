// ─── BTCL Nationwide Optical Fiber Network ────────────────────────
//
// Topology traced from the official BTCL fiber network map (2012).
// Waypoints follow highway Right-of-Way corridors between each node.
//
// Network structure:
//
//   TIER 1 — National backbone trunks
//     • Western Backbone : Chapai Nawabganj → Rajshahi → Natore →
//                          Sirajganj → Tangail → Dhaka
//     • Eastern Backbone : Dhaka → Narayanganj → Comilla → Feni →
//                          Chittagong → Cox's Bazar
//     • NW Feeder        : Rajshahi → Naogaon → Bogra
//     • Northern Spine   : Bogra → Gaibandha → Rangpur
//
//   TIER 2 — Division connectors
//     • Bogra → Jamalpur → Mymensingh → Dhaka
//     • Dhaka → Narsingdi → Brahmanbaria → Habiganj → Sylhet
//     • Dhaka → Munshiganj → Madaripur → Faridpur → Barisal
//     • Faridpur → Gopalganj → Bagerhat → Khulna
//     • Sirajganj → Pabna → Kushtia (east-west connector)
//     • Kushtia → Jessore → Khulna
//     • Kushtia → Rajbari → Faridpur (western ring close)
//     • Jessore → Narail → Faridpur (southern ring close)
//     • Comilla → Chandpur branch
//
//   TIER 3 — District spurs
//     • Rangpur northern ring: Rangpur ↔ Saidpur ↔ Nilphamari ↔ Dinajpur
//     • Rangpur → Lalmonirhat
//     • Mymensingh → Kishoreganj
//     • Kishoreganj → Brahmanbaria (cross-link)
//     • Habiganj → Moulvibazar
//     • Sylhet → Sunamganj
//     • Laksam → Noakhali
//     • Barisal → Patuakhali → Barguna
//     • Khulna → Satkhira
//     • Chittagong → Rangamati
//     • Sylhet local ring (CUT — flood disaster scenario)
//
// Statuses:
//   active   — fully operational
//   degraded — partial / re-routed (Sylhet feed degraded by flooding)
//   cut      — fiber severed (Sylhet north local ring)

export type FiberStatus = 'active' | 'degraded' | 'cut'

export interface FiberRoute {
  id:      string
  name:    string
  tier:    1 | 2 | 3
  status:  FiberStatus
  nodeIds: string[]
  coords:  [number, number][]   // [lat, lng]
}

// ─────────────────────────────────────────────────────────────────

export const FIBER_ROUTES: FiberRoute[] = [

  // ════════════════════════════════════════════════════════════════
  //  TIER 1 — National Backbone
  // ════════════════════════════════════════════════════════════════

  {
    // Chapai Nawabganj → Rajshahi → Natore → Sirajganj → Tangail → Dhaka
    // The primary western trunk; follows N4 highway corridor.
    id: 'FR-001', tier: 1, status: 'active',
    name: 'Western Backbone — Chapai Nawabganj → Dhaka',
    nodeIds: ['RAJ-003', 'DHK-004'],
    coords: [
      [24.596, 88.272],   // Chapai Nawabganj
      [24.374, 88.603],   // Rajshahi
      [24.420, 88.987],   // Natore
      [24.265, 89.217],   // Ishurdi / Pabna junction
      [24.454, 89.706],   // Sirajganj (Jamuna Bridge east)
      [24.470, 89.778],   // Jamuna Bridge
      [24.253, 89.921],   // Tangail
      [23.988, 90.417],   // Gazipur
      [23.811, 90.413],   // Dhaka
    ],
  },

  {
    // Dhaka → Narayanganj → Comilla → Laksam → Feni → Chittagong → Cox's Bazar
    // The primary eastern trunk; follows N1 / AH1 corridor.
    id: 'FR-002', tier: 1, status: 'active',
    name: 'Eastern Backbone — Dhaka → Chittagong → Cox\'s Bazar',
    nodeIds: ['DHK-006', 'CTG-006', 'CTG-003'],
    coords: [
      [23.811, 90.413],   // Dhaka
      [23.623, 90.500],   // Narayanganj
      [23.566, 90.909],   // Daudkandi
      [23.461, 91.182],   // Comilla
      [23.241, 91.126],   // Laksam
      [23.023, 91.396],   // Feni
      [22.783, 91.570],   // Mirsarai
      [22.337, 91.832],   // Chittagong
      [22.119, 91.879],   // Patiya
      [21.918, 92.002],   // Chakoria
      [21.441, 92.013],   // Cox's Bazar
    ],
  },

  {
    // Rajshahi → Naogaon → Bogra
    // Northwestern feeder linking Rajshahi to the northern spine.
    id: 'FR-003', tier: 1, status: 'active',
    name: 'NW Feeder — Rajshahi → Naogaon → Bogra',
    nodeIds: ['RAJ-003'],
    coords: [
      [24.374, 88.603],   // Rajshahi
      [24.800, 88.936],   // Naogaon
      [24.851, 89.372],   // Bogra
    ],
  },

  {
    // Bogra → Gaibandha → Rangpur
    // Main northern spine connecting division capital.
    id: 'FR-004', tier: 1, status: 'active',
    name: 'Northern Spine — Bogra → Gaibandha → Rangpur',
    nodeIds: ['RNG-002'],
    coords: [
      [24.851, 89.372],   // Bogra
      [25.119, 89.369],   // Joypurhat
      [25.327, 89.546],   // Gaibandha
      [25.742, 89.253],   // Rangpur
    ],
  },

  // ════════════════════════════════════════════════════════════════
  //  TIER 2 — Division Connectors
  // ════════════════════════════════════════════════════════════════

  {
    // Bogra → Jamalpur → Mymensingh → Gazipur → Dhaka
    // Northeast corridor; Brahmaputra valley highway.
    id: 'FR-005', tier: 2, status: 'active',
    name: 'Northeast Corridor — Bogra → Mymensingh → Dhaka',
    nodeIds: ['MYM-002', 'DHK-004'],
    coords: [
      [24.851, 89.372],   // Bogra
      [24.897, 89.938],   // Jamalpur
      [25.018, 90.014],   // Sherpur
      [24.748, 90.408],   // Mymensingh
      [23.988, 90.417],   // Gazipur
      [23.811, 90.413],   // Dhaka
    ],
  },

  {
    // Dhaka → Narsingdi → Brahmanbaria → Habiganj → Sylhet
    // Sylhet division main feed; follows N2 highway.
    id: 'FR-006', tier: 2, status: 'active',
    name: 'Sylhet Corridor — Dhaka → Brahmanbaria → Sylhet',
    nodeIds: ['DHK-004', 'SYL-003'],
    coords: [
      [23.811, 90.413],   // Dhaka
      [23.921, 90.714],   // Narsingdi
      [24.052, 90.975],   // Bhairab Bazar
      [23.957, 91.112],   // Brahmanbaria
      [24.373, 91.415],   // Habiganj
      [24.524, 91.534],   // Shaistaganj
      [24.900, 91.865],   // Sylhet
    ],
  },

  {
    // Dhaka → Munshiganj → Madaripur → Faridpur → Barisal
    // Southern corridor to Barisal; crosses Padma via Mawa Bridge.
    id: 'FR-007', tier: 2, status: 'active',
    name: 'Barisal Corridor — Dhaka → Faridpur → Barisal',
    nodeIds: ['DHK-006', 'BAR-002'],
    coords: [
      [23.811, 90.413],   // Dhaka
      [23.542, 90.530],   // Munshiganj
      [23.438, 90.385],   // Mawa (Padma crossing)
      [23.212, 90.183],   // Padma Bridge south
      [23.164, 90.201],   // Madaripur
      [23.607, 89.841],   // Faridpur
      [23.300, 90.100],   // Barisal approach
      [22.701, 90.370],   // Barisal
    ],
  },

  {
    // Faridpur → Gopalganj → Bagerhat → Khulna
    // Khulna southern approach via river delta.
    id: 'FR-008', tier: 2, status: 'active',
    name: 'Khulna Southern Approach — Faridpur → Gopalganj → Khulna',
    nodeIds: ['KHU-003'],
    coords: [
      [23.607, 89.841],   // Faridpur
      [23.004, 89.822],   // Gopalganj
      [22.651, 89.756],   // Bagerhat
      [22.820, 89.552],   // Khulna
    ],
  },

  {
    // Sirajganj → Pabna → Kushtia
    // Critical east-west link connecting western backbone to southwest ring.
    id: 'FR-009', tier: 2, status: 'active',
    name: 'East-West Connector — Sirajganj → Pabna → Kushtia',
    nodeIds: ['RAJ-003'],
    coords: [
      [24.454, 89.706],   // Sirajganj
      [24.006, 89.244],   // Pabna
      [23.901, 89.120],   // Kushtia
    ],
  },

  {
    // Kushtia → Jhenaidah → Jessore → Khulna
    // Southwest corridor linking Kushtia to Khulna.
    id: 'FR-010', tier: 2, status: 'active',
    name: 'Southwest Corridor — Kushtia → Jessore → Khulna',
    nodeIds: ['KHU-003'],
    coords: [
      [23.901, 89.120],   // Kushtia
      [23.420, 89.108],   // Jhenaidah
      [23.168, 89.213],   // Jessore
      [22.820, 89.552],   // Khulna
    ],
  },

  {
    // Kushtia → Rajbari → Faridpur
    // Closes the western ring; runs along N7 highway east of Padma.
    id: 'FR-011', tier: 2, status: 'active',
    name: 'Western Ring Close — Kushtia → Rajbari → Faridpur',
    nodeIds: [],
    coords: [
      [23.901, 89.120],   // Kushtia
      [23.763, 89.644],   // Rajbari
      [23.607, 89.841],   // Faridpur
    ],
  },

  {
    // Jessore → Narail → Faridpur
    // Southern ring close; creates a redundant loop through the delta.
    id: 'FR-012', tier: 2, status: 'active',
    name: 'Southern Ring Close — Jessore → Narail → Faridpur',
    nodeIds: [],
    coords: [
      [23.168, 89.213],   // Jessore
      [23.175, 89.496],   // Narail
      [23.487, 89.419],   // Magura
      [23.607, 89.841],   // Faridpur
    ],
  },

  {
    // Comilla → Chandpur
    // Branch off the eastern backbone serving Chandpur district.
    id: 'FR-013', tier: 2, status: 'active',
    name: 'Chandpur Branch — Comilla → Chandpur',
    nodeIds: ['CTG-006'],
    coords: [
      [23.461, 91.182],   // Comilla
      [23.350, 90.980],   // Comilla–Chandpur highway
      [23.232, 90.651],   // Chandpur
    ],
  },

  // ════════════════════════════════════════════════════════════════
  //  TIER 3 — District Spurs
  // ════════════════════════════════════════════════════════════════

  {
    // Rangpur → Saidpur → Nilphamari → Dinajpur
    // Northern ring in Rangpur division; forms a closed loop.
    id: 'FR-014', tier: 3, status: 'active',
    name: 'Rangpur Northern Ring — Rangpur → Saidpur → Nilphamari → Dinajpur',
    nodeIds: ['RNG-002'],
    coords: [
      [25.742, 89.253],   // Rangpur
      [25.775, 88.897],   // Saidpur
      [25.931, 88.851],   // Nilphamari
      [25.625, 88.634],   // Dinajpur
    ],
  },

  {
    // Dinajpur → Thakurgaon (far north stub)
    id: 'FR-015', tier: 3, status: 'active',
    name: 'Far North Stub — Dinajpur → Thakurgaon',
    nodeIds: [],
    coords: [
      [25.625, 88.634],   // Dinajpur
      [26.034, 88.459],   // Thakurgaon
    ],
  },

  {
    // Rangpur → Lalmonirhat (northern stub)
    id: 'FR-016', tier: 3, status: 'active',
    name: 'Lalmonirhat Stub — Rangpur → Lalmonirhat',
    nodeIds: [],
    coords: [
      [25.742, 89.253],   // Rangpur
      [25.992, 89.453],   // Lalmonirhat
    ],
  },

  {
    // Mymensingh → Kishoreganj
    id: 'FR-017', tier: 3, status: 'active',
    name: 'Kishoreganj Spur — Mymensingh → Kishoreganj',
    nodeIds: ['MYM-006'],
    coords: [
      [24.748, 90.408],   // Mymensingh
      [24.600, 90.590],   // Kishoreganj approach
      [24.445, 90.776],   // Kishoreganj
    ],
  },

  {
    // Kishoreganj → Brahmanbaria
    // Cross-link closing the Dhaka–Mymensingh–Sylhet triangle.
    id: 'FR-018', tier: 3, status: 'active',
    name: 'Haor Cross-Link — Kishoreganj → Brahmanbaria',
    nodeIds: [],
    coords: [
      [24.445, 90.776],   // Kishoreganj
      [24.200, 90.980],   // Bajitpur / Bhairab area
      [23.957, 91.112],   // Brahmanbaria
    ],
  },

  {
    // Habiganj → Moulvibazar
    // Moulvibazar district spur off Sylhet corridor.
    id: 'FR-019', tier: 3, status: 'active',
    name: 'Moulvibazar Spur — Habiganj → Moulvibazar',
    nodeIds: [],
    coords: [
      [24.373, 91.415],   // Habiganj
      [24.482, 91.777],   // Moulvibazar
    ],
  },

  {
    // Sylhet → Sunamganj (northeast stub into haor basin)
    // Shows as degraded — flooded road approach to Sunamganj.
    id: 'FR-020', tier: 3, status: 'degraded',
    name: 'Sunamganj Stub — Sylhet → Sunamganj (degraded)',
    nodeIds: [],
    coords: [
      [24.900, 91.865],   // Sylhet
      [24.990, 91.630],   // Sylhet west
      [25.071, 91.395],   // Sunamganj
    ],
  },

  {
    // Sylhet local ring — CUT by flood damage (disaster scenario)
    id: 'FR-021', tier: 3, status: 'cut',
    name: 'Sylhet Local Ring — CUT (flood damage)',
    nodeIds: ['SYL-003', 'SYL-006'],
    coords: [
      [24.900, 91.865],   // Sylhet Central
      [24.940, 91.900],   // Sylhet north highway
      [24.960, 91.921],   // Companiganj
      [25.027, 91.976],   // Sylhet North (SEVERED)
    ],
  },

  {
    // Laksam → Noakhali (south branch off Chittagong backbone)
    id: 'FR-022', tier: 3, status: 'active',
    name: 'Noakhali Spur — Laksam → Noakhali',
    nodeIds: [],
    coords: [
      [23.241, 91.126],   // Laksam
      [23.050, 91.099],   // Begumganj
      [22.869, 91.099],   // Noakhali
    ],
  },

  {
    // Barisal → Patuakhali → Barguna (southern coastal spur)
    id: 'FR-023', tier: 3, status: 'active',
    name: 'Southern Coastal Spur — Barisal → Patuakhali → Barguna',
    nodeIds: ['BAR-002'],
    coords: [
      [22.701, 90.370],   // Barisal
      [22.360, 90.329],   // Patuakhali
      [22.128, 90.110],   // Barguna
    ],
  },

  {
    // Khulna → Satkhira (western stub toward Indian border)
    id: 'FR-024', tier: 3, status: 'active',
    name: 'Satkhira Stub — Khulna → Satkhira',
    nodeIds: [],
    coords: [
      [22.820, 89.552],   // Khulna
      [22.718, 89.112],   // Satkhira
    ],
  },

  {
    // Chittagong → Rangamati (CHT spur into Chittagong Hill Tracts)
    id: 'FR-025', tier: 3, status: 'active',
    name: 'CHT Spur — Chittagong → Rangamati',
    nodeIds: ['CTG-003'],
    coords: [
      [22.337, 91.832],   // Chittagong
      [22.500, 92.050],   // Kaptai area
      [22.632, 92.201],   // Rangamati
    ],
  },
]

// ── Style helpers ─────────────────────────────────────────────────

export const FIBER_COLOR: Record<FiberStatus, string> = {
  active:   '#3b82f6',   // blue
  degraded: '#f59e0b',   // amber
  cut:      '#ef4444',   // red
}

export const FIBER_WEIGHT: Record<1 | 2 | 3, number> = {
  1: 3.5,
  2: 2.2,
  3: 1.5,
}
