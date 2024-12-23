import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import { connectToDatabase } from '@/lib/mongodb'
import { ProfileUpdateData } from '@/types/account'

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
    const { name, username }: ProfileUpdateData = body

    if (!name && !username) {
      return NextResponse.json(
        { error: 'No changes provided' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if username is taken (if username is being changed)
    if (username) {
      const existingUser = await db.collection('User').findOne({
        username,
        email: { $ne: session.user.email } // Exclude current user
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        )
      }
    }

    // Update user profile
    const updateData: Partial<ProfileUpdateData> = {}
    if (name) updateData.name = name
    if (username) updateData.username = username

    const result = await db.collection('User').updateOne(
      { email: session.user.email },
      { $set: updateData }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
