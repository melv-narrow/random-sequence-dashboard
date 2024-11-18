'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [formData, setFormData] = useState({
    identifier: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    twoFactorCode: '',
    isBackupCode: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }

        // Register user
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed')
        }

        // Auto sign in after registration
        const signInResult = await signIn('credentials', {
          identifier: formData.username,
          password: formData.password,
          redirect: false
        })

        if (signInResult?.error) {
          throw new Error('Failed to sign in after registration')
        }

        router.push('/dashboard')
      } else {
        if (showTwoFactor) {
          // Handle 2FA verification
          const result = await signIn('2fa', {
            email: formData.identifier,
            code: formData.twoFactorCode,
            isBackupCode: formData.isBackupCode,
            redirect: false,
            callbackUrl: '/dashboard'
          })

          if (result?.error) {
            throw new Error(result.error)
          }
          
          if (result?.url) {
            router.push(result.url)
          }
          return
        }

        // Normal login flow
        const result = await signIn('credentials', {
          identifier: formData.identifier,
          password: formData.password,
          redirect: false,
          callbackUrl: '/dashboard'
        })

        if (!result) {
          throw new Error('Authentication failed')
        }

        if (result.error) {
          throw new Error(result.error || 'Invalid credentials')
        }

        // Check if user needs 2FA
        const session = await getSession()
        if (session?.user?.requires2FA) {
          setShowTwoFactor(true)
          return
        }

        // No 2FA required, proceed to dashboard
        if (result.url) {
          router.push(result.url)
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (showTwoFactor) {
    return (
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Two-Factor Authentication Code
            </label>
            <input
              id="twoFactorCode"
              name="twoFactorCode"
              type="text"
              required
              value={formData.twoFactorCode}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Enter 6-digit code"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Enter the verification code from your authenticator app
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isBackupCode"
              name="isBackupCode"
              checked={formData.isBackupCode}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="isBackupCode" className="text-sm text-gray-700 dark:text-gray-300">
              Use backup code instead
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-indigo-500"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setShowTwoFactor(false)
              setFormData(prev => ({ ...prev, twoFactorCode: '', isBackupCode: false }))
            }}
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Back to Sign In
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {mode === 'signin' ? (
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username or Email
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              value={formData.identifier}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Enter your username or email"
            />
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
          {mode === 'signup' && (
            <PasswordStrengthIndicator password={formData.password} />
          )}
          {mode === 'signin' && (
            <div className="mt-1 text-right">
              <button
                type="button"
                onClick={() => {
                  // Use window.location to bypass NextAuth's route interception
                  window.location.href = '/forgot-password'
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>
        )}
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
          ) : mode === 'signin' ? (
            'Sign In'
          ) : (
            'Sign Up'
          )}
        </button>
      </div>
    </form>
  )
}
