import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Remove 2FA data from database
    const { db } = await connectToDatabase()
    await db.collection('User').updateOne(
      { email: session.user.email },
      {
        $unset: {
          twoFactorSecret: '',
          twoFactorEnabled: '',
          backupCodes: ''
        }
      }
    )

    return NextResponse.json({ message: '2FA disabled successfully' })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
}
