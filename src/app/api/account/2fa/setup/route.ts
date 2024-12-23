import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import { generateTOTPConfig } from '@/lib/twoFactor'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate TOTP configuration
    const config = await generateTOTPConfig(session.user.email)

    // Store the secret temporarily in the session
    // In production, you might want to use a temporary store like Redis
    session.temp2FASecret = config.secret

    return NextResponse.json(config)
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    )
  }
}
