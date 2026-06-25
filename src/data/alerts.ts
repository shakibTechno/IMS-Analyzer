import type { Alert } from '@/types/alert'

// ─── 4 pre-seeded active alerts — one per alert type ─────────────
// These demonstrate all four alert conditions the IMS monitors:
//   1. rapid_degradation  — sudden infrastructure failure in an area
//   2. operator_blackout  — a single operator completely offline
//   3. power_cascade      — multiple simultaneous power failures
//   4. submission_gap     — operator missing scheduled API submissions

export const ALERTS: Alert[] = [
  {
    id: 'ALT-001',
    type: 'rapid_degradation',
    severity: 'critical',
    title: 'Rapid Degradation — Sylhet District',
    description:
      '3 of 8 Sylhet district sites transitioned to DOWN within a 15-minute window. ' +
      'Flash flood event suspected. Disaster Response Cell activation recommended.',
    district: 'Sylhet',
    operatorId: null,
    triggeredAt: '2026-04-11T06:30:00+06:00',
    acknowledged: false,
  },
  {
    id: 'ALT-002',
    type: 'operator_blackout',
    severity: 'critical',
    title: 'Operator Blackout — BGFCL NTTN (Sylhet)',
    description:
      'All BGFCL NTTN PoPs in Sylhet district are reporting DOWN or MISSING submissions. ' +
      'No submissions received for 46+ hours. Entire NTTN backbone in affected area offline.',
    district: 'Sylhet',
    operatorId: 'OP-BGFCL',
    triggeredAt: '2026-04-11T07:00:00+06:00',
    acknowledged: false,
  },
  {
    id: 'ALT-003',
    type: 'power_cascade',
    severity: 'warning',
    title: 'Power Cascade — Mymensingh Trishal Area',
    description:
      '3 tower sites in Trishal upazila (Mymensingh) reported simultaneous power source ' +
      'transition from GRID to BATTERY within the same 15-minute interval. ' +
      'Possible local feeder failure from Trishal PDB.',
    district: 'Mymensingh',
    operatorId: null,
    triggeredAt: '2026-04-13T04:05:00+06:00',
    acknowledged: false,
  },
  {
    id: 'ALT-004',
    type: 'submission_gap',
    severity: 'info',
    title: 'Submission Gap — Banglalink (3 consecutive intervals)',
    description:
      'Banglalink has missed 3 consecutive 15-minute submission intervals ' +
      '(2026-04-13 07:00–07:45 UTC+6). Compliance rate dropped to 74% for this window. ' +
      'No infrastructure failures detected — possible API connectivity issue.',
    district: null,
    operatorId: 'OP-BL',
    triggeredAt: '2026-04-13T07:50:00+06:00',
    acknowledged: false,
  },
]

export const ACTIVE_ALERT_COUNT = ALERTS.filter(a => !a.acknowledged).length
