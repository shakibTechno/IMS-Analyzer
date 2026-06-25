import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import btrcLogo from '@/assets/Logo/btrcLogo.png'

export default function Login() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const login      = useAuthStore(s => s.login)
  const error      = useAuthStore(s => s.error)
  const clearError = useAuthStore(s => s.clearError)

  const [username,     setUsername]     = useState('')
  const [password,     setPassword]     = useState('')
  const [loading,      setLoading]      = useState(false)
  const [showPass,     setShowPass]     = useState(false)
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null)

  const from = (location.state as { from?: string })?.from ?? '/'

  useEffect(() => { clearError() }, [clearError])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) return
    setLoading(true)
    setTimeout(() => {
      const ok = login(username, password)
      setLoading(false)
      if (ok) navigate(from, { replace: true })
    }, 350)
  }

  const canSubmit = !loading && !!username && !!password

  function inputStyle(field: 'username' | 'password'): React.CSSProperties {
    const focused = focusedField === field
    return {
      width: '100%', height: 46, padding: '0 14px',
      borderRadius: 10, fontSize: 14,
      background: 'rgba(14,30,54,0.9)',
      border: error
        ? '1px solid rgba(239,68,68,0.7)'
        : focused
        ? '1px solid rgba(56,189,248,0.6)'
        : '1px solid rgba(255,255,255,0.1)',
      outline: 'none', color: '#e2e8f0',
      WebkitTextFillColor: '#e2e8f0',
      caretColor: '#38bdf8',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: error
        ? '0 0 0 3px rgba(239,68,68,0.12)'
        : focused
        ? '0 0 0 3px rgba(56,189,248,0.12)'
        : 'none',
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, #0c2a4a 0%, #050d1a 50%, #080d1a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(14,30,54,0.95) inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: #38bdf8;
        }
      `}</style>
      {/* Ambient glow blobs */}
      <div style={{
        position: 'absolute', top: '8%', left: '12%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '8%', right: '12%',
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        background: 'rgba(12,22,40,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        width: '100%', maxWidth: 400,
        overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, #38bdf8 40%, #6366f1 70%, transparent 100%)',
        }} />

        <div style={{ padding: '36px 36px 32px' }}>
          {/* Logo + title */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(56,189,248,0.25)',
              boxShadow: '0 0 24px rgba(56,189,248,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', padding: 10,
            }}>
              <img src={btrcLogo} alt="BTRC" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', letterSpacing: '-0.02em', marginBottom: 6 }}>
              BTRC IMS
            </div>
            <div style={{
              fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
              color: '#00f5ff',
              textShadow: '0 0 8px rgba(0,245,255,0.8), 0 0 20px rgba(0,245,255,0.4)',
            }}>
              Infrastructure Monitoring System
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: 'rgba(148,163,184,0.85)', marginBottom: 7,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); clearError() }}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
                style={inputStyle('username')}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24, position: 'relative' }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: 'rgba(148,163,184,0.85)', marginBottom: 7,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError() }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{ ...inputStyle('password'), paddingRight: 52 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                style={{
                  position: 'absolute', right: 13, bottom: 14,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(148,163,184,0.55)', padding: 0, lineHeight: 1,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                fontSize: 12, color: '#f87171', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>&#9888;</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: '100%', height: 46, borderRadius: 10,
                background: canSubmit
                  ? 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)'
                  : 'rgba(255,255,255,0.05)',
                color: canSubmit ? 'white' : 'rgba(148,163,184,0.4)',
                border: 'none',
                cursor: canSubmit ? 'pointer' : 'default',
                fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
                boxShadow: canSubmit ? '0 4px 24px rgba(14,165,233,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 36px 20px', textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{
            fontSize: 10, letterSpacing: '0.05em',
            color: '#00f5ff',
            textShadow: '0 0 8px rgba(0,245,255,0.8), 0 0 20px rgba(0,245,255,0.4)',
          }}>
            Bangladesh Telecommunication Regulatory Commission
          </span>
        </div>
      </div>
    </div>
  )
}
