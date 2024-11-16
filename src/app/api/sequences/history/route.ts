import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config'

interface SequenceQuery {
  userId: string
  createdAt?: {
    $gte?: Date
    $lte?: Date
  }
  'metadata.sequenceLength'?: number
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()
    
    const query: SequenceQuery = {
      userId: session.user.email
    }

    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const sequenceLength = searchParams.get('sequenceLength')

    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom)
      if (dateTo) query.createdAt.$lte = new Date(dateTo)
    }

    if (sequenceLength) {
      query['metadata.sequenceLength'] = parseInt(sequenceLength)
    }

    const total = await db.collection('sequences').countDocuments(query)

    const sequences = await db
      .collection('sequences')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      sequences,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        pageSize: limit
      }
    })
  } catch (error) {
    console.error('History API error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch sequences',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
