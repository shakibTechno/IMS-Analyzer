import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts'
import type { PowerSource } from '@/types/site'
import { POWER_COLORS } from '@/utils/statusColors'
import { useThemeStore } from '@/store/themeStore'

interface DataPoint {
  source: PowerSource
  count:  number
}

interface Props {
  data:    DataPoint[]
  height?: number
  showLegend?: boolean
}

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { pct: number; color: string } }>
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 7,
      padding: '7px 11px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.payload.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
        <span style={{ color: 'var(--text-secondary)' }}>{p.value} sites</span>
        <span style={{ color: '#94a3b8', fontSize: 11 }}>({p.payload.pct}%)</span>
      </div>
    </div>
  )
}

export default function PowerSourcePieChart({ data, height = 200, showLegend = true }: Props) {
  const isDark = useThemeStore(s => s.theme === 'dark')
  const total = data.reduce((s, d) => s + d.count, 0)

  const chartData = data.map(d => ({
    name:  POWER_COLORS[d.source].label,
    value: d.count,
    color: POWER_COLORS[d.source].hex,
    icon:  POWER_COLORS[d.source].icon,
    pct:   total > 0 ? Math.round((d.count / total) * 100) : 0,
  }))

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={showLegend ? '52%' : '42%'}
            outerRadius="78%"
            paddingAngle={2}
            dataKey="value"
            strokeWidth={1}
            stroke={isDark ? '#0f1a2e' : 'white'}
            isAnimationActive={false}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              iconType="circle" iconSize={8}
              wrapperStyle={{ fontSize: 11 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: string, entry: any) =>
                `${value} (${entry?.payload?.pct ?? 0}%)`
              }
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
