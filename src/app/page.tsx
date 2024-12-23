'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { AuthForm } from '@/components/auth/AuthForm'
import { AuthToggle } from '@/components/auth/AuthToggle'
import Image from 'next/image'

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 transition-colors duration-300">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Logo and Title */}
            <div className="text-center animate-fade-in">
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
              <h1 className="mt-6 text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Lottery Sequence Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 animate-fade-in-delay">
                Generate and analyze lottery number sequences with advanced statistical insights
              </p>
            </div>

            {/* Auth Form */}
            <div className="animate-slide-up backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50">
              <AuthForm mode={mode} />
            </div>

            {/* Sign In Options */}
            <div className="relative py-6 animate-fade-in-delay">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <div className="animate-slide-up">
              <button
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="group relative flex w-full items-center justify-center gap-3 rounded-xl border bg-white/80 dark:bg-gray-800/80 px-6 py-4 text-gray-600 dark:text-gray-300 shadow-md transition-all duration-300 hover:shadow-xl hover:bg-white dark:border-gray-700 dark:hover:bg-gray-800 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-sm font-medium">Sign in with Google</span>
              </button>
            </div>

            {/* Auth Toggle */}
            <AuthToggle mode={mode} onToggle={toggleMode} />
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 lg:bg-gray-900/10 dark:lg:bg-gray-800/20 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sequence Generation */}
                <div className="group p-6 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sequence Generation</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Generate unique number sequences</p>
                </div>

                {/* Statistical Analysis */}
                <div className="group p-6 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Statistical Analysis</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Advanced pattern recognition</p>
                </div>

                {/* Visual Insights */}
                <div className="group p-6 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visual Insights</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Interactive data visualization</p>
                </div>

                {/* Real-time Updates */}
                <div className="group p-6 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Updates</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Instant sequence analysis</p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-sm text-center lg:text-left text-gray-500 dark:text-gray-400 mt-8">
              By signing in, you agree that this tool is for entertainment purposes only and does not guarantee any lottery outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
