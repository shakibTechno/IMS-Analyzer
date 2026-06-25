// ─── Outage incident log ──────────────────────────────────────────
// 30 incidents total
// 3 ongoing (endTime: null) — the 3 Sylhet disaster down-sites
// Remainder spread across all divisions with varied types

export type OutageType =
  | 'power_failure'
  | 'link_outage'
  | 'equipment_fault'
  | 'scheduled_maintenance'

export interface OutageIncident {
  id: string
  siteId: string
  operatorId: string
  type: OutageType
  startTime: string          // ISO
  endTime: string | null     // null = ongoing
  durationMinutes: number | null
  resolved: boolean
  notes: string
}

export const OUTAGE_LOG: OutageIncident[] = [
  // ── ONGOING — Sylhet disaster (3 sites) ──────────────────────
  {
    id: 'OUT-001', siteId: 'SYL-005', operatorId: 'OP-ROBI',
    type: 'power_failure',
    startTime: '2026-04-11T06:12:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Flash flood caused substation failure. Generator depleted. Site offline.',
  },
  {
    id: 'OUT-002', siteId: 'SYL-006', operatorId: 'OP-BGFCL',
    type: 'link_outage',
    startTime: '2026-04-11T06:28:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Fiber cable damage due to flood inundation. All PoP links severed.',
  },
  {
    id: 'OUT-003', siteId: 'SYL-007', operatorId: 'OP-EDOTCO',
    type: 'power_failure',
    startTime: '2026-04-11T07:03:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Grid power lost. Battery backup active then depleted. Tower down.',
  },

  // ── RESOLVED — Dhaka ─────────────────────────────────────────
  {
    id: 'OUT-004', siteId: 'DHK-010', operatorId: 'OP-BL',
    type: 'equipment_fault',
    startTime: '2026-04-12T14:20:00+06:00', endTime: '2026-04-12T18:45:00+06:00',
    durationMinutes: 265, resolved: true,
    notes: 'BTS baseband unit failure. Replaced by field team same day.',
  },
  {
    id: 'OUT-005', siteId: 'DHK-007', operatorId: 'OP-EDOTCO',
    type: 'scheduled_maintenance',
    startTime: '2026-04-10T02:00:00+06:00', endTime: '2026-04-10T05:30:00+06:00',
    durationMinutes: 210, resolved: true,
    notes: 'Planned antenna realignment. Pre-approved 3-hour window.',
  },
  {
    id: 'OUT-006', siteId: 'DHK-002', operatorId: 'OP-GP',
    type: 'power_failure',
    startTime: '2026-04-09T19:10:00+06:00', endTime: '2026-04-09T21:50:00+06:00',
    durationMinutes: 160, resolved: true,
    notes: 'Grid outage from Motijheel feeder. Generator kicked in, then restored.',
  },

  // ── RESOLVED — Chattogram ─────────────────────────────────────
  {
    id: 'OUT-007', siteId: 'CTG-008', operatorId: 'OP-BL',
    type: 'link_outage',
    startTime: '2026-04-11T09:00:00+06:00', endTime: '2026-04-11T16:20:00+06:00',
    durationMinutes: 440, resolved: true,
    notes: 'Microwave backhaul interference from adjacent site. Frequency recoordinated.',
  },
  {
    id: 'OUT-008', siteId: 'CTG-009', operatorId: 'OP-EDOTCO',
    type: 'power_failure',
    startTime: '2026-04-13T01:00:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Solar charging failure due to overcast. Battery depleted at remote site.',
  },
  {
    id: 'OUT-009', siteId: 'CTG-005', operatorId: 'OP-ROBI',
    type: 'scheduled_maintenance',
    startTime: '2026-04-08T01:00:00+06:00', endTime: '2026-04-08T04:00:00+06:00',
    durationMinutes: 180, resolved: true,
    notes: 'Software upgrade to RAN nodes during low-traffic window.',
  },
  {
    id: 'OUT-010', siteId: 'CTG-010', operatorId: 'OP-EDOTCO',
    type: 'link_outage',
    startTime: '2026-04-13T06:30:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Island connectivity degraded — sea cable weather stress suspected.',
  },

  // ── RESOLVED — Sylhet (pre-disaster) ─────────────────────────
  {
    id: 'OUT-011', siteId: 'SYL-003', operatorId: 'OP-BGFCL',
    type: 'scheduled_maintenance',
    startTime: '2026-04-09T23:00:00+06:00', endTime: '2026-04-10T01:30:00+06:00',
    durationMinutes: 150, resolved: true,
    notes: 'NTTN node firmware update. Coordinated with BTRC.',
  },
  {
    id: 'OUT-012', siteId: 'SYL-008', operatorId: 'OP-BL',
    type: 'power_failure',
    startTime: '2026-04-13T05:30:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Battery backup degraded after flood water reached ground floor.',
  },
  {
    id: 'OUT-013', siteId: 'SYL-001', operatorId: 'OP-EDOTCO',
    type: 'equipment_fault',
    startTime: '2026-04-07T11:15:00+06:00', endTime: '2026-04-07T14:30:00+06:00',
    durationMinutes: 195, resolved: true,
    notes: 'Feeder cable corrosion at antenna port. Replaced and resealed.',
  },

  // ── RESOLVED — Khulna ────────────────────────────────────────
  {
    id: 'OUT-014', siteId: 'KHU-007', operatorId: 'OP-BGFCL',
    type: 'link_outage',
    startTime: '2026-04-12T18:00:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Remote Sundarbans node — fibre damage suspected, access pending tide.',
  },
  {
    id: 'OUT-015', siteId: 'KHU-004', operatorId: 'OP-EDOTCO',
    type: 'power_failure',
    startTime: '2026-04-10T08:30:00+06:00', endTime: '2026-04-10T12:00:00+06:00',
    durationMinutes: 210, resolved: true,
    notes: 'Solar panel damaged by high winds. Generator backup used until repair.',
  },
  {
    id: 'OUT-016', siteId: 'KHU-008', operatorId: 'OP-EDOTCO',
    type: 'equipment_fault',
    startTime: '2026-04-13T06:15:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Transmitter power output below threshold. Remote alarm triggered.',
  },

  // ── RESOLVED — Rajshahi ───────────────────────────────────────
  {
    id: 'OUT-017', siteId: 'RAJ-007', operatorId: 'OP-BL',
    type: 'power_failure',
    startTime: '2026-04-13T06:00:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Generator fuel exhausted at rural site. Refill scheduled.',
  },
  {
    id: 'OUT-018', siteId: 'RAJ-004', operatorId: 'OP-EDOTCO',
    type: 'scheduled_maintenance',
    startTime: '2026-04-11T03:00:00+06:00', endTime: '2026-04-11T06:00:00+06:00',
    durationMinutes: 180, resolved: true,
    notes: 'Tower structural inspection. Required 3-hour shutdown.',
  },
  {
    id: 'OUT-019', siteId: 'RAJ-002', operatorId: 'OP-GP',
    type: 'equipment_fault',
    startTime: '2026-04-08T16:45:00+06:00', endTime: '2026-04-08T20:10:00+06:00',
    durationMinutes: 205, resolved: true,
    notes: 'RRU (Remote Radio Unit) failure. Hot-swap replacement completed.',
  },

  // ── RESOLVED — Barisal ────────────────────────────────────────
  {
    id: 'OUT-020', siteId: 'BAR-006', operatorId: 'OP-EDOTCO',
    type: 'power_failure',
    startTime: '2026-04-13T06:45:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Solar panel output degraded. Battery running at 30% capacity.',
  },
  {
    id: 'OUT-021', siteId: 'BAR-003', operatorId: 'OP-ROBI',
    type: 'link_outage',
    startTime: '2026-04-09T13:20:00+06:00', endTime: '2026-04-09T17:45:00+06:00',
    durationMinutes: 265, resolved: true,
    notes: 'Bhola island microwave link outage due to heavy rain. Self-restored.',
  },

  // ── RESOLVED — Rangpur ────────────────────────────────────────
  {
    id: 'OUT-022', siteId: 'RNG-005', operatorId: 'OP-ROBI',
    type: 'power_failure',
    startTime: '2026-04-13T02:30:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Grid failure at Lalmonirhat border area. No generator available.',
  },
  {
    id: 'OUT-023', siteId: 'RNG-004', operatorId: 'OP-EDOTCO',
    type: 'scheduled_maintenance',
    startTime: '2026-04-12T02:00:00+06:00', endTime: '2026-04-12T05:00:00+06:00',
    durationMinutes: 180, resolved: true,
    notes: 'Solar panel cleaning and battery test at Thakurgaon border tower.',
  },

  // ── RESOLVED — Mymensingh ─────────────────────────────────────
  {
    id: 'OUT-024', siteId: 'MYM-003', operatorId: 'OP-EDOTCO',
    type: 'power_failure',
    startTime: '2026-04-13T04:00:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Power cascade — 5 sites in Trishal area lost grid power simultaneously.',
  },
  {
    id: 'OUT-025', siteId: 'MYM-006', operatorId: 'OP-BGFCL',
    type: 'link_outage',
    startTime: '2026-04-13T07:00:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'NTTN relay node packet loss >40%. Degraded mode.',
  },
  {
    id: 'OUT-026', siteId: 'MYM-001', operatorId: 'OP-EDOTCO',
    type: 'scheduled_maintenance',
    startTime: '2026-04-10T01:00:00+06:00', endTime: '2026-04-10T04:00:00+06:00',
    durationMinutes: 180, resolved: true,
    notes: 'Planned annual tower inspection. Mymensingh city site.',
  },

  // ── Teletalk incidents ────────────────────────────────────────
  {
    id: 'OUT-031', siteId: 'TT-003', operatorId: 'OP-TT',
    type: 'power_failure',
    startTime: '2026-04-13T05:00:00+06:00', endTime: null,
    durationMinutes: null, resolved: false,
    notes: 'Sylhet flood impact — battery backup running. Site in degraded mode.',
  },
  {
    id: 'OUT-032', siteId: 'TT-001', operatorId: 'OP-TT',
    type: 'scheduled_maintenance',
    startTime: '2026-04-09T01:00:00+06:00', endTime: '2026-04-09T04:00:00+06:00',
    durationMinutes: 180, resolved: true,
    notes: 'Software upgrade to 4G LTE stack. Pre-approved 3-hour window.',
  },

  // ── Additional historical incidents ───────────────────────────
  {
    id: 'OUT-027', siteId: 'DHK-004', operatorId: 'OP-BGFCL',
    type: 'equipment_fault',
    startTime: '2026-04-07T09:00:00+06:00', endTime: '2026-04-07T13:20:00+06:00',
    durationMinutes: 260, resolved: true,
    notes: 'Optical amplifier module failure at Uttara PoP. Replaced under warranty.',
  },
  {
    id: 'OUT-028', siteId: 'CTG-003', operatorId: 'OP-BGFCL',
    type: 'scheduled_maintenance',
    startTime: '2026-04-08T23:00:00+06:00', endTime: '2026-04-09T02:00:00+06:00',
    durationMinutes: 180, resolved: true,
    notes: 'DWDM node upgrade at Hathazari. Coordinated with downstream operators.',
  },
  {
    id: 'OUT-029', siteId: 'KHU-001', operatorId: 'OP-EDOTCO',
    type: 'equipment_fault',
    startTime: '2026-04-09T10:30:00+06:00', endTime: '2026-04-09T14:00:00+06:00',
    durationMinutes: 210, resolved: true,
    notes: 'Ethernet switch failure at tower base. Replaced and connectivity restored.',
  },
  {
    id: 'OUT-030', siteId: 'RAJ-001', operatorId: 'OP-EDOTCO',
    type: 'power_failure',
    startTime: '2026-04-11T14:00:00+06:00', endTime: '2026-04-11T16:30:00+06:00',
    durationMinutes: 150, resolved: true,
    notes: 'PDB load shedding in Rajshahi city. UPS maintained service for 2 hours.',
  },
]
