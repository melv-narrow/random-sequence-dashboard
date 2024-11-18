'use client'

import { useState } from 'react'
import { EmailUpdateData } from '@/types/account'

interface EmailSectionProps {
  currentEmail: string | null | undefined
}

export function EmailSection({ currentEmail }: EmailSectionProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<EmailUpdateData>({
    newEmail: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/account/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email')
      }

      setSuccess(true)
      setFormData({
        newEmail: '',
        password: ''
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-500 dark:bg-green-900/50 dark:text-green-400">
          Email update request sent. Please check your new email address for verification.
        </div>
      )}

      <div>
        <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Current Email
        </label>
        <input
          type="email"
          id="currentEmail"
          value={currentEmail || ''}
          disabled
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          New Email
        </label>
        <input
          type="email"
          name="newEmail"
          id="newEmail"
          required
          value={formData.newEmail}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        />
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
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {loading ? (
            <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Update Email'
          )}
        </button>
      </div>
    </form>
  )
}
