import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import { redirect } from 'next/navigation'
import TwoFactorForm from '@/components/auth/TwoFactorForm'

export default async function TwoFactorPage() {
  const session = await getServerSession(authOptions)

  // If user is already authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please enter your verification code
          </p>
        </div>
        <TwoFactorForm />
      </div>
    </div>
  )
}
