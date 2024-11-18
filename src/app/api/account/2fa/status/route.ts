import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const user = await db.collection('User').findOne(
      { email: session.user.email },
      { projection: { twoFactorEnabled: 1 } }
    )

    return NextResponse.json({
      enabled: user?.twoFactorEnabled || false
    })
  } catch (error) {
    console.error('Failed to get 2FA status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
