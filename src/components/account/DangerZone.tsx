'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { AccountDeletionData } from '@/types/account'

export function DangerZone() {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationError, setConfirmationError] = useState(false)
  const [formData, setFormData] = useState<AccountDeletionData>({
    password: '',
    confirmation: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors
    setError(null)
    if (name === 'confirmation') {
      setConfirmationError(value.toLowerCase().trim() !== 'delete my account' && value.length > 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submit clicked')
    
    // Prevent double submission
    if (loading) {
      console.log('Already loading, preventing double submission')
      return
    }
    
    setLoading(true)
    setError(null)

    // Validate confirmation text
    if (formData.confirmation.toLowerCase().trim() !== 'delete my account') {
      console.log('Invalid confirmation text:', formData.confirmation)
      setError('Please type "delete my account" to confirm')
      setConfirmationError(true)
      setLoading(false)
      return
    }

    try {
      console.log('Sending delete request...')
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.password })
      })

      console.log('Delete response status:', res.status)
      const data = await res.json()
      console.log('Delete response data:', data)

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      console.log('Account deleted successfully, signing out...')
      // Sign out and redirect to home page
      await signOut({ 
        callbackUrl: '/',
        redirect: true
      })
    } catch (err: any) {
      console.error('Delete account error:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  if (!showConfirmation) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Delete Account</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Once you delete your account, there is no going back. Please be certain.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowConfirmation(true)}
          className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600"
        >
          Delete Account
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Warning: This action cannot be undone
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>
                This will permanently delete your account and remove all your data from our servers.
                All your sequences, settings, and history will be deleted.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Current Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          required
          disabled={loading}
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          To confirm, type "delete my account" below
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            name="confirmation"
            id="confirmation"
            required
            disabled={loading}
            value={formData.confirmation}
            onChange={handleChange}
            placeholder="delete my account"
            className={`block w-full rounded-md border ${
              confirmationError 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
            } px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm`}
          />
          {confirmationError && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        {confirmationError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            Please type exactly "delete my account" to confirm
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setShowConfirmation(false)
            setFormData({ password: '', confirmation: '' })
            setError(null)
            setConfirmationError(false)
          }}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || confirmationError}
          className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2">Deleting Account...</span>
            </div>
          ) : (
            'Permanently Delete Account'
          )}
        </button>
      </div>
    </form>
  )
}
