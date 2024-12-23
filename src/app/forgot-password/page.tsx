import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/auth.config'
import Image from 'next/image'

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto w-16 h-16 mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-75 blur"></div>
            <div className="relative rounded-full bg-white dark:bg-gray-800 p-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo-light.png"
                  alt="Logo Light"
                  className="block dark:hidden"
                  fill
                  sizes="40px"
                />
                <Image
                  src="/logo-dark.png"
                  alt="Logo Dark"
                  className="hidden dark:block"
                  fill
                  sizes="40px"
                />
              </div>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password
          </p>
          <p className="mt-2 text-center">
            <Link
              href="/"
              className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Back to Sign In
            </Link>
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  )
}
