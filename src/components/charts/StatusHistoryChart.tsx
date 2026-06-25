import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import type { NationalHourlyCount } from '@/data/statusHistory'

interface Props {
  data:    NationalHourlyCount[]
  height?: number
}

const COLORS = { active: '#22c55e', degraded: '#f59e0b', down: '#ef4444' }

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0', borderRadius: 7,
      padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: '#64748b', minWidth: 56 }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{p.value} sites</span>
        </div>
      ))}
    </div>
  )
}

export default function StatusHistoryChart({ data, height = 200 }: Props) {
  // Show every 4th label to avoid crowding
  const tickFormatter = (_: string, index: number) => index % 4 === 0 ? data[index]?.time ?? '' : ''

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            {Object.entries(COLORS).map(([key, color]) => (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={tickFormatter}
            axisLine={false} tickLine={false}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 55]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Area type="monotone" dataKey="active"   name="Active"   stroke={COLORS.active}   strokeWidth={2}   fill={`url(#grad-active)`}   isAnimationActive={false} />
          <Area type="monotone" dataKey="degraded" name="Degraded" stroke={COLORS.degraded} strokeWidth={1.5} fill={`url(#grad-degraded)`} isAnimationActive={false} />
          <Area type="monotone" dataKey="down"     name="Down"     stroke={COLORS.down}     strokeWidth={1.5} fill={`url(#grad-down)`}     isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
