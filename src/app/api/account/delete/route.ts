import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyPassword } from '@/lib/password'
import { ObjectId } from 'mongodb'

export async function DELETE(req: Request) {
  console.log('Delete account request received')
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user)

    if (!session?.user?.email) {
      console.log('Unauthorized: No session or email')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { password } = body
    console.log('Password received:', !!password)

    if (!password) {
      console.log('No password provided')
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Get user and verify password
    const user = await db.collection('User').findOne({ email: session.user.email })
    console.log('User found:', !!user)
    
    if (!user) {
      console.log('User not found')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      console.log('OAuth user detected')
      return NextResponse.json(
        { error: 'Cannot delete OAuth account using password. Please use your OAuth provider to manage your account.' },
        { status: 400 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password)
    console.log('Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('Invalid password')
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    const userId = new ObjectId(user._id)
    console.log('Starting data deletion for user:', userId)

    // Delete all user data
    try {
      await Promise.all([
        // Delete user's sequences
        db.collection('Sequence').deleteMany({ userId }).then(r => 
          console.log('Sequences deleted:', r.deletedCount)
        ),
        
        // Delete user's history
        db.collection('History').deleteMany({ userId }).then(r => 
          console.log('History deleted:', r.deletedCount)
        ),
        
        // Delete any pending email changes
        db.collection('EmailChange').deleteMany({ userId }).then(r => 
          console.log('Email changes deleted:', r.deletedCount)
        ),
        
        // Delete any password reset tokens
        db.collection('PasswordReset').deleteMany({ email: user.email }).then(r => 
          console.log('Password resets deleted:', r.deletedCount)
        ),
        
        // Delete any sessions
        db.collection('sessions').deleteMany({ 
          'session.user.email': user.email 
        }).then(r => console.log('Sessions deleted:', r.deletedCount)),
        
        // Delete any accounts
        db.collection('accounts').deleteMany({ userId }).then(r => 
          console.log('OAuth accounts deleted:', r.deletedCount)
        ),
        
        // Finally, delete the user
        db.collection('User').deleteOne({ _id: userId }).then(r => 
          console.log('User deleted:', r.deletedCount)
        )
      ])

      console.log('Account deletion completed successfully')
      return NextResponse.json(
        { message: 'Account deleted successfully' },
        { status: 200 }
      )
    } catch (error) {
      console.error('Error deleting user data:', error)
      return NextResponse.json(
        { error: 'Failed to delete account data' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
