import { useState } from 'react'
import type { SummitLineFilters } from '@/components/map/SummitOverlay'
import type { BLGenFilter }  from '@/components/map/BanglalinkTowersOverlay'
import type { BLLineFilter }  from '@/components/map/BanglalinkLinesOverlay'
import type { BTCLLineFilter } from '@/components/map/BTCLOverlay'
import type { BTCLNodeFilter } from '@/components/map/BTCLNodesOverlay'
import type { BTCLNewPointType, BTCLNewTypeFilter } from '@/components/map/BTCLNewPointsOverlay'
import type { BTCLTenant, BTCLTenantFilter }        from '@/components/map/BTCLKmzLinesOverlay'
import { BTCL_TENANT_COLORS, BTCL_TENANT_LABELS }  from '@/components/map/BTCLKmzLinesOverlay'
import type { GPTxType, GPTxFilter }               from '@/components/map/GPSitesOverlay'
import type { RobiTxType, RobiTxFilter }           from '@/components/map/RobiSitesOverlay'
import type { BLBTSTxType, BLBTSTxFilter }         from '@/components/map/BLBTSSitesOverlay'
import type { TowerOperatorKey }                   from '@/components/map/TowerOverlay'
import { TOWER_OPERATORS }                         from '@/components/map/TowerOverlay'

interface Props {
  mapView:        'division' | 'district' | 'upazila' | null
  setMapView:     (v: 'division' | 'district' | 'upazila' | null) => void
  showOPGW:            boolean
  onToggleOPGW:        () => void
  opgwFilters:         Set<string>
  onToggleOpgwFilter:  (key: string) => void
  showBahon:           boolean
  onToggleBahon:       () => void
  bahonFilters:        Set<string>
  onToggleBahonFilter: (key: string) => void
  showIS3:             boolean
  onToggleIS3:         () => void
  is3LineFilters:      Set<string>
  onToggleIS3Line:     (key: string) => void
  showIS3Nodes:        boolean
  onToggleIS3Nodes:    () => void
  showFHLFON:           boolean
  onToggleFHLFON:       () => void
  fhlfonLineFilters:    Set<string>
  onToggleFhlfonLine:   (key: string) => void
  fhlfonPointFilters:   Set<string>
  onToggleFhlfonPoint:  (key: string) => void
  showRailway:          boolean
  onToggleRailway:      () => void
  showBRFiber:          boolean
  onToggleBRFiber:      () => void
  brFiberCoreFilters:   Set<string>
  onToggleBRFiberCore:  (key: string) => void
  showBRFiberNodes:     boolean
  onToggleBRFiberNodes: () => void
  showOprLines:         boolean
  onToggleOprLines:     () => void
  oprLineFilters:       Set<string>
  onToggleOprLineFilter:(key: string) => void
  showSummit:           boolean
  onToggleSummit:       () => void
  summitLineFilters:    SummitLineFilters
  onToggleSummitLine:   (key: keyof SummitLineFilters) => void
  showSummitNodes:      boolean
  onToggleSummitNodes:  () => void
  showSummitBTS:        boolean
  onToggleSummitBTS:    () => void
  showBLTowers:         boolean
  onToggleBLTowers:     () => void
  blGenFilter:          BLGenFilter
  onToggleBLGen:        (key: '4G' | '3G' | '2G') => void
  showBLLines:          boolean
  onToggleBLLines:      () => void
  blLineFilter:         BLLineFilter
  onToggleBLLine:       (key: '72' | '48' | '32') => void
  showBTCL:             boolean
  onToggleBTCL:         () => void
  btclLineFilter:       BTCLLineFilter
  onToggleBTCLLine:     (key: '144' | '96' | '48' | '24' | 'other') => void
  showBTCLNodes:        boolean
  onToggleBTCLNodes:    () => void
  btclNodeFilter:       BTCLNodeFilter
  onToggleBTCLNode:     (key: 'hop' | 'hh' | 'cp' | 'mh') => void
  showBTCLUnion:        boolean
  onToggleBTCLUnion:    () => void
  showBTCLNew:           boolean
  onToggleBTCLNew:       () => void
  btclNewTypeFilter:     BTCLNewTypeFilter
  onToggleBTCLNewType:   (key: BTCLNewPointType) => void
  showBTCLNewLines:      boolean
  onToggleBTCLNewLines:  () => void
  btclTenantFilter:      BTCLTenantFilter
  onToggleBTCLTenant:    (t: BTCLTenant) => void
  showGPSites:           boolean
  onToggleGPSites:       () => void
  gpTxFilter:            GPTxFilter
  onToggleGPTx:          (key: GPTxType) => void
  showRobiSites:         boolean
  onToggleRobiSites:     () => void
  robiTxFilter:          RobiTxFilter
  onToggleRobiTx:        (key: RobiTxType) => void
  showBLBTS:             boolean
  onToggleBLBTS:         () => void
  blBtsTxFilter:         BLBTSTxFilter
  onToggleBLBTSTx:       (key: BLBTSTxType) => void
  towerOps:              Set<TowerOperatorKey>
  onToggleTowerOp:       (key: TowerOperatorKey) => void
  showISPPOPs:           boolean
  onToggleISPPOPs:       () => void
  onReset:               () => void
}

