import { GenerateSequenceParams } from '@/types'
import clientPromise from './mongodb'
import crypto from 'crypto'

export async function generateUniqueSequence(
  length: number,
  existingSequences: number[][]
): Promise<number[]> {
  let isUnique = false
  let sequence: number[] = []

  while (!isUnique) {
    // Generate a new sequence
    sequence = Array.from({ length }, () =>
      crypto.randomInt(1, 100) // Generate numbers between 1 and 99
    )

    // Check if this sequence exists
    isUnique = !existingSequences.some((existing) =>
      existing.every((num, idx) => num === sequence[idx])
    )
  }

  return sequence
}

export async function generateSequences(
  params: GenerateSequenceParams,
  userId: string
) {
  const client = await clientPromise
  const db = client.db()
  const sequencesCollection = db.collection('sequences')

  // Get existing sequences for uniqueness check
  const existingSequences = await sequencesCollection
    .find({}, { projection: { numbers: 1, _id: 0 } })
    .toArray()
  const existingNumberArrays = existingSequences.map((seq) => seq.numbers)

  const sequences: number[][] = []
  for (let i = 0; i < params.numberOfSequences; i++) {
    const sequence = await generateUniqueSequence(
      params.numbersPerSequence,
      [...existingNumberArrays, ...sequences]
    )
    sequences.push(sequence)
  }

  // Store sequences in database
  const sequenceDocuments = sequences.map((numbers) => ({
    userId,
    numbers,
    createdAt: new Date(),
    metadata: {
      sequenceLength: params.numbersPerSequence,
      totalSequences: params.numberOfSequences,
    },
  }))

  await sequencesCollection.insertMany(sequenceDocuments)

  return sequences
}

export async function getUserSequences(userId: string, page = 1, limit = 10) {
  const client = await clientPromise
  const db = client.db()
  const skip = (page - 1) * limit

  const sequences = await db
    .collection('sequences')
    .find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()

  const total = await db.collection('sequences').countDocuments({ userId })

  return {
    sequences,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
    },
  }
}
