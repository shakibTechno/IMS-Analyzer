import { useMap } from 'react-leaflet'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { STATUS_COLORS } from '@/utils/statusColors'

// ─── MapLegend ────────────────────────────────────────────────────
// Leaflet Control injected via useEffect.
// Shows site status colors + asset type shapes.

interface Props {
  position?:   'bottomright' | 'bottomleft' | 'topright' | 'topleft'
  showTower?:  boolean
  showBTS?:    boolean
  showPoP?:    boolean
  showOPGW?:    boolean
  showBahon?:   boolean
  showIS3?:     boolean
  showFHLFON?:  boolean
  showRailway?:  boolean
  showBRFiber?:  boolean
  showOprLines?: boolean
  showSummit?:   boolean
  showBLTowers?: boolean
  showBLLines?:   boolean
  showBTCL?:       boolean
  showBTCLNodes?:  boolean
  showBTCLUnion?:  boolean
  showFiberLines?:  boolean
  showFiberPoints?: boolean
  showBTCLNew?:     boolean
  showGPSites?:     boolean
  showRobiSites?:   boolean
  showBLBTS?:       boolean
  showISPPOPs?:     boolean
}

export default function MapLegend({
  position = 'bottomright',
  showTower = false, showBTS = false, showPoP = false,
  showOPGW = false, showBahon = false, showIS3 = false, showFHLFON = false,
  showRailway = false, showBRFiber = false, showOprLines = false,
  showSummit = false, showBLTowers = false, showBLLines = false,
  showBTCL = false, showBTCLNodes = false, showBTCLUnion = false,
  showFiberLines = false, showFiberPoints = false,
  showBTCLNew = false,
  showGPSites = false,
  showRobiSites = false,
  showBLBTS = false,
  showISPPOPs = false,
}: Props) {
  const map        = useMap()
  const controlRef = useRef<L.Control | null>(null)

  useEffect(() => {
    const LegendControl = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create('div')
        div.style.cssText = [
          'background:rgba(255,255,255,0.95)',
          'backdrop-filter:blur(4px)',
          'border:1px solid #e2e8f0',
          'border-radius:8px',
          'padding:9px 11px',
          'font:11px/1.5 system-ui,sans-serif',
          'box-shadow:0 2px 10px rgba(0,0,0,0.12)',
          'min-width:110px',
        ].join(';')

        // ── Conditionally built sections ──────────────────────

        const hasAnySite = showTower || showBTS || showPoP
        const hasAnything = hasAnySite || showOPGW || showBahon || showIS3 || showFHLFON || showRailway || showBRFiber || showOprLines || showSummit || showBLTowers || showBLLines || showBLBTS || showBTCL || showBTCLNodes || showBTCLUnion || showFiberLines || showFiberPoints || showBTCLNew || showGPSites || showRobiSites || showISPPOPs

        // Hide legend entirely when nothing is active
        if (!hasAnything) {
          div.style.display = 'none'
          return div
        }

        const statusRows = [
          { label: 'Active',    hex: STATUS_COLORS.active.hex },
          { label: 'Degraded',  hex: STATUS_COLORS.degraded.hex },
          { label: 'Down',      hex: STATUS_COLORS.down.hex },
        ]

        const PIN = (fill: string, border: string, icon: string) =>
          `<svg width="14" height="20" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg"
               style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">
             <path d="M15,40 C11,31 4,26 4,13 A11,11 0 1,1 26,13 C26,26 19,31 15,40 Z"
                   fill="${fill}" stroke="${border}" stroke-width="1.5"/>
             <path d="M9,8 Q11,5 15,7" stroke="rgba(255,255,255,0.55)"
                   stroke-width="2.5" fill="none" stroke-linecap="round"/>
             ${icon}
           </svg>`

        const TOWER_ICON = `
          <text x="15" y="20" text-anchor="middle" font-size="15"
                font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">🗼</text>`
        const BTS_ICON = `
          <line x1="15" y1="15" x2="15" y2="24" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="10" y1="15" x2="20" y2="15" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="15" cy="15" r="2" fill="white"/>
          <path d="M12,12.5 A4,4 0 0,1 18,12.5" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M9.5,9.5 A7,7 0 0,1 20.5,9.5" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
          <path d="M7,6.5 A9.5,9.5 0 0,1 23,6.5" stroke="white" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.4"/>`
        const POP_ICON = `
          <circle cx="15" cy="13" r="3.8" fill="white"/>
          <line x1="15" y1="9.2" x2="15" y2="5" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="15" cy="4.5" r="1.5" fill="white"/>
          <line x1="17.7" y1="10.3" x2="20.5" y2="7" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="21" cy="6.5" r="1.5" fill="white"/>
          <line x1="18.8" y1="13" x2="23" y2="13" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="23.5" cy="13" r="1.5" fill="white"/>
          <line x1="17.7" y1="15.7" x2="20.5" y2="19" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="21" cy="19.5" r="1.5" fill="white"/>
          <line x1="15" y1="16.8" x2="15" y2="22" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="15" cy="22.5" r="1.5" fill="white"/>
          <line x1="12.3" y1="15.7" x2="9.5" y2="19" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="9" cy="19.5" r="1.5" fill="white"/>
          <line x1="11.2" y1="13" x2="7" y2="13" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="6.5" cy="13" r="1.5" fill="white"/>
          <line x1="12.3" y1="10.3" x2="9.5" y2="7" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="9" cy="6.5" r="1.5" fill="white"/>`

        const allTypeRows = [
          { label: 'Tower co.', svg: PIN('#64748b', '#475569', TOWER_ICON), show: showTower },
          { label: 'BTS',       svg: PIN('#64748b', '#475569', BTS_ICON),   show: showBTS   },
          { label: 'NTTN PoP',  svg: PIN('#64748b', '#475569', POP_ICON),   show: showPoP   },
        ]
        const typeRows = allTypeRows.filter(r => r.show)

        const opgwSection = showOPGW ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">PGCB</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#dc2626" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#dc2626" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">400 kV T/L</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#16a34a" stroke-width="2.2" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#16a34a" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#16a34a" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">230 kV T/L</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#f97316" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#f97316" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#f97316" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">132 kV T/L</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#3b82f6" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#3b82f6" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">UG Cable</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#eab308" stroke-width="1.2" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#eab308" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#eab308" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">Others</span>
          </div>
        ` : ''

        const bahonSection = showBahon ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Bahon Ltd</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#dc2626" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#dc2626" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">Overhead (OH)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#78350f" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#78350f" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#78350f" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">Underground (UG)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#d97706" stroke-width="1.2" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#d97706" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#d97706" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">Wall Clamped (WC)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#16a34a;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #16a34a;"></span>
            <span style="color:#334155">Network Node</span>
          </div>
        ` : ''

        const is3Section = showIS3 ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">InfoSarkar-3</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#dc2626" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#dc2626" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">48 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#0d9488" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#0d9488" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#0d9488" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">24 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#c026d3" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#c026d3" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#c026d3" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">Messenger</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#ca8a04" stroke-width="1.2" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#ca8a04" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#ca8a04" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">12 Core</span>
          </div>
        ` : ''

        const fhlfonSection = showFHLFON ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Fiber@Home</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#4338ca" stroke-width="2.0" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#4338ca" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#4338ca" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">Aerial</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#fbbf24" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#fbbf24" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">Burial (UG)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#1e1b4b;flex-shrink:0;border:1.5px solid white;box-shadow:0 0 0 1px #1e1b4b;"></span>
            <span style="color:#334155">CO (Central Office)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#4338ca;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #4338ca;"></span>
            <span style="color:#334155">BTS</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#6366f1;flex-shrink:0;border:1px solid #818cf8;"></span>
            <span style="color:#334155">JE/EP/FAT (zoom ≥ 11)</span>
          </div>
        ` : ''

        const statusSection = hasAnySite ? `
          <div style="font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:5px;">Status</div>
          ${statusRows.map(r => `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
              <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${r.hex};flex-shrink:0;"></span>
              <span style="color:#334155">${r.label}</span>
            </div>
          `).join('')}
        ` : ''

        const typeSection = typeRows.length > 0 ? `
          <div style="margin:7px 0 5px;${hasAnySite ? 'border-top:1px solid #f1f5f9;padding-top:6px;' : ''}font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Type</div>
          ${typeRows.map(r => `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:14px;flex-shrink:0;">${r.svg}</span>
              <span style="color:#334155">${r.label}</span>
            </div>
          `).join('')}
        ` : ''

        const railwaySection = showRailway ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Railway</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="22" y2="4" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span style="color:#334155">Meter gauge</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="22" y2="4" stroke="#1e1b4b" stroke-width="3.2" stroke-linecap="round"/>
            </svg>
            <span style="color:#334155">Broad gauge single</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="22" y2="4" stroke="#4c1d95" stroke-width="4.0" stroke-linecap="round"/>
            </svg>
            <span style="color:#334155">Broad gauge double</span>
          </div>
        ` : ''

        const blTowersSection = showBLTowers ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Banglalink Towers</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#2563eb;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #2563eb;"></span>
            <span style="color:#334155">4G site</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#16a34a;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #16a34a;"></span>
            <span style="color:#334155">3G only</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#dc2626;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #dc2626;"></span>
            <span style="color:#334155">2G only</span>
          </div>
        ` : ''

        const blLinesSection = showBLLines ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Banglalink Fiber</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#7c3aed" stroke-width="3.2" stroke-linecap="round"/></svg>
            <span style="color:#334155">72 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#2563eb" stroke-width="2.4" stroke-linecap="round"/></svg>
            <span style="color:#334155">48 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#0891b2" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">32 Core</span>
          </div>
        ` : ''

        const btclSection = (showBTCL || showBTCLNodes || showBTCLUnion) ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">BTCL</div>
          ${showBTCL ? `
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#7c3aed" stroke-width="3.5" stroke-linecap="round"/></svg>
            <span style="color:#334155">144+ Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#6d28d9" stroke-width="3.0" stroke-linecap="round"/></svg>
            <span style="color:#334155">96 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#2563eb" stroke-width="2.4" stroke-linecap="round"/></svg>
            <span style="color:#334155">48 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#0891b2" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">24 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/></svg>
            <span style="color:#334155">&lt;24 Core</span>
          </div>` : ''}
          ${showBTCLNodes ? `
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#0891b2;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #0891b2;"></span>
            <span style="color:#334155">HOP</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#d97706;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #d97706;"></span>
            <span style="color:#334155">Handhole</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#16a34a;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #16a34a;"></span>
            <span style="color:#334155">Connection Pt</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#dc2626;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #dc2626;"></span>
            <span style="color:#334155">Manhole</span>
          </div>` : ''}
          ${showBTCLUnion ? `
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;margin:5px 0 3px;">Union Projects</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0ea5e9;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #0ea5e9;"></span>
            <span style="color:#334155">Barisal</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #f59e0b;"></span>
            <span style="color:#334155">Chittagong</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #10b981;"></span>
            <span style="color:#334155">Khulna</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#6366f1;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #6366f1;"></span>
            <span style="color:#334155">Dhaka</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f97316;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #f97316;"></span>
            <span style="color:#334155">Rajshahi</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#8b5cf6;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #8b5cf6;"></span>
            <span style="color:#334155">Sylhet</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#06b6d4;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #06b6d4;"></span>
            <span style="color:#334155">Rangpur</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ec4899;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1.5px #ec4899;"></span>
            <span style="color:#334155">Mymensingh</span>
          </div>` : ''}
        ` : ''

        const summitSection = showSummit ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Summit</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#7c3aed" stroke-width="2.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">Backbone (≥96 core)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">Major burial (48–95)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#ca8a04" stroke-width="1.6" stroke-linecap="round"/></svg>
            <span style="color:#334155">PGCB Route</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">Railway Route</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#7c3aed;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #7c3aed;"></span>
            <span style="color:#334155">Network Node</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#f59e0b;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #f59e0b;"></span>
            <span style="color:#334155">BTS Site</span>
          </div>
        ` : ''

        const oprLinesSection = showOprLines ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Operator Lines</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round"/></svg>
            <span style="color:#334155">Summit</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#3b82f6" stroke-width="2.2" stroke-linecap="round"/></svg>
            <span style="color:#334155">Bahon</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#8b5cf6" stroke-width="2.2" stroke-linecap="round"/></svg>
            <span style="color:#334155">Fiber@Home</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round"/></svg>
            <span style="color:#334155">Banglalink</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#10b981" stroke-width="2.2" stroke-linecap="round"/></svg>
            <span style="color:#334155">Robi</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#06b6d4" stroke-width="2.2" stroke-linecap="round"/></svg>
            <span style="color:#334155">Grameenphone</span>
          </div>
        ` : ''

        const brFiberSection = showBRFiber ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Bangladesh Railway Fiber</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/></svg>
            <span style="color:#334155">8 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="color:#334155">16 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#0d9488" stroke-width="2.0" stroke-linecap="round"/></svg>
            <span style="color:#334155">32 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round"/></svg>
            <span style="color:#334155">48 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#ea580c" stroke-width="3.0" stroke-linecap="round"/></svg>
            <span style="color:#334155">72 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#7c3aed" stroke-width="3.4" stroke-linecap="round"/></svg>
            <span style="color:#334155">96 Core</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#b45309;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #b45309;"></span>
            <span style="color:#334155">Station Node</span>
          </div>
        ` : ''

        const blBtsSection = showBLBTS ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Banglalink BTS</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #f59e0b;"></span>
            <span style="color:#334155">Microwave</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#2563eb;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #2563eb;"></span>
            <span style="color:#334155">Fiber</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#94a3b8;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #94a3b8;"></span>
            <span style="color:#334155">Inactive</span>
          </div>
        ` : ''

        const robiSection = showRobiSites ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Robi</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #f59e0b;"></span>
            <span style="color:#334155">MW Connected</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#2563eb;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #2563eb;"></span>
            <span style="color:#334155">Fiber Connected</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#8b5cf6;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #8b5cf6;"></span>
            <span style="color:#334155">MW + Fiber</span>
          </div>
        ` : ''

        const gpSection = showGPSites ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Grameenphone</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#2563eb;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #2563eb;"></span>
            <span style="color:#334155">Fiber Connected</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #f59e0b;"></span>
            <span style="color:#334155">MW Connected</span>
          </div>
        ` : ''

        const btclNewSection = showBTCLNew ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">BTCL (Latest)</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f97316;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #f97316;"></span>
            <span style="color:#334155">CP (Connection Point)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#06b6d4;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #06b6d4;"></span>
            <span style="color:#334155">HH (Hand Hole)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#8b5cf6;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #8b5cf6;"></span>
            <span style="color:#334155">HOP</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #22c55e;"></span>
            <span style="color:#334155">POP</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#ef4444;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #ef4444;"></span>
            <span style="color:#334155">MH (Man Hole)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#94a3b8;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #94a3b8;"></span>
            <span style="color:#334155">Other</span>
          </div>
        ` : ''

        const fiberNetSection = (showFiberLines || showFiberPoints) ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Fiber Network</div>
          ${showFiberLines ? `
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;margin:3px 0 3px;">Lines</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#e11d48" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">Grameenphone</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#ea580c" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">Robi</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#0891b2" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">BTCL</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">Banglalink</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#8b5cf6" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">MOTN</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8"><line x1="0" y1="4" x2="22" y2="4" stroke="#10b981" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span style="color:#334155">BSCCL</span>
          </div>` : ''}
          ${showFiberPoints ? `
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;margin:${showFiberLines ? '5px' : '3px'} 0 3px;">Points</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#e11d48;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #e11d48;"></span>
            <span style="color:#334155">Grameenphone</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#ea580c;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #ea580c;"></span>
            <span style="color:#334155">Robi</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#0891b2;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #0891b2;"></span>
            <span style="color:#334155">BTCL</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #f59e0b;"></span>
            <span style="color:#334155">Banglalink</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#8b5cf6;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #8b5cf6;"></span>
            <span style="color:#334155">MOTN</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #10b981;"></span>
            <span style="color:#334155">BSCCL</span>
          </div>` : ''}
        ` : ''

        div.innerHTML = `
          ${statusSection}
          ${typeSection}
          ${opgwSection}
          ${bahonSection}
          ${is3Section}
          ${fhlfonSection}
          ${railwaySection}
          ${brFiberSection}
          ${oprLinesSection}
          ${summitSection}
          ${blTowersSection}
          ${blLinesSection}
          ${btclSection}
          ${blBtsSection}
          ${robiSection}
          ${gpSection}
          ${fiberNetSection}
          ${btclNewSection}
          ${showISPPOPs ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">ISP POPs</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#059669;flex-shrink:0;border:1px solid white;box-shadow:0 0 0 1px #059669;"></span>
            <span style="color:#334155">Point of Presence</span>
          </div>
          ` : ''}
        `

        L.DomEvent.disableClickPropagation(div)
        return div
      },
    })

    const control = new LegendControl({ position })
    control.addTo(map)
    controlRef.current = control

    return () => { control.remove() }
  }, [map, position, showTower, showBTS, showPoP, showOPGW, showBahon, showIS3, showFHLFON, showRailway, showBRFiber, showOprLines, showSummit, showBLTowers, showBLLines, showBTCL, showBTCLNodes, showBTCLUnion, showFiberLines, showFiberPoints, showBTCLNew, showGPSites, showRobiSites, showBLBTS, showISPPOPs])

  return null
}
