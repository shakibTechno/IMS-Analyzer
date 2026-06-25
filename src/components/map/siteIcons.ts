// ─── Site marker icons — teardrop map pins ────────────────────────
//
// Three completely distinct icon designs, one per asset type:
//
//   tower    — Lattice transmission tower: vertical mast, T-bar antenna,
//              wide cross-arms with diagonal bracing, spread A-frame legs.
//              Visual language: TALL VERTICAL STRUCTURE.
//
//   bts      — Radio base station: short pole, horizontal antenna bar,
//              three bold concentric broadcast arcs fanning upward.
//              Visual language: WIRELESS BROADCAST WAVES (like WiFi symbol).
//
//   nttn_pop — NTTN Point of Presence: solid central hub circle with eight
//              radiating spokes to endpoint dots — a network topology star.
//              Visual language: MULTI-POINT NETWORK NODE.
//
// Pin shape: teardrop (circle top, pointed tip at bottom)
//   ViewBox  : 0 0 30 42
//   Circle   : center (15,13)  radius 11
//   Tip      : (15,40)
//   Icon area: (7,4) → (23,22)

import L from 'leaflet'
import type { SiteStatus, AssetType } from '@/types/site'

const FILL: Record<SiteStatus, string> = {
  active:   '#22c55e',
  degraded: '#f59e0b',
  down:     '#ef4444',
}
const BORDER: Record<SiteStatus, string> = {
  active:   '#15803d',
  degraded: '#92400e',
  down:     '#991b1b',
}

// ── Inner icons ───────────────────────────────────────────────────

function innerIcon(type: AssetType): string {
  switch (type) {

    // ── TOWER — uses the 🗼 emoji (matches Total Sites KPI card icon) ──
    case 'tower':
      return `
        <text x="15" y="20"
              text-anchor="middle"
              font-size="15"
              font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">🗼</text>
      `

    // ── BTS — Radio base station ──────────────────────────────────
    // Short mounting pole, horizontal antenna bar, three concentric
    // arc waves fanning upward (largest arc nearly fills circle top).
    // Looks like the universal WiFi / broadcast symbol.
    case 'bts':
      return `
        <!-- Mounting pole -->
        <line x1="15" y1="15" x2="15" y2="24" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Antenna bar -->
        <line x1="10" y1="15" x2="20" y2="15" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Antenna center dot -->
        <circle cx="15" cy="15" r="2" fill="white"/>
        <!-- Broadcast arc 1 — closest -->
        <path d="M12,12.5 A4,4 0 0,1 18,12.5"
              stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <!-- Broadcast arc 2 — medium -->
        <path d="M9.5,9.5 A7,7 0 0,1 20.5,9.5"
              stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
        <!-- Broadcast arc 3 — far -->
        <path d="M7,6.5 A9.5,9.5 0 0,1 23,6.5"
              stroke="white" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.4"/>
      `

    // ── NTTN PoP — Network Point of Presence ──────────────────────
    // Filled central hub circle with 8 radiating spokes to endpoint
    // dots — a network star topology. Looks nothing like tower/BTS.
    case 'nttn_pop':
      return `
        <!-- Hub circle (solid) -->
        <circle cx="15" cy="13" r="3.8" fill="white"/>
        <!-- 8 radial spokes + endpoint dots -->
        <!-- North -->
        <line x1="15" y1="9.2" x2="15" y2="5"    stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="15" cy="4.5" r="1.5" fill="white"/>
        <!-- NE -->
        <line x1="17.7" y1="10.3" x2="20.5" y2="7"  stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="21" cy="6.5"  r="1.5" fill="white"/>
        <!-- East -->
        <line x1="18.8" y1="13" x2="23" y2="13"   stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="23.5" cy="13" r="1.5" fill="white"/>
        <!-- SE -->
        <line x1="17.7" y1="15.7" x2="20.5" y2="19" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="21" cy="19.5" r="1.5" fill="white"/>
        <!-- South -->
        <line x1="15" y1="16.8" x2="15" y2="22"   stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="15" cy="22.5" r="1.5" fill="white"/>
        <!-- SW -->
        <line x1="12.3" y1="15.7" x2="9.5" y2="19" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="9" cy="19.5"  r="1.5" fill="white"/>
        <!-- West -->
        <line x1="11.2" y1="13" x2="7" y2="13"    stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="6.5" cy="13"  r="1.5" fill="white"/>
        <!-- NW -->
        <line x1="12.3" y1="10.3" x2="9.5" y2="7"  stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="9" cy="6.5"   r="1.5" fill="white"/>
      `
  }
}

// ── Pulse ring (degraded / down) ──────────────────────────────────
function pulseHtml(color: string, fast: boolean): string {
  const dur = fast ? '1.1s' : '1.9s'
  return `<div style="
    position:absolute;top:13px;left:15px;
    transform:translate(-50%,-50%);
    width:22px;height:22px;border-radius:50%;
    background:${color};
    animation:sitePulse ${dur} ease-out infinite;
    pointer-events:none;
  "></div>`
}

// ── Assemble full pin HTML ────────────────────────────────────────
const PIN_PATH = 'M15,40 C11,31 4,26 4,13 A11,11 0 1,1 26,13 C26,26 19,31 15,40 Z'

function pinHtml(status: SiteStatus, type: AssetType): string {
  const fill   = FILL[status]
  const border = BORDER[status]
  const pulse  = status !== 'active' ? pulseHtml(fill, status === 'down') : ''

  return `
    <div style="position:relative;width:30px;height:42px;">
      ${pulse}
      <svg width="30" height="42" viewBox="0 0 30 42"
           xmlns="http://www.w3.org/2000/svg"
           style="display:block;overflow:visible;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
        <!-- Teardrop pin body -->
        <path d="${PIN_PATH}" fill="${fill}" stroke="${border}" stroke-width="1.3"/>
        <!-- Top-left gloss highlight -->
        <path d="M9,8 Q11,5 15,7"
              stroke="rgba(255,255,255,0.55)" stroke-width="2.5"
              fill="none" stroke-linecap="round"/>
        <!-- Asset-type icon -->
        ${innerIcon(type)}
      </svg>
    </div>
  `
}

// ── L.DivIcon factory ─────────────────────────────────────────────
function buildIcon(status: SiteStatus, type: AssetType): L.DivIcon {
  return L.divIcon({
    className:   '',
    iconSize:    [30, 42],
    iconAnchor:  [15, 42],    // pin tip points to exact location
    popupAnchor: [0, -44],
    html: pinHtml(status, type),
  })
}

// ── Static 3×3 lookup built once at module load ───────────────────
const STATUSES: SiteStatus[] = ['active', 'degraded', 'down']
const TYPES:    AssetType[]  = ['tower', 'bts', 'nttn_pop']

export const SITE_ICONS: Record<SiteStatus, Record<AssetType, L.DivIcon>> =
  Object.fromEntries(
    STATUSES.map(s => [
      s,
      Object.fromEntries(
        TYPES.map(t => [t, buildIcon(s, t)])
      ) as Record<AssetType, L.DivIcon>,
    ])
  ) as Record<SiteStatus, Record<AssetType, L.DivIcon>>
