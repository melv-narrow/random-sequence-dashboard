'use client'

import { useState } from 'react'
import { usePreferencesStore } from '@/lib/stores/preferences'
import { useToast } from '@/components/ui/toast'
import { Dialog } from '@/components/ui/dialog'
import { useTheme } from '@/components/providers/theme-provider'
import { signOut } from 'next-auth/react'
import { 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  BellOff, 
  RotateCcw,
  LogOut
} from 'lucide-react'

export default function SettingsPage() {
  const { addToast, ToastContainer } = useToast()
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const { theme: themePreference, updatePreferences, resetPreferences } = usePreferencesStore()
  const { setTheme } = useTheme()
  const {
    defaultSequenceLength,
    defaultSequenceCount,
    notifications,
  } = usePreferencesStore()

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme: newTheme })
    setTheme(newTheme)
    addToast(`Theme set to ${newTheme} mode`)
  }

  const handleReset = () => {
    resetPreferences()
    setResetDialogOpen(false)
    addToast('Settings reset to defaults')
  }

  const handleSignOut = () => {
    signOut({
      callbackUrl: '/',
      redirect: true
    })
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Customize your sequence generation and analysis preferences.
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Default Preferences */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Default Preferences</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Sequence Length
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={defaultSequenceLength}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (value >= 1 && value <= 50) {
                    updatePreferences({ defaultSequenceLength: value })
                    addToast('Default sequence length updated')
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose between 1 and 50 numbers per sequence
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Number of Sequences
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={defaultSequenceCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (value >= 1 && value <= 10) {
                    updatePreferences({ defaultSequenceCount: value })
                    addToast('Default sequence count updated')
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Generate up to 10 sequences at once
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center justify-center gap-2 rounded-lg border p-4 transition-colors ${
                  themePreference === 'light'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
                }`}
              >
                <Sun className="h-5 w-5" />
                Light
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center justify-center gap-2 rounded-lg border p-4 transition-colors ${
                  themePreference === 'dark'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
                }`}
              >
                <Moon className="h-5 w-5" />
                Dark
              </button>

              <button
                onClick={() => handleThemeChange('system')}
                className={`flex items-center justify-center gap-2 rounded-lg border p-4 transition-colors ${
                  themePreference === 'system'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
                }`}
              >
                <Monitor className="h-5 w-5" />
                System
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Show notifications for important events and updates
              </p>
            </div>
            <button
              onClick={() => {
                updatePreferences({ notifications: !notifications })
                addToast(
                  `Notifications ${!notifications ? 'enabled' : 'disabled'}`
                )
              }}
              className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                notifications
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'border-gray-200 text-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
              }`}
            >
              {notifications ? (
                <Bell className="h-5 w-5" />
              ) : (
                <BellOff className="h-5 w-5" />
              )}
              {notifications ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Reset Settings */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reset Settings
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Restore all settings to their default values
              </p>
            </div>
            <button
              onClick={() => setResetDialogOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <RotateCcw className="h-5 w-5" />
              Reset All
            </button>
          </div>
        </div>
      </div>

      <Dialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        title="Reset Settings"
        description="Are you sure you want to reset all settings to their default values? This action cannot be undone."
        onConfirm={handleReset}
        confirmText="Reset All"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}
