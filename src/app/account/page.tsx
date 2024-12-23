import { TwoFactorSection } from '@/components/account/TwoFactorSection'
import { SessionsSection } from '@/components/account/SessionsSection'

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
      
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <TwoFactorSection />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <SessionsSection />
        </div>
      </div>
    </div>
  )
}
