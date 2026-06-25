interface Props {
  size?:    'sm' | 'md' | 'lg'
  message?: string
  inline?:  boolean   // true = no centering wrapper
}

export default function LoadingSpinner({ size = 'md', message, inline }: Props) {
  const dim = size === 'sm' ? 16 : size === 'lg' ? 40 : 24
  const border = size === 'sm' ? 2 : 3

  const spinner = (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: dim, height: dim,
        border: `${border}px solid #e2e8f0`,
        borderTopColor: '#003D7A',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }} />
      {message && <span style={{ fontSize: 12, color: '#94a3b8' }}>{message}</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (inline) return spinner

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, width: '100%',
    }}>
      {spinner}
    </div>
  )
}
