import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: (error: Error) => ReactNode
}

interface State {
  error: Error | null
}

// ─── ErrorBoundary ────────────────────────────────────────────────
// Catches render errors and shows a readable message instead of
// a blank screen. Used to wrap pages and map components.

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error)
      return (
        <div style={{
          padding: 24, background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, margin: 16,
        }}>
          <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>
            Render error (check console for details)
          </div>
          <pre style={{
            fontSize: 11, color: '#7f1d1d', whiteSpace: 'pre-wrap',
            wordBreak: 'break-word', margin: 0,
          }}>
            {this.state.error.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
