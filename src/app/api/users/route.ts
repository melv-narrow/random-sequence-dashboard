import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    const user = await db.collection('users').findOne({ email: session.user.email })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      email: session.user.email
    })

    if (existingUser) {
      return NextResponse.json(existingUser)
    }

    // Create new user
    const user = {
      email: session.user.email,
      name: session.user.name,
      createdAt: new Date(),
      lastLogin: new Date(),
      preferences: {
        defaultSequenceLength: 6
      }
    }

    await db.collection('users').insertOne(user)
    return NextResponse.json(user)
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 