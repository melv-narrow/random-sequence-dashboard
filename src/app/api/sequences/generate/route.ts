import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { length = 6, count = 1 } = await request.json()

    const { db } = await connectToDatabase()
    const sequences: number[][] = []

    for (let i = 0; i < count; i++) {
      const sequence = generateUniqueSequence(length)
      
      // Save sequence to database
      const sequenceDoc = {
        userId: session.user.email,
        numbers: sequence,
        createdAt: new Date(),
        metadata: {
          sequenceLength: length,
          totalSequences: count
        }
      }
      
      const result = await db.collection('sequences').insertOne(sequenceDoc)
      sequences.push(sequence)
    }

    return NextResponse.json({ sequences })
  } catch (error) {
    console.error('Generate API error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate sequences' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

function generateUniqueSequence(length: number): number[] {
  const sequence: number[] = []
  const usedNumbers = new Set<number>()

  for (let i = 0; i < length; i++) {
    let randomNum: number
    const maxNum = i < 5 ? 50 : 20 // First 5 numbers 1-50, rest 1-20

    do {
      randomNum = Math.floor(Math.random() * maxNum) + 1
    } while (usedNumbers.has(randomNum))

    usedNumbers.add(randomNum)
    sequence.push(randomNum)
  }

  return sequence
}
