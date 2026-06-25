import type { SiteStatus, PowerSource } from '@/types/site'
import type { AlertSeverity } from '@/types/alert'

// ─── Single source of truth for all status/power/alert colors ────
// Every component that needs a color imports from here.
// Never hardcode hex values or Tailwind color classes elsewhere.

export interface ColorSet {
  hex:        string   // for Leaflet markers, inline styles, charts
  text:       string   // Tailwind text-* class
  bg:         string   // Tailwind bg-* class (light tint)
  bgSolid:    string   // Tailwind bg-* class (solid, for badges)
  border:     string   // Tailwind border-* class
  label:      string   // Human-readable label
}

// ─── Site status colors ───────────────────────────────────────────
export const STATUS_COLORS: Record<SiteStatus, ColorSet> = {
  active: {
    hex:     '#22c55e',
    text:    'text-green-600',
    bg:      'bg-green-50',
    bgSolid: 'bg-green-500',
    border:  'border-green-400',
    label:   'Active',
  },
  down: {
    hex:     '#ef4444',
    text:    'text-red-600',
    bg:      'bg-red-50',
    bgSolid: 'bg-red-500',
    border:  'border-red-400',
    label:   'Down',
  },
  degraded: {
    hex:     '#f59e0b',
    text:    'text-amber-600',
    bg:      'bg-amber-50',
    bgSolid: 'bg-amber-500',
    border:  'border-amber-400',
    label:   'Degraded',
  },
}

// ─── Power source colors ──────────────────────────────────────────
export const POWER_COLORS: Record<PowerSource, ColorSet & { icon: string }> = {
  grid: {
    hex:     '#3b82f6',
    text:    'text-blue-600',
    bg:      'bg-blue-50',
    bgSolid: 'bg-blue-500',
    border:  'border-blue-400',
    label:   'Grid',
    icon:    '⚡',
  },
  generator: {
    hex:     '#f97316',
    text:    'text-orange-600',
    bg:      'bg-orange-50',
    bgSolid: 'bg-orange-500',
    border:  'border-orange-400',
    label:   'Generator',
    icon:    '🔧',
  },
  battery: {
    hex:     '#8b5cf6',
    text:    'text-violet-600',
    bg:      'bg-violet-50',
    bgSolid: 'bg-violet-500',
    border:  'border-violet-400',
    label:   'Battery',
    icon:    '🔋',
  },
  solar: {
    hex:     '#eab308',
    text:    'text-yellow-600',
    bg:      'bg-yellow-50',
    bgSolid: 'bg-yellow-500',
    border:  'border-yellow-400',
    label:   'Solar',
    icon:    '☀️',
  },
}

// ─── Alert severity colors ────────────────────────────────────────
export const ALERT_COLORS: Record<AlertSeverity, ColorSet & { icon: string }> = {
  critical: {
    hex:     '#ef4444',
    text:    'text-red-600',
    bg:      'bg-red-50',
    bgSolid: 'bg-red-500',
    border:  'border-red-400',
    label:   'Critical',
    icon:    '🔴',
  },
  warning: {
    hex:     '#f59e0b',
    text:    'text-amber-600',
    bg:      'bg-amber-50',
    bgSolid: 'bg-amber-500',
    border:  'border-amber-400',
    label:   'Warning',
    icon:    '🟡',
  },
  info: {
    hex:     '#3b82f6',
    text:    'text-blue-600',
    bg:      'bg-blue-50',
    bgSolid: 'bg-blue-500',
    border:  'border-blue-400',
    label:   'Info',
    icon:    '🔵',
  },
}

// ─── Submission compliance colors ─────────────────────────────────
export const COMPLIANCE_COLORS = {
  on_time: { hex: '#22c55e', label: 'On Time' },
  late:    { hex: '#f59e0b', label: 'Late'    },
  missing: { hex: '#ef4444', label: 'Missing' },
} as const

// ─── Operator type colors (for type badges) ───────────────────────
export const OPERATOR_TYPE_COLORS = {
  mno:          { hex: '#3b82f6', label: 'MNO',          bg: '#eff6ff', text: '#1d4ed8' },
  nttn:         { hex: '#16a34a', label: 'NTTN',         bg: '#f0fdf4', text: '#15803d' },
  tower_company:{ hex: '#7c3aed', label: 'Tower Co.',    bg: '#f5f3ff', text: '#6d28d9' },
} as const
