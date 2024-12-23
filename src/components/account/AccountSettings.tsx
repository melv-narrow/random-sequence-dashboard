'use client'

import { useState } from 'react'
import { User } from 'next-auth'
import { ProfileSection } from './ProfileSection'
import { PasswordSection } from './PasswordSection'
import { EmailSection } from './EmailSection'
import { DangerZone } from './DangerZone'
import { TwoFactorSection } from './TwoFactorSection'
import { SessionsSection } from './SessionsSection'
import { ChevronDown as ChevronDownIcon } from 'lucide-react'

interface AccountSettingsProps {
  user: User
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'email', label: 'Email' },
    { id: '2fa', label: 'Two-Factor Auth' },
    { id: 'sessions', label: 'Active Sessions' },
    { id: 'danger', label: 'Danger Zone' }
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setIsMenuOpen(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      {/* Mobile Dropdown */}
      <div className="md:hidden border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isMenuOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>
        
        {isMenuOpen && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  w-full px-4 py-3 text-left text-sm
                  ${activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:block border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {activeTab === 'profile' && <ProfileSection user={user} />}
        {activeTab === 'password' && <PasswordSection />}
        {activeTab === 'email' && <EmailSection currentEmail={user.email} />}
        {activeTab === '2fa' && <TwoFactorSection />}
        {activeTab === 'sessions' && <SessionsSection />}
        {activeTab === 'danger' && <DangerZone />}
      </div>
    </div>
  )
}
