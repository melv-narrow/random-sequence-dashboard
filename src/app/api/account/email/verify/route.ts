import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import crypto from 'crypto'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const { db } = await connectToDatabase()

    // Find and validate token
    const emailChange = await db.collection('EmailChange').findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }
    })

    if (!emailChange) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    // Update user's email
    const result = await db.collection('User').updateOne(
      { _id: emailChange.userId },
      { $set: { email: emailChange.newEmail } }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Mark token as used
    await db.collection('EmailChange').updateOne(
      { _id: emailChange._id },
      { $set: { used: true } }
    )

    // Redirect to success page
    return NextResponse.redirect(new URL('/dashboard/account?emailVerified=true', req.url))
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
