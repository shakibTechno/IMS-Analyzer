import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export interface PieSlice {
  name:  string
  value: number
  color: string
}

interface Props {
  title: string
  data:  PieSlice[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: PieSlice }[] }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: slice } = payload[0]
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: '8px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      fontSize: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: slice.color, display: 'inline-block' }} />
        <span style={{ fontWeight: 700, color: '#1e293b' }}>{name}</span>
      </div>
      <div style={{ color: '#475569', marginTop: 2 }}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: { value: string; payload: PieSlice }[] }) {
  if (!payload) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 12px', marginTop: 8 }}>
      {payload.map(entry => (
        <div key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.payload.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: '#475569' }}>{entry.value}</span>
          <span style={{ fontWeight: 700, color: '#1e293b' }}>({entry.payload.value.toLocaleString()})</span>
        </div>
      ))}
    </div>
  )
}

export default function SimplePieChart({ title, data }: Props) {
  const nonZero = data.filter(d => d.value > 0)
  if (nonZero.length === 0) return null

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '16px 16px 12px',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={nonZero}
            cx="50%"
            cy="45%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {nonZero.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
