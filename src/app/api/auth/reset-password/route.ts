import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { hashToken } from '@/lib/token'
import { hashPassword } from '@/lib/password'
import { validatePassword } from '@/lib/password'
import { PasswordResetSubmission } from '@/types/password-reset'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password, confirmPassword }: PasswordResetSubmission = body

    // Validate input
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const hashedToken = hashToken(token)

    // Find valid reset token
    const resetRequest = await db.collection('PasswordReset').findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }
    })

    if (!resetRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user's password
    const result = await db.collection('User').updateOne(
      { email: resetRequest.email },
      { 
        $set: { 
          password: hashedPassword,
          lastPasswordReset: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Mark reset token as used
    await db.collection('PasswordReset').updateOne(
      { _id: resetRequest._id },
      { $set: { used: true } }
    )

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
