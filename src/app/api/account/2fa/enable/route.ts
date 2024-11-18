import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyTOTP, generateBackupCodes, hashBackupCode } from '@/lib/twoFactor'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { secret, token } = await req.json()

    // Verify the token matches the secret
    const isValid = verifyTOTP(token, secret)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => hashBackupCode(code))
    )

    // Store 2FA data in database
    const { db } = await connectToDatabase()
    await db.collection('User').updateOne(
      { email: session.user.email },
      {
        $set: {
          twoFactorSecret: secret,
          twoFactorEnabled: true,
          backupCodes: hashedBackupCodes
        }
      }
    )

    return NextResponse.json({ backupCodes })
  } catch (error) {
    console.error('2FA enable error:', error)
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    )
  }
}
