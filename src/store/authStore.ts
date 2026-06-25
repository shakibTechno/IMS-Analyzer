import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Demo credentials ─────────────────────────────────────────────
// Three roles for demonstration. All share password btrc2026.

export type UserRole = 'admin' | 'viewer' | 'operator'

export interface AuthUser {
  username:    string
  displayName: string
  role:        UserRole
  initials:    string
}

const CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  admin: {
    password: 'btrc2026',
    user: { username: 'admin', displayName: 'BTRC Admin', role: 'admin', initials: 'BA' },
  },
  viewer: {
    password: 'btrc2026',
    user: { username: 'viewer', displayName: 'Read-Only Viewer', role: 'viewer', initials: 'RV' },
  },
  operator: {
    password: 'btrc2026',
    user: { username: 'operator', displayName: 'Operator Liaison', role: 'operator', initials: 'OL' },
  },
}

// ─── Store ────────────────────────────────────────────────────────

interface AuthStore {
  user:    AuthUser | null
  error:   string | null
  login:   (username: string, password: string) => boolean
  logout:  () => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:  null,
      error: null,

      login(username, password) {
        const entry = CREDENTIALS[username.trim().toLowerCase()]
        if (entry && entry.password === password) {
          set({ user: entry.user, error: null })
          return true
        }
        set({ error: 'Invalid username or password.' })
        return false
      },

      logout() {
        set({ user: null, error: null })
      },

      clearError() {
        set({ error: null })
      },
    }),
    {
      name:    'btrc-ims-auth',       // localStorage key
      partialize: (s) => ({ user: s.user }),  // only persist user, not error
    }
  )
)
