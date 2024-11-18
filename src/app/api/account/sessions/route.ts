import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth.config'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { headers } from 'next/headers'

// Get all active sessions for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    
    const sessions = await db.collection('sessions').find({
      userId: new ObjectId(userId),
      isValid: true
    }).project({ sessionToken: 0 }).toArray()
    
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// Revoke a specific session
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { sessionId } = data

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    let objectId: ObjectId
    try {
      objectId = new ObjectId(sessionId)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Only allow users to revoke their own sessions
    const result = await db.collection('sessions').updateOne(
      {
        _id: objectId,
        userId: new ObjectId(userId)
      },
      {
        $set: { isValid: false }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Session revoked successfully' })
  } catch (error) {
    console.error('Error revoking session:', error)
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    )
  }
}
