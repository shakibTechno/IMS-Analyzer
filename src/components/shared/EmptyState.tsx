interface Props {
  icon?:     string   // emoji
  title:     string
  message?:  string
  action?:   React.ReactNode
}

export default function EmptyState({ icon = '📭', title, message, action }: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
      gap: 10,
    }}>
      <span style={{ fontSize: 36 }}>{icon}</span>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{title}</div>
      {message && (
        <div style={{ fontSize: 12, color: '#94a3b8', maxWidth: 280, lineHeight: 1.5 }}>
          {message}
        </div>
      )}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  )
}
