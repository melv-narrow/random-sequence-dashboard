'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'

export default function TwoFactorForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isBackupCode, setIsBackupCode] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const email = searchParams.get('email')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('2fa', {
        email,
        code,
        isBackupCode: isBackupCode.toString(),
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        <div>
          <Label htmlFor="code">
            {isBackupCode ? 'Backup Code' : 'Verification Code'}
          </Label>
          <Input
            id="code"
            name="code"
            type="text"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1"
            placeholder={isBackupCode ? 'Enter backup code' : 'Enter 6-digit code'}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="backup"
            checked={isBackupCode}
            onCheckedChange={(checked) => setIsBackupCode(checked as boolean)}
          />
          <Label htmlFor="backup">
            Use backup code
          </Label>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading && (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        Verify
      </Button>
    </form>
  )
}