// ── Primitives ────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
         style={{ transition: 'transform 0.15s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function SectionHeader({ label, open, onToggle, badge }: {
  label: string; open: boolean; onToggle: () => void; badge?: number
}) {
  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '5px 2px', background: 'none', border: 'none',
      cursor: 'pointer', borderRadius: 3,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
        <Chevron open={open} />
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {label}
        </span>
      </div>
      {badge != null && badge > 0 && (
        <span style={{
          fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 9999,
          background: '#dbeafe', color: '#1d4ed8', lineHeight: 1.6,
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}

function SubGroupHeader({ label, open, onToggle }: {
  label: string; open: boolean; onToggle: () => void
}) {
  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 4,
      width: '100%', padding: '3px 3px', background: 'none', border: 'none',
      cursor: 'pointer', borderRadius: 3, color: '#94a3b8',
    }}>
      <Chevron open={open} />
      <span style={{ fontSize: 8.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
    </button>
  )
}

function OperatorHeader({ label, open, onToggle, dotColor, active }: {
  label: string; open: boolean; onToggle: () => void; dotColor: string; active: boolean
}) {
  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '3px 6px', borderRadius: 4, cursor: 'pointer',
      border: active ? '1px solid #e2e8f0' : '1px solid transparent',
      background: active ? '#f8fafc' : 'none',
      color: active ? '#334155' : '#94a3b8',
      transition: 'all 0.12s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0, opacity: active ? 1 : 0.4 }} />
        <span style={{ fontSize: 10.5, fontWeight: 700 }}>{label}</span>
      </div>
      <span style={{ color: '#94a3b8' }}><Chevron open={open} /></span>
    </button>
  )
}

function TreeLine({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginLeft: 8, paddingLeft: 9,
      borderLeft: '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column', gap: 4,
      marginTop: 3,
    }}>
      {children}
    </div>
  )
}

function SubFilters({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: 3, padding: '5px 7px',
      background: '#f8fafc', borderRadius: 4,
      border: '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column', gap: 3,
    }}>
      {children}
    </div>
  )
}

function SubLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.06em', color: '#cbd5e1', marginBottom: 1, marginTop: 3,
    }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: '#f1f5f9', margin: '3px 0' }} />
}

interface ToggleBtnProps {
  on: boolean; onClick: () => void; label: string; emoji?: string
  activeColor?: { border: string; bg: string; text: string }
}
function ToggleBtn({ on, onClick, label, emoji, activeColor }: ToggleBtnProps) {
  const ac = activeColor ?? { border: '#64748b', bg: '#f1f5f9', text: '#334155' }
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 5, width: '100%', padding: '3px 7px', borderRadius: 4,
      cursor: 'pointer', fontSize: 10.5, fontWeight: 600,
      border: on ? `1px solid ${ac.border}` : '1px solid #e2e8f0',
      background: on ? ac.bg : 'white',
      color: on ? ac.text : '#94a3b8',
      transition: 'all 0.13s',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {emoji && <span style={{ fontSize: 12, lineHeight: 1 }}>{emoji}</span>}
        {label}
      </span>
      <span style={{ fontSize: 9, opacity: on ? 0.65 : 0.45 }}>{on ? 'ON' : 'OFF'}</span>
    </button>
  )
}

interface CheckItemProps {
  checked: boolean; onClick: () => void; label: string; dotColor?: string; disabled?: boolean
}
function CheckItem({ checked, onClick, label, dotColor, disabled }: CheckItemProps) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '2px 6px', borderRadius: 3, cursor: disabled ? 'default' : 'pointer',
      border: checked ? '1px solid #cbd5e1' : '1px solid #f1f5f9',
      background: checked ? '#f8fafc' : 'white',
      color: checked ? '#334155' : '#94a3b8',
      fontSize: 10, fontWeight: 600,
      transition: 'all 0.12s', width: '100%', textAlign: 'left',
      opacity: disabled ? 0.4 : 1,
    }}>
      <span style={{
        width: 11, height: 11, borderRadius: 3, flexShrink: 0,
        border: checked ? '1.5px solid #3b82f6' : '1.5px solid #cbd5e1',
        background: checked ? '#3b82f6' : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s',
      }}>
        {checked && (
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
            <polyline points="2,5 4,7 8,3" stroke="white" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {dotColor && (
        <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: dotColor, opacity: checked ? 1 : 0.35 }} />
      )}
      {label}
    </button>
  )
}

function IconLayers() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}

// ── Main panel ────────────────────────────────────────────────────

