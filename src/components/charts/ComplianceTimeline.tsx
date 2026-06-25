import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import type { DailySubmission } from '@/data/submissionHistory'

interface Props {
  data:   DailySubmission[]
  height?: number
}

const COLORS = { onTime: '#22c55e', late: '#f59e0b', missing: '#ef4444' }

// ─── Custom tooltip ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0', borderRadius: 7,
      padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
          <span style={{ color: '#64748b', minWidth: 50 }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ComplianceTimeline({ data, height = 220 }: Props) {
  // Format date for X axis: "Apr 07" → "07"
  const chartData = data.map(d => ({
    ...d,
    dateLabel: d.date.slice(8),   // "2026-04-07" → "07"
  }))

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barSize={14} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="square" iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
          <Bar dataKey="onTime"  name="On Time" stackId="a" fill={COLORS.onTime}  radius={[0,0,0,0]} isAnimationActive={false} />
          <Bar dataKey="late"    name="Late"    stackId="a" fill={COLORS.late}    isAnimationActive={false} />
          <Bar dataKey="missing" name="Missing" stackId="a" fill={COLORS.missing} radius={[3,3,0,0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
