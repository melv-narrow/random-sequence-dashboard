import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyTOTP, verifyBackupCode } from '@/lib/twoFactor'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { token, isBackupCode = false } = await req.json()

    // Get user's 2FA data
    const { db } = await connectToDatabase()
    const user = await db.collection('User').findOne(
      { email: session.user.email }
    )

    if (!user?.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      )
    }

    let isValid = false

    if (isBackupCode) {
      // Verify backup code
      isValid = await verifyBackupCode(token, user.backupCodes)
      
      if (isValid) {
        // Remove used backup code
        await db.collection('User').updateOne(
          { email: session.user.email },
          {
            $pull: {
              backupCodes: await hashBackupCode(token)
            }
          }
        )
      }
    } else {
      // Verify TOTP
      isValid = verifyTOTP(token, user.twoFactorSecret)
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    return NextResponse.json({ verified: true })
  } catch (error) {
    console.error('2FA verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
