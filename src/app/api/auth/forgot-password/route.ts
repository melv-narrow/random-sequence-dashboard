import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { generateToken, hashToken } from '@/lib/token'
import { PasswordResetRequest } from '@/types/password-reset'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email }: PasswordResetRequest = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if user exists
    const user = await db.collection('User').findOne({ email })
    if (!user) {
      // Return success even if user doesn't exist to prevent user enumeration
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a password reset link' },
        { status: 200 }
      )
    }

    // Generate reset token
    const token = generateToken()
    const hashedToken = hashToken(token)

    // Store reset token
    await db.collection('PasswordReset').insertOne({
      email,
      token: hashedToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      used: false
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    // TODO: Send email with reset link
    // For now, just log the URL (we'll implement email sending later)
    console.log('Reset URL:', resetUrl)

    return NextResponse.json(
      { message: 'If an account exists with this email, you will receive a password reset link' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
