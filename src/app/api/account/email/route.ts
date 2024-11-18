import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import { connectToDatabase } from '@/lib/mongodb'
import { EmailUpdateData } from '@/types/account'
import { verifyPassword } from '@/lib/password'
import { sendEmailChangeVerification } from '@/lib/email'

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { newEmail, password }: EmailUpdateData = body

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if new email is already in use
    const existingUser = await db.collection('User').findOne({
      email: newEmail,
      _id: { $ne: session.user.id } // Exclude current user
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 400 }
      )
    }

    // Get user and verify password
    const user = await db.collection('User').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Generate verification token
    const token = crypto.randomUUID()
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Store email change request
    await db.collection('EmailChange').insertOne({
      userId: user._id,
      currentEmail: user.email,
      newEmail,
      token: hashedToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      used: false
    })

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/account/email/verify?token=${token}`
    await sendEmailChangeVerification(newEmail, verificationUrl)

    return NextResponse.json(
      { message: 'Verification email sent to new address' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
