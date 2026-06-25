interface Props {
  title:     string
  subtitle?: string
  action?:   React.ReactNode   // optional right-side button/badge
}

export default function SectionHeader({ title, subtitle, action }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: 12,
      marginBottom: 12,
    }}>
      <div>
        <div style={{
          fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
