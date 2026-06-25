import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface ThemeStore {
  theme:  Theme
  toggle: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggle: () => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'btrc-ims-theme' }
  )
)
