'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { TOTPConfig } from '@/lib/twoFactor'

export function TwoFactorSection() {
  const { data: session, update: updateSession } = useSession()
  const [step, setStep] = useState<'initial' | 'setup' | 'verify'>('initial')
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totpConfig, setTotpConfig] = useState<TOTPConfig | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Check 2FA status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/account/2fa/status')
        if (res.ok) {
          const { enabled } = await res.json()
          setTwoFactorEnabled(enabled)
        }
      } catch (err) {
        console.error('Failed to fetch 2FA status:', err)
      } finally {
        setStatusLoading(false)
      }
    }
    checkStatus()
  }, [])

  const handleSetup = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/account/2fa/setup', {
        method: 'POST'
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to setup 2FA')
      }
      
      const config = await res.json()
      setTotpConfig(config)
      setStep('setup')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!totpConfig || !verificationCode) return
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/account/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: totpConfig.secret,
          token: verificationCode
        })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to verify code')
      }
      
      const { backupCodes: codes } = await res.json()
      setBackupCodes(codes)
      setStep('verify')
      
      // Update session to reflect 2FA status
      await updateSession()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/account/2fa/disable', {
        method: 'POST'
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to disable 2FA')
      }
      
      // Reset state
      setStep('initial')
      setTotpConfig(null)
      setVerificationCode('')
      setBackupCodes([])
      
      // Update session to reflect 2FA status
      await updateSession()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (step === 'verify') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Two-Factor Authentication Enabled
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
          </p>
        </div>

        <div className="rounded-md bg-gray-50 p-4 font-mono text-sm dark:bg-gray-800">
          {backupCodes.map((code, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{(i + 1).toString().padStart(2, '0')}.</span>
              <span className="text-gray-900 dark:text-gray-100">{code}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleDisable}
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Disable Two-Factor Authentication
        </button>
      </div>
    )
  }

  if (step === 'setup') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Set Up Two-Factor Authentication
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Scan this QR code with your authenticator app, then enter the verification code below.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          {totpConfig?.qrCode && (
            <img
              src={totpConfig.qrCode}
              alt="QR Code"
              className="h-48 w-48 rounded-lg bg-white p-2"
            />
          )}
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Verification Code
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="code"
              id="code"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || !verificationCode}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify and Enable'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('initial')
              setTotpConfig(null)
              setVerificationCode('')
              setError(null)
            }}
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Initial state - show status and appropriate action button
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Two-Factor Authentication
        </h3>
        <div className="mt-2 flex items-center space-x-2">
          <div className={`h-2.5 w-2.5 rounded-full ${twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {twoFactorEnabled ? 'Enabled' : 'Not enabled'}
          </p>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {twoFactorEnabled
            ? 'Your account is protected with two-factor authentication.'
            : 'Add an extra layer of security to your account by enabling two-factor authentication.'}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      {twoFactorEnabled ? (
        <button
          type="button"
          onClick={handleDisable}
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSetup}
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Set Up Two-Factor Authentication'}
        </button>
      )}
    </div>
  )
}
