import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Preferences {
  defaultSequenceLength: number
  defaultSequenceCount: number
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
}

interface PreferencesState extends Preferences {
  updatePreferences: (preferences: Partial<Preferences>) => void
  resetPreferences: () => void
}

const DEFAULT_PREFERENCES: Preferences = {
  defaultSequenceLength: 6,
  defaultSequenceCount: 1,
  theme: 'system',
  notifications: true
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      updatePreferences: (preferences) =>
        set((state) => ({
          ...state,
          ...preferences
        })),
      resetPreferences: () => set(DEFAULT_PREFERENCES)
    }),
    {
      name: 'preferences-storage'
    }
  )
)
