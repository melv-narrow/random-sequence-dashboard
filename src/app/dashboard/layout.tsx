'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Home, PlusCircle, History, Settings, Book, UserCircle, LogOut } from 'lucide-react'
import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Generate', href: '/dashboard/generate', icon: PlusCircle },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Guide', href: '/dashboard/guide', icon: Book },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Account', href: '/dashboard/account', icon: UserCircle },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 dark:border-gray-800 dark:bg-gray-800 sm:hidden">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          Random Sequence
        </span>
        <div className="w-6" /> {/* Spacer for centering */}
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:hidden`}
      >
        <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="absolute inset-y-0 left-0 w-full max-w-xs flex flex-col bg-white shadow-xl transition-transform dark:bg-gray-800">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/logo-light.png"
                  alt="Logo Light"
                  className="block dark:hidden"
                  fill
                  sizes="32px"
                />
                <Image
                  src="/logo-dark.png"
                  alt="Logo Dark"
                  className="hidden dark:block"
                  fill
                  sizes="32px"
                />
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Random Sequence
              </span>
            </div>
            <button
              type="button"
              className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-6 py-3">
              <UserCircle className="h-6 w-6 text-gray-400" />
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                {session?.user?.username || session?.user?.name || 'User'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="mt-4 space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Logout button */}
          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden sm:fixed sm:inset-y-0 sm:flex sm:w-64 sm:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r bg-white dark:border-gray-800 dark:bg-gray-800">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5">
            <div className="flex flex-shrink-0 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8">
                  <Image
                    src="/logo-light.png"
                    alt="Logo Light"
                    className="block dark:hidden"
                    fill
                    sizes="32px"
                  />
                  <Image
                    src="/logo-dark.png"
                    alt="Logo Dark"
                    className="hidden dark:block"
                    fill
                    sizes="32px"
                  />
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  Random Sequence
                </span>
              </div>
            </div>
            <div className="mt-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4 py-3">
                <UserCircle className="h-6 w-6 text-gray-400" />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                  {session?.user?.username || session?.user?.name || 'User'}
                </span>
              </div>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-gray-200 p-3 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                <LogOut className="h-5 w-5" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col sm:pl-64">
        <main className="flex-1">
          <div className="py-6 sm:py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Add top padding on mobile to account for fixed header */}
              <div className="pt-16 sm:pt-0">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
