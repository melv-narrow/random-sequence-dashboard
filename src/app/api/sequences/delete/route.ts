import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sequenceId = searchParams.get('id')

    if (!sequenceId) {
      return new NextResponse('Missing sequence ID', { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verify the sequence belongs to the user before deleting
    const sequence = await db.collection('sequences').findOne({
      _id: new ObjectId(sequenceId),
      userId: session.user.email,
    })

    if (!sequence) {
      return new NextResponse('Sequence not found', { status: 404 })
    }

    await db.collection('sequences').deleteOne({
      _id: new ObjectId(sequenceId),
      userId: session.user.email,
    })

    return new NextResponse('Sequence deleted successfully', { status: 200 })
  } catch (error) {
    console.error('Error deleting sequence:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
