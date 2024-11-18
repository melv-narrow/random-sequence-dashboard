import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import { AccountSettings } from '@/components/account/AccountSettings'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/')
  }

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    username: session.user.username,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Account Settings
        </h1>
        
        <AccountSettings user={user} />
      </div>
    </div>
  )
}
