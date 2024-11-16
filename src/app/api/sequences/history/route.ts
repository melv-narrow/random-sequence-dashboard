import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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
    console.log('Session data:', {
      email: session?.user?.email,
      name: session?.user?.name
    })

    if (!session?.user?.email) {
      console.log('No authenticated user found')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()
    
    // Basic query to test if any documents exist for the user
    const testQuery = { userId: session.user.email }
    const testCount = await db.collection('sequences').countDocuments(testQuery)
    console.log('Basic query count:', testCount)
    console.log('Test query:', JSON.stringify(testQuery, null, 2))

    // Your existing query building code
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

    console.log('Final MongoDB Query:', JSON.stringify(query, null, 2))

    // Test a direct find operation
    const sampleDocs = await db
      .collection('sequences')
      .find({})
      .limit(1)
      .toArray()
    console.log('Sample document structure:', JSON.stringify(sampleDocs[0], null, 2))

    const total = await db.collection('sequences').countDocuments(query)
    console.log('Total documents found:', total)

    const sequences = await db
      .collection('sequences')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    console.log('Sequences found:', sequences.length)

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
