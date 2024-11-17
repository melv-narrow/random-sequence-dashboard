import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { hashPassword } from '@/lib/password'
import { validatePassword } from '@/lib/password'
import { UserCredentials } from '@/types/user'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, email, password }: UserCredentials = body

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if username or email already exists
    const existingUser = await db.collection('User').findOne({
      $or: [
        { username },
        { email }
      ]
    })

    if (existingUser) {
      const field = existingUser.username === username ? 'username' : 'email'
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      name: username, // Use username as initial name
      authType: 'credentials',
      createdAt: new Date(),
      lastLogin: new Date(),
      emailVerified: null,
      preferences: {
        defaultSequenceLength: 6
      }
    }

    const result = await db.collection('User').insertOne(newUser)

    if (!result.insertedId) {
      throw new Error('Failed to create user')
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'User registered successfully',
        user: {
          id: result.insertedId.toString(),
          username,
          email
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