export default function MapLayersPanel({
  mapView, setMapView,
  showOPGW, onToggleOPGW, opgwFilters, onToggleOpgwFilter,
  showBahon, onToggleBahon, bahonFilters, onToggleBahonFilter,
  showIS3, onToggleIS3, is3LineFilters, onToggleIS3Line, showIS3Nodes, onToggleIS3Nodes,
  showFHLFON, onToggleFHLFON, fhlfonLineFilters, onToggleFhlfonLine,
  fhlfonPointFilters, onToggleFhlfonPoint,
  showRailway, onToggleRailway,
  showBRFiber, onToggleBRFiber, brFiberCoreFilters, onToggleBRFiberCore,
  showBRFiberNodes, onToggleBRFiberNodes,
  showOprLines, onToggleOprLines, oprLineFilters, onToggleOprLineFilter,
  showSummit, onToggleSummit, summitLineFilters, onToggleSummitLine,
  showSummitNodes, onToggleSummitNodes,
  showSummitBTS, onToggleSummitBTS,
  showBLTowers, onToggleBLTowers, blGenFilter, onToggleBLGen,
  showBLLines,  onToggleBLLines,  blLineFilter, onToggleBLLine,
  showBTCL, onToggleBTCL, btclLineFilter, onToggleBTCLLine,
  showBTCLNodes, onToggleBTCLNodes, btclNodeFilter, onToggleBTCLNode,
  showBTCLUnion, onToggleBTCLUnion,
  showBTCLNew, onToggleBTCLNew, btclNewTypeFilter, onToggleBTCLNewType,
  showBTCLNewLines, onToggleBTCLNewLines, btclTenantFilter, onToggleBTCLTenant,
  showGPSites, onToggleGPSites, gpTxFilter, onToggleGPTx,
  showRobiSites, onToggleRobiSites, robiTxFilter, onToggleRobiTx,
  showBLBTS, onToggleBLBTS, blBtsTxFilter, onToggleBLBTSTx,
  towerOps, onToggleTowerOp,
  showISPPOPs, onToggleISPPOPs,
  onReset,
}: Props) {
  const [collapsed,  setCollapsed]  = useState(true)

  // Section open/close state — all start collapsed
  const [secISP,      setSecISP]      = useState(false)
  const [secBTCLNew,  setSecBTCLNew]  = useState(false)
  const [secGP,       setSecGP]       = useState(false)
  const [secRobi,     setSecRobi]     = useState(false)
  const [secAdmin,   setSecAdmin]   = useState(false)
  const [secTelecom, setSecTelecom] = useState(false)
  const [secMobile,  setSecMobile]  = useState(false)
  const [secNTTN,    setSecNTTN]    = useState(false)
  const [secBL,      setSecBL]      = useState(false)
  const [secBTCLOp,   setSecBTCLOp]   = useState(false)
  const [secInfra,    setSecInfra]    = useState(false)
  const [secTowerOp,  setSecTowerOp]  = useState(false)

  const telecomActive = [showBLTowers, showBLLines, showBLBTS, showGPSites, showRobiSites].filter(Boolean).length
  const nttnActive    = [showOPGW, showBahon, showIS3, showFHLFON, showSummit, showBTCL, showBTCLNodes, showBTCLUnion, showRailway, showBRFiber, showOprLines, showBTCLNew, showBTCLNewLines].filter(Boolean).length


  const activeCount = [
    mapView != null,
    ...([showOPGW, showBahon, showIS3, showFHLFON, showRailway, showBRFiber,
         showOprLines, showSummit, showBLTowers, showBLLines, showBLBTS, showBTCL, showBTCLNodes, showBTCLUnion,
         showBTCLNew, showBTCLNewLines, showGPSites, showRobiSites, showISPPOPs]),
  ].filter(Boolean).length + towerOps.size

  // ── Collapsed strip ───────────────────────────────────────────
  if (collapsed) {
    return (
      <div style={{
        width: 44, minWidth: 44,
        background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '10px 0', gap: 8,
      }}>
        <div style={{ color: '#475569' }}><IconLayers /></div>
        {activeCount > 0 && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 9999,
            background: '#1d4ed8', color: 'white', lineHeight: 1.4,
          }}>
            {activeCount}
          </span>
        )}
        <button onClick={() => setCollapsed(false)} title="Expand map layers" style={{
          width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.03)', border: '1px solid #e2e8f0',
          borderRadius: 5, cursor: 'pointer', color: '#64748b', transition: 'all 0.12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = '#64748b' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>
    )
  }

  // ── Expanded panel ────────────────────────────────────────────
  return (
    <div style={{
      width: 220, minWidth: 220,
      background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: '#475569' }}><IconLayers /></span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Map Layers
          </span>
          {activeCount > 0 && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 9999, background: '#1d4ed8', color: 'white' }}>
              {activeCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {activeCount > 0 && (
            <button onClick={onReset} title="Reset all layers" style={{
              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.03)', border: '1px solid #e2e8f0',
              borderRadius: 5, cursor: 'pointer', color: '#94a3b8', transition: 'all 0.12s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
          )}
          <button onClick={() => setCollapsed(true)} title="Collapse" style={{
            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.03)', border: '1px solid #e2e8f0',
            borderRadius: 5, cursor: 'pointer', color: '#94a3b8', transition: 'all 0.12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '6px 10px 10px', display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>

        {/* ── 1. Administrative ── */}
        <SectionHeader label="Administrative" open={secAdmin} onToggle={() => setSecAdmin(v => !v)}
          badge={mapView ? 1 : undefined} />
        {secAdmin && (
          <div style={{ marginBottom: 4 }}>
            <div style={{
              display: 'flex', borderRadius: 5, overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}>
              {(['division', 'district', 'upazila'] as const).map(v => (
                <button key={v} onClick={() => setMapView(mapView === v ? null : v)} style={{
                  flex: 1, padding: '4px 0', cursor: 'pointer', border: 'none',
                  background: mapView === v ? '#1d4ed8' : 'white',
                  color: mapView === v ? 'white' : '#64748b',
                  textTransform: 'capitalize', transition: 'all 0.13s',
                  fontSize: 10, fontWeight: 600,
                }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        <Divider />

        {/* ── 2. Telecom Operator ── */}
        <SectionHeader label="Telecom Operator" open={secTelecom} onToggle={() => setSecTelecom(v => !v)}
          badge={telecomActive || undefined} />
        {secTelecom && (
          <div style={{ marginBottom: 4, display: 'flex', flexDirection: 'column', gap: 5 }}>

            {/* Mobile Operators sub-group */}
            <div>
              <SubGroupHeader label="Mobile Operators" open={secMobile} onToggle={() => setSecMobile(v => !v)} />
              {secMobile && (
                <TreeLine>
                  {/* Grameenphone operator block */}
                  <div>
                    <OperatorHeader
                      label="Grameenphone" open={secGP} onToggle={() => setSecGP(v => !v)}
                      dotColor="#2563eb" active={showGPSites}
                    />
                    {secGP && (
                      <TreeLine>
                        <div>
                          <ToggleBtn on={showGPSites} onClick={onToggleGPSites} label="Sites" emoji="📡"
                            activeColor={{ border: '#2563eb', bg: '#eff6ff', text: '#1d4ed8' }} />
                          {showGPSites && (
                            <SubFilters>
                              <SubLabel>Backhaul Type</SubLabel>
                              <CheckItem checked={gpTxFilter.has('Fiber')} onClick={() => onToggleGPTx('Fiber')} label="Fiber Connected" dotColor="#2563eb" />
                              <CheckItem checked={gpTxFilter.has('MW')}    onClick={() => onToggleGPTx('MW')}    label="MW Connected"    dotColor="#f59e0b" />
                            </SubFilters>
                          )}
                        </div>
                      </TreeLine>
                    )}
                  </div>
                  {/* Robi operator block */}
                  <div>
                    <OperatorHeader
                      label="Robi" open={secRobi} onToggle={() => setSecRobi(v => !v)}
                      dotColor="#ea580c" active={showRobiSites}
                    />
                    {secRobi && (
                      <TreeLine>
                        <div>
                          <ToggleBtn on={showRobiSites} onClick={onToggleRobiSites} label="Sites" emoji="📡"
                            activeColor={{ border: '#f59e0b', bg: '#fffbeb', text: '#92400e' }} />
                          {showRobiSites && (
                            <SubFilters>
                              <SubLabel>Backhaul Type</SubLabel>
                              <CheckItem checked={robiTxFilter.has('MW')}    onClick={() => onToggleRobiTx('MW')}    label="MW Connected"    dotColor="#f59e0b" />
                              <CheckItem checked={robiTxFilter.has('Fiber')} onClick={() => onToggleRobiTx('Fiber')} label="Fiber Connected" dotColor="#2563eb" />
                              <CheckItem checked={robiTxFilter.has('Both')}  onClick={() => onToggleRobiTx('Both')}  label="MW + Fiber"      dotColor="#8b5cf6" />
                            </SubFilters>
                          )}
                        </div>
                      </TreeLine>
                    )}
                  </div>
                  {/* Banglalink operator block */}
                  <div>
                    <OperatorHeader
                      label="Banglalink" open={secBL} onToggle={() => setSecBL(v => !v)}
                      dotColor="#f59e0b" active={showBLTowers || showBLLines}
                    />
                    {secBL && (
                      <TreeLine>
                        {/* Towers */}
                        <div>
                          <ToggleBtn on={showBLTowers} onClick={onToggleBLTowers} label="Towers" emoji="📶"
                            activeColor={{ border: '#f59e0b', bg: '#fffbeb', text: '#92400e' }} />
                          {showBLTowers && (
                            <SubFilters>
                              <CheckItem checked={blGenFilter.has('4G')} onClick={() => onToggleBLGen('4G')} label="4G sites"     dotColor="#2563eb" />
                              <CheckItem checked={blGenFilter.has('3G')} onClick={() => onToggleBLGen('3G')} label="3G only"      dotColor="#16a34a" />
                              <CheckItem checked={blGenFilter.has('2G')} onClick={() => onToggleBLGen('2G')} label="2G only"      dotColor="#dc2626" />
                            </SubFilters>
                          )}
                        </div>
                        {/* Fiber Lines */}
                        <div>
                          <ToggleBtn on={showBLLines} onClick={onToggleBLLines} label="Fiber Lines" emoji="🔷"
                            activeColor={{ border: '#0891b2', bg: '#ecfeff', text: '#0e7490' }} />
                          {showBLLines && (
                            <SubFilters>
                              <CheckItem checked={blLineFilter.has('72')} onClick={() => onToggleBLLine('72')} label="72 Core" dotColor="#7c3aed" />
                              <CheckItem checked={blLineFilter.has('48')} onClick={() => onToggleBLLine('48')} label="48 Core" dotColor="#2563eb" />
                              <CheckItem checked={blLineFilter.has('32')} onClick={() => onToggleBLLine('32')} label="32 Core" dotColor="#0891b2" />
                            </SubFilters>
                          )}
                        </div>
                        {/* BTS Sites (Latest) */}
                        <div>
                          <ToggleBtn on={showBLBTS} onClick={onToggleBLBTS} label="BTS Sites (Latest)" emoji="📡"
                            activeColor={{ border: '#f59e0b', bg: '#fffbeb', text: '#92400e' }} />
                          {showBLBTS && (
                            <SubFilters>
                              <SubLabel>Backhaul Type</SubLabel>
                              <CheckItem checked={blBtsTxFilter.has('Microwave')} onClick={() => onToggleBLBTSTx('Microwave')} label="Microwave" dotColor="#f59e0b" />
                              <CheckItem checked={blBtsTxFilter.has('Fiber')}     onClick={() => onToggleBLBTSTx('Fiber')}     label="Fiber"     dotColor="#2563eb" />
                              <CheckItem checked={blBtsTxFilter.has('Inactive')}  onClick={() => onToggleBLBTSTx('Inactive')}  label="Inactive"  dotColor="#94a3b8" />
                            </SubFilters>
                          )}
                        </div>
                      </TreeLine>
                    )}
                  </div>
                </TreeLine>
              )}
            </div>

          </div>
        )}

        <Divider />

        {/* ── 3. NTTN Operator ── */}
        <SectionHeader label="NTTN Operator" open={secNTTN} onToggle={() => setSecNTTN(v => !v)}
          badge={nttnActive || undefined} />
        {secNTTN && (
          <div style={{ marginBottom: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* PGCB */}
            <div>
              <ToggleBtn on={showOPGW} onClick={onToggleOPGW} label="PGCB"
                activeColor={{ border: '#ca8a04', bg: '#fefce8', text: '#854d0e' }} />
              {showOPGW && (
                <SubFilters>
                  <CheckItem checked={opgwFilters.has('400kV')} onClick={() => onToggleOpgwFilter('400kV')} label="400 kV T/L" dotColor="#dc2626" />
                  <CheckItem checked={opgwFilters.has('230kV')} onClick={() => onToggleOpgwFilter('230kV')} label="230 kV T/L" dotColor="#16a34a" />
                  <CheckItem checked={opgwFilters.has('132kV')} onClick={() => onToggleOpgwFilter('132kV')} label="132 kV T/L" dotColor="#f97316" />
                  <CheckItem checked={opgwFilters.has('UG')}    onClick={() => onToggleOpgwFilter('UG')}    label="UG Cable"   dotColor="#3b82f6" />
                  <CheckItem checked={opgwFilters.has('other')} onClick={() => onToggleOpgwFilter('other')} label="Others"     dotColor="#eab308" />
                </SubFilters>
              )}
            </div>

            {/* Bahon */}
            <div>
              <ToggleBtn on={showBahon} onClick={onToggleBahon} label="Bahon"
                activeColor={{ border: '#06b6d4', bg: '#ecfeff', text: '#0e7490' }} />
              {showBahon && (
                <SubFilters>
                  <CheckItem checked={bahonFilters.has('OH')}   onClick={() => onToggleBahonFilter('OH')}   label="Overhead"     dotColor="#dc2626" />
                  <CheckItem checked={bahonFilters.has('UG')}   onClick={() => onToggleBahonFilter('UG')}   label="Underground"  dotColor="#78350f" />
                  <CheckItem checked={bahonFilters.has('WC')}   onClick={() => onToggleBahonFilter('WC')}   label="Wall Clamped" dotColor="#d97706" />
                  <CheckItem checked={bahonFilters.has('node')} onClick={() => onToggleBahonFilter('node')} label="Network Node" dotColor="#16a34a" />
                </SubFilters>
              )}
            </div>

            {/* InfoSarkar-3 */}
            <div>
              <ToggleBtn on={showIS3} onClick={onToggleIS3} label="InfoSarkar-3"
                activeColor={{ border: '#7c3aed', bg: '#f5f3ff', text: '#5b21b6' }} />
              {showIS3 && (
                <SubFilters>
                  <SubLabel>Lines</SubLabel>
                  <CheckItem checked={is3LineFilters.has('48')}   onClick={() => onToggleIS3Line('48')}   label="48 Core"   dotColor="#dc2626" />
                  <CheckItem checked={is3LineFilters.has('24')}   onClick={() => onToggleIS3Line('24')}   label="24 Core"   dotColor="#0d9488" />
                  <CheckItem checked={is3LineFilters.has('12')}   onClick={() => onToggleIS3Line('12')}   label="12 Core"   dotColor="#ca8a04" />
                  <CheckItem checked={is3LineFilters.has('msg')}  onClick={() => onToggleIS3Line('msg')}  label="Messenger" dotColor="#c026d3" />
                  <CheckItem checked={is3LineFilters.has('ring')} onClick={() => onToggleIS3Line('ring')} label="Ring"      dotColor="#16a34a" />
                  <CheckItem checked={is3LineFilters.has('cbd')}  onClick={() => onToggleIS3Line('cbd')}  label="CBD"       dotColor="#4f46e5" />
                  <SubLabel>Nodes</SubLabel>
                  <CheckItem checked={showIS3Nodes} onClick={onToggleIS3Nodes} label="Network Nodes" dotColor="#7c3aed" />
                </SubFilters>
              )}
            </div>

            {/* Fiber@Home */}
            <div>
              <ToggleBtn on={showFHLFON} onClick={onToggleFHLFON} label="Fiber@Home"
                activeColor={{ border: '#4338ca', bg: '#eef2ff', text: '#3730a3' }} />
              {showFHLFON && (
                <SubFilters>
                  <SubLabel>Lines</SubLabel>
                  <CheckItem checked={fhlfonLineFilters.has('Aerial')} onClick={() => onToggleFhlfonLine('Aerial')} label="Aerial" dotColor="#4338ca" />
                  <CheckItem checked={fhlfonLineFilters.has('Burial')} onClick={() => onToggleFhlfonLine('Burial')} label="Burial" dotColor="#fbbf24" />
                  <SubLabel>Points</SubLabel>
                  <CheckItem checked={fhlfonPointFilters.has('CO')}  onClick={() => onToggleFhlfonPoint('CO')}  label="CO"  dotColor="#1e1b4b" />
                  <CheckItem checked={fhlfonPointFilters.has('BTS')} onClick={() => onToggleFhlfonPoint('BTS')} label="BTS" dotColor="#4338ca" />
                  <CheckItem checked={fhlfonPointFilters.has('FDH')} onClick={() => onToggleFhlfonPoint('FDH')} label="FDH" dotColor="#818cf8" />
                  <CheckItem checked={fhlfonPointFilters.has('JE')}  onClick={() => onToggleFhlfonPoint('JE')}  label="JE"  dotColor="#6366f1" />
                  <CheckItem checked={fhlfonPointFilters.has('EP')}  onClick={() => onToggleFhlfonPoint('EP')}  label="EP"  dotColor="#a5b4fc" />
                  <CheckItem checked={fhlfonPointFilters.has('FAT')} onClick={() => onToggleFhlfonPoint('FAT')} label="FAT" dotColor="#c7d2fe" />
                </SubFilters>
              )}
            </div>

            {/* Summit */}
            <div>
              <ToggleBtn on={showSummit} onClick={onToggleSummit} label="Summit" emoji="🔶"
                activeColor={{ border: '#7c3aed', bg: '#f5f3ff', text: '#4c1d95' }} />
              {showSummit && (
                <SubFilters>
                  <SubLabel>Lines</SubLabel>
                  <CheckItem checked={summitLineFilters.backbone} onClick={() => onToggleSummitLine('backbone')} label="Backbone (≥96 core)"     dotColor="#7c3aed" />
                  <CheckItem checked={summitLineFilters.major}    onClick={() => onToggleSummitLine('major')}    label="Major burial (48–95) ⁹⁺" dotColor="#2563eb" />
                  <CheckItem checked={summitLineFilters.pgcb}     onClick={() => onToggleSummitLine('pgcb')}     label="PGCB Route"               dotColor="#ca8a04" />
                  <CheckItem checked={summitLineFilters.railway}  onClick={() => onToggleSummitLine('railway')}  label="Railway Route"            dotColor="#dc2626" />
                  <SubLabel>Points</SubLabel>
                  <CheckItem checked={showSummitNodes} onClick={onToggleSummitNodes} label="Network Nodes"    dotColor="#7c3aed" />
                  <CheckItem checked={showSummitBTS}   onClick={onToggleSummitBTS}   label="BTS (zoom ≥ 11)" dotColor="#f59e0b" />
                </SubFilters>
              )}
            </div>

            {/* BTCL-OLD */}
            <div>
              <OperatorHeader
                label="BTCL-OLD" open={secBTCLOp} onToggle={() => setSecBTCLOp(v => !v)}
                dotColor="#0891b2" active={showBTCL || showBTCLNodes || showBTCLUnion}
              />
              {secBTCLOp && (
                <TreeLine>
                  <div>
                    <ToggleBtn on={showBTCL} onClick={onToggleBTCL} label="Fiber Lines" emoji="🔷"
                      activeColor={{ border: '#0891b2', bg: '#ecfeff', text: '#0e7490' }} />
                    {showBTCL && (
                      <SubFilters>
                        <SubLabel>Core Count</SubLabel>
                        <CheckItem checked={btclLineFilter.has('144')}   onClick={() => onToggleBTCLLine('144')}   label="144+ Core"   dotColor="#7c3aed" />
                        <CheckItem checked={btclLineFilter.has('96')}    onClick={() => onToggleBTCLLine('96')}    label="96 Core"     dotColor="#6d28d9" />
                        <CheckItem checked={btclLineFilter.has('48')}    onClick={() => onToggleBTCLLine('48')}    label="48 Core"     dotColor="#2563eb" />
                        <CheckItem checked={btclLineFilter.has('24')}    onClick={() => onToggleBTCLLine('24')}    label="24 Core"     dotColor="#0891b2" />
                        <CheckItem checked={btclLineFilter.has('other')} onClick={() => onToggleBTCLLine('other')} label="&lt;24 Core" dotColor="#94a3b8" />
                      </SubFilters>
                    )}
                  </div>
                  <div>
                    <ToggleBtn on={showBTCLNodes} onClick={onToggleBTCLNodes} label="Nodes" emoji="📍"
                      activeColor={{ border: '#0891b2', bg: '#ecfeff', text: '#0e7490' }} />
                    {showBTCLNodes && (
                      <SubFilters>
                        <SubLabel>Point Type</SubLabel>
                        <CheckItem checked={btclNodeFilter.has('hop')} onClick={() => onToggleBTCLNode('hop')} label="HOP"           dotColor="#0891b2" />
                        <CheckItem checked={btclNodeFilter.has('hh')}  onClick={() => onToggleBTCLNode('hh')}  label="Handhole (HH)" dotColor="#d97706" />
                        <CheckItem checked={btclNodeFilter.has('cp')}  onClick={() => onToggleBTCLNode('cp')}  label="Connection Pt" dotColor="#16a34a" />
                        <CheckItem checked={btclNodeFilter.has('mh')}  onClick={() => onToggleBTCLNode('mh')}  label="Manhole (MH)"  dotColor="#dc2626" />
                      </SubFilters>
                    )}
                  </div>
                  <div>
                    <ToggleBtn on={showBTCLUnion} onClick={onToggleBTCLUnion} label="Union Projects" emoji="🏘️"
                      activeColor={{ border: '#0ea5e9', bg: '#f0f9ff', text: '#0369a1' }} />
                  </div>
                </TreeLine>
              )}
            </div>

            {/* Railway */}
            <div>
              <OperatorHeader
                label="Railway" open={secInfra} onToggle={() => setSecInfra(v => !v)}
                dotColor="#6d28d9" active={showRailway || showBRFiber || showOprLines}
              />
              {secInfra && (
                <TreeLine>
                  <div>
                    <ToggleBtn on={showRailway} onClick={onToggleRailway} label="Railline" emoji="🚂"
                      activeColor={{ border: '#6d28d9', bg: '#f5f3ff', text: '#5b21b6' }} />
                  </div>
                  <div>
                    <ToggleBtn on={showBRFiber} onClick={onToggleBRFiber} label="Bangladesh Railway Fiber" emoji="🔌"
                      activeColor={{ border: '#2563eb', bg: '#eff6ff', text: '#1d4ed8' }} />
                    {showBRFiber && (
                      <SubFilters>
                        <SubLabel>Core Count</SubLabel>
                        <CheckItem checked={brFiberCoreFilters.has('8')}  onClick={() => onToggleBRFiberCore('8')}  label="8 Core"  dotColor="#94a3b8" />
                        <CheckItem checked={brFiberCoreFilters.has('16')} onClick={() => onToggleBRFiberCore('16')} label="16 Core" dotColor="#64748b" />
                        <CheckItem checked={brFiberCoreFilters.has('32')} onClick={() => onToggleBRFiberCore('32')} label="32 Core" dotColor="#0d9488" />
                        <CheckItem checked={brFiberCoreFilters.has('48')} onClick={() => onToggleBRFiberCore('48')} label="48 Core" dotColor="#2563eb" />
                        <CheckItem checked={brFiberCoreFilters.has('72')} onClick={() => onToggleBRFiberCore('72')} label="72 Core" dotColor="#ea580c" />
                        <CheckItem checked={brFiberCoreFilters.has('96')} onClick={() => onToggleBRFiberCore('96')} label="96 Core" dotColor="#7c3aed" />
                        <SubLabel>Points</SubLabel>
                        <CheckItem checked={showBRFiberNodes} onClick={onToggleBRFiberNodes} label="Station Nodes" dotColor="#b45309" />
                      </SubFilters>
                    )}
                  </div>
                  <div>
                    <ToggleBtn on={showOprLines} onClick={onToggleOprLines} label="Operator Lines" emoji="🏢"
                      activeColor={{ border: '#10b981', bg: '#f0fdf4', text: '#065f46' }} />
                    {showOprLines && (
                      <SubFilters>
                        <SubLabel>Operators</SubLabel>
                        <CheckItem checked={oprLineFilters.has('1')} onClick={() => onToggleOprLineFilter('1')} label="Summit"       dotColor="#ef4444" />
                        <CheckItem checked={oprLineFilters.has('2')} onClick={() => onToggleOprLineFilter('2')} label="Bahon"        dotColor="#3b82f6" />
                        <CheckItem checked={oprLineFilters.has('3')} onClick={() => onToggleOprLineFilter('3')} label="Fiber@Home"   dotColor="#8b5cf6" />
                        <CheckItem checked={oprLineFilters.has('4')} onClick={() => onToggleOprLineFilter('4')} label="Banglalink"   dotColor="#f59e0b" />
                        <CheckItem checked={oprLineFilters.has('5')} onClick={() => onToggleOprLineFilter('5')} label="Robi"         dotColor="#10b981" />
                        <CheckItem checked={oprLineFilters.has('6')} onClick={() => onToggleOprLineFilter('6')} label="Grameenphone" dotColor="#06b6d4" />
                      </SubFilters>
                    )}
                  </div>
                </TreeLine>
              )}
            </div>

            {/* BTCL Latest */}
            <div>
              <OperatorHeader
                label="BTCL" open={secBTCLNew} onToggle={() => setSecBTCLNew(v => !v)}
                dotColor="#0891b2" active={showBTCLNew || showBTCLNewLines}
              />
              {secBTCLNew && (
                <TreeLine>
                  <div>
                    <ToggleBtn on={showBTCLNewLines} onClick={onToggleBTCLNewLines} label="Lines (KMZ)" emoji="〰️"
                      activeColor={{ border: '#0891b2', bg: '#ecfeff', text: '#0e7490' }} />
                    {showBTCLNewLines && (
                      <SubFilters>
                        <SubLabel>Tenant</SubLabel>
                        {(['BTCL', 'GP', 'Robi', 'MOTN', 'BL', 'BSCCL'] as BTCLTenant[]).map(t => (
                          <CheckItem
                            key={t}
                            checked={btclTenantFilter.has(t)}
                            onClick={() => onToggleBTCLTenant(t)}
                            label={BTCL_TENANT_LABELS[t]}
                            dotColor={BTCL_TENANT_COLORS[t]}
                          />
                        ))}
                      </SubFilters>
                    )}
                  </div>
                  <div>
                    <ToggleBtn on={showBTCLNew} onClick={onToggleBTCLNew} label="Points (Excel 2025)" emoji="📍"
                      activeColor={{ border: '#0891b2', bg: '#ecfeff', text: '#0e7490' }} />
                    {showBTCLNew && (
                      <SubFilters>
                        <SubLabel>Point Type</SubLabel>
                        <CheckItem checked={btclNewTypeFilter.has('CP')}    onClick={() => onToggleBTCLNewType('CP')}    label="CP (Connection Point)" dotColor="#f97316" />
                        <CheckItem checked={btclNewTypeFilter.has('HH')}    onClick={() => onToggleBTCLNewType('HH')}    label="HH (Hand Hole)"        dotColor="#06b6d4" />
                        <CheckItem checked={btclNewTypeFilter.has('HOP')}   onClick={() => onToggleBTCLNewType('HOP')}   label="HOP"                   dotColor="#8b5cf6" />
                        <CheckItem checked={btclNewTypeFilter.has('POP')}   onClick={() => onToggleBTCLNewType('POP')}   label="POP"                   dotColor="#22c55e" />
                        <CheckItem checked={btclNewTypeFilter.has('MH')}    onClick={() => onToggleBTCLNewType('MH')}    label="MH (Man Hole)"         dotColor="#ef4444" />
                        <CheckItem checked={btclNewTypeFilter.has('Other')} onClick={() => onToggleBTCLNewType('Other')} label="Other"                 dotColor="#94a3b8" />
                      </SubFilters>
                    )}
                  </div>
                </TreeLine>
              )}
            </div>

          </div>
        )}

        <Divider />

        {/* ── 4. Tower Operator ── */}
        <SectionHeader label="Tower Operator" open={secTowerOp} onToggle={() => setSecTowerOp(v => !v)} badge={towerOps.size} />
        {secTowerOp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '2px 0' }}>
            <SubLabel>MNO Towers</SubLabel>
            {(Object.keys(TOWER_OPERATORS) as TowerOperatorKey[])
              .filter(k => TOWER_OPERATORS[k].group === 'mno')
              .map(k => (
                <CheckItem
                  key={k}
                  checked={towerOps.has(k)}
                  onClick={() => onToggleTowerOp(k)}
                  label={TOWER_OPERATORS[k].label}
                  dotColor={TOWER_OPERATORS[k].color}
                />
              ))}
            <SubLabel>TowerCo</SubLabel>
            {(Object.keys(TOWER_OPERATORS) as TowerOperatorKey[])
              .filter(k => TOWER_OPERATORS[k].group === 'towerco')
              .map(k => (
                <CheckItem
                  key={k}
                  checked={towerOps.has(k)}
                  onClick={() => onToggleTowerOp(k)}
                  label={TOWER_OPERATORS[k].label}
                  dotColor={TOWER_OPERATORS[k].color}
                />
              ))}
          </div>
        )}

        <Divider />

        {/* ── 5. ISP ── */}
        <SectionHeader label="ISP" open={secISP} onToggle={() => setSecISP(v => !v)}
          badge={showISPPOPs ? 1 : undefined} />
        {secISP && (
          <div style={{ marginBottom: 4 }}>
            <ToggleBtn on={showISPPOPs} onClick={onToggleISPPOPs} label="ISP POPs" emoji="🌐"
              activeColor={{ border: '#059669', bg: '#ecfdf5', text: '#065f46' }} />
          </div>
        )}

      </div>
    </div>
  )
}
