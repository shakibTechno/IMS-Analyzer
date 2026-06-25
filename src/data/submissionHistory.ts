// ─── 7-day submission compliance per operator ─────────────────────
//
// Each operator submits once every 15 minutes per site they own.
// Sites per operator (approximate from sites.ts):
//   GP        — 9 sites  → 9 × 96 = 864 expected/day
//   Robi      — 6 sites  → 576/day
//   BL        — 8 sites  → 768/day
//   BGFCL     — 8 sites  → 768/day (but degraded compliance)
//   Teletalk  — 8 sites  → 768/day
//   Edotco    — 19 sites → 1824/day
//
// Compliance rates:
//   GP        ~98%  — highest compliance
//   Robi      ~92%  — good
//   BL        ~88%  — acceptable
//   BGFCL     ~74%  — below target (disaster sites offline)
//   Teletalk  ~82%  — state-owned, improving compliance
//   Edotco    ~95%  — strong tower operator

export interface DailySubmission {
  operatorId: string
  date: string             // "2026-04-07"
  totalExpected: number
  submitted: number
  onTime: number
  late: number
  missing: number
  complianceRate: number   // percentage
}

// Base dates: 7 days ending 2026-04-13
const DATES = [
  '2026-04-07',
  '2026-04-08',
  '2026-04-09',
  '2026-04-10',
  '2026-04-11',  // ← disaster onset for Sylhet
  '2026-04-12',
  '2026-04-13',
]

function makeRow(
  operatorId: string,
  date: string,
  expected: number,
  compliancePct: number,
  latePct = 0.03,
  disasterPenalty = 0,
): DailySubmission {
  const effective = Math.round(compliancePct / 100 * expected) - disasterPenalty
  const submitted = Math.max(0, effective)
  const onTime = Math.round(submitted * (1 - latePct))
  const late = submitted - onTime
  const missing = expected - submitted
  return {
    operatorId, date, totalExpected: expected,
    submitted, onTime, late,
    missing: Math.max(0, missing),
    complianceRate: Math.round((submitted / expected) * 100),
  }
}

export const SUBMISSION_HISTORY: DailySubmission[] = [
  // ── Grameenphone (9 sites, ~98%) ──────────────────────────────
  ...DATES.map(date => makeRow('OP-GP', date, 864,
    date === '2026-04-11' ? 91 : 98, 0.02)),

  // ── Robi (6 sites, ~92%) ──────────────────────────────────────
  ...DATES.map(date => makeRow('OP-ROBI', date, 576,
    date === '2026-04-11' ? 78 : date === '2026-04-12' ? 85 : 92, 0.04)),

  // ── Banglalink (8 sites, ~88%) ────────────────────────────────
  ...DATES.map(date => makeRow('OP-BL', date, 768,
    date === '2026-04-11' ? 72 : 88, 0.05)),

  // ── BGFCL NTTN (8 sites, ~74% — Sylhet nodes offline) ─────────
  ...DATES.map(date => makeRow('OP-BGFCL', date, 768,
    date === '2026-04-11' ? 48 : date === '2026-04-12' ? 55 : 74, 0.08)),

  // ── Teletalk (8 sites, ~82%) ──────────────────────────────────
  ...DATES.map(date => makeRow('OP-TT', date, 768,
    date === '2026-04-11' ? 68 : date === '2026-04-12' ? 74 : 82, 0.06)),

  // ── Edotco (19 sites, ~95%) ───────────────────────────────────
  ...DATES.map(date => makeRow('OP-EDOTCO', date, 1824,
    date === '2026-04-11' ? 86 : 95, 0.03)),
]
