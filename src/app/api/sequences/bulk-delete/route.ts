import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { sequenceIds } = body

    if (!Array.isArray(sequenceIds) || sequenceIds.length === 0) {
      return new NextResponse('Invalid or empty sequence IDs', { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Convert string IDs to ObjectIds and ensure they belong to the user
    const result = await db.collection('sequences').deleteMany({
      _id: { $in: sequenceIds.map(id => new ObjectId(id)) },
      userId: session.user.email
    })

    if (result.deletedCount === 0) {
      return new NextResponse('No sequences found to delete', { status: 404 })
    }

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} sequences`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Error deleting sequences:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
