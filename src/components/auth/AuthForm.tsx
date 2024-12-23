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
          <div className="animate-slide-down rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-400 flex items-center space-x-2">
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="group">
            <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Two-Factor Authentication Code
            </label>
            <div className="relative mt-1">
              <input
                id="twoFactorCode"
                name="twoFactorCode"
                type="text"
                required
                value={formData.twoFactorCode}
                onChange={handleChange}
                className="peer block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20 sm:text-sm ring-1 ring-transparent focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50"
                placeholder="Enter 6-digit code"
              />
            </div>
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
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600"
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            {loading ? (
              <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-white/70 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            )}
          </span>
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setShowTwoFactor(false)
              setFormData(prev => ({ ...prev, twoFactorCode: '', isBackupCode: false }))
            }}
            className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200 dark:text-indigo-400 dark:hover:text-indigo-300"
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
        <div className="animate-slide-down rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-400 flex items-center space-x-2">
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {mode === 'signin' ? (
          <div className="group">
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username or Email
            </label>
            <div className="relative mt-1">
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="peer block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20 sm:text-sm ring-1 ring-transparent focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50"
                placeholder="Enter your username or email"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="group">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="relative mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="peer block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20 sm:text-sm ring-1 ring-transparent focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="peer block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20 sm:text-sm ring-1 ring-transparent focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </>
        )}

        <div className="group">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="peer block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20 sm:text-sm ring-1 ring-transparent focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50"
              placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
            />
          </div>
          {mode === 'signup' && (
            <PasswordStrengthIndicator password={formData.password} />
          )}
          {mode === 'signin' && (
            <div className="mt-1 text-right">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/forgot-password'
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        {mode === 'signup' && (
          <div className="group">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="peer block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20 sm:text-sm ring-1 ring-transparent focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50"
                placeholder="Confirm your password"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600"
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            {loading ? (
              <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-white/70 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            )}
          </span>
          {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </form>
  )
}
