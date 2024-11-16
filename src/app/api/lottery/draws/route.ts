import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { LotteryDraw, LotteryDrawInput } from '@/lib/models/lottery-draw'
import { ObjectId } from 'mongodb'

async function getUserEmail() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  
  if (!email) {
    throw new Error('Unauthorized')
  }
  
  return email
}

// GET /api/lottery/draws
export async function GET() {
  try {
    const userEmail = await getUserEmail()
    const { db } = await connectToDatabase()
    
    const draws = await db
      .collection<LotteryDraw>('lotteryDraws')
      .find({ userEmail })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json(draws)
  } catch (error) {
    console.error('Error fetching lottery draws:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/lottery/draws
export async function POST(req: NextRequest) {
  try {
    const userEmail = await getUserEmail()
    const body = (await req.json()) as LotteryDrawInput
    
    // Validate input
    if (!body.date || !body.numbers || body.numbers.length !== 6) {
      return new NextResponse('Invalid input', { status: 400 })
    }

    if (new Set(body.numbers).size !== body.numbers.length) {
      return new NextResponse('Numbers must be unique', { status: 400 })
    }

    if (body.numbers.some(n => n < 1 || n > 50)) {
      return new NextResponse('Numbers must be between 1 and 50', { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Check for duplicate draw date
    const existingDraw = await db
      .collection<LotteryDraw>('lotteryDraws')
      .findOne({ userEmail, date: body.date })

    if (existingDraw) {
      return new NextResponse('Draw already exists for this date', { status: 409 })
    }

    const draw: LotteryDraw = {
      userEmail,
      date: body.date,
      numbers: body.numbers,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.collection<LotteryDraw>('lotteryDraws').insertOne(draw)
    return NextResponse.json(draw)
  } catch (error) {
    console.error('Error creating lottery draw:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/lottery/draws
export async function DELETE(req: NextRequest) {
  try {
    const userEmail = await getUserEmail()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Missing draw ID', { status: 400 })
    }

    const { db } = await connectToDatabase()
    const result = await db
      .collection<LotteryDraw>('lotteryDraws')
      .deleteOne({ _id: new ObjectId(id), userEmail })

    if (result.deletedCount === 0) {
      return new NextResponse('Draw not found', { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting lottery draw:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PUT /api/lottery/draws/bulk
export async function PUT(req: NextRequest) {
  try {
    const userEmail = await getUserEmail()
    const draws = (await req.json()) as LotteryDrawInput[]
    
    // Validate all draws
    for (const draw of draws) {
      if (!draw.date || !draw.numbers || draw.numbers.length !== 6) {
        return new NextResponse('Invalid input', { status: 400 })
      }

      if (new Set(draw.numbers).size !== draw.numbers.length) {
        return new NextResponse('Numbers must be unique', { status: 400 })
      }

      if (draw.numbers.some(n => n < 1 || n > 50)) {
        return new NextResponse('Numbers must be between 1 and 50', { status: 400 })
      }
    }

    const { db } = await connectToDatabase()
    const collection = db.collection<LotteryDraw>('lotteryDraws')

    // Delete existing draws for this user
    await collection.deleteMany({ userEmail })

    // Insert new draws
    if (draws.length > 0) {
      const drawsToInsert = draws.map(draw => ({
        userEmail,
        date: draw.date,
        numbers: draw.numbers,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      await collection.insertMany(drawsToInsert)
    }

    return NextResponse.json({ message: 'Draws updated successfully' })
  } catch (error) {
    console.error('Error updating lottery draws:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PATCH /api/lottery/draws
export async function PATCH(req: NextRequest) {
  try {
    const userEmail = await getUserEmail()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Missing draw ID', { status: 400 })
    }

    const body = (await req.json()) as LotteryDrawInput
    
    // Validate input
    if (!body.date || !body.numbers || body.numbers.length !== 6) {
      return new NextResponse('Invalid input', { status: 400 })
    }

    if (new Set(body.numbers).size !== body.numbers.length) {
      return new NextResponse('Numbers must be unique', { status: 400 })
    }

    if (body.numbers.some(n => n < 1 || n > 50)) {
      return new NextResponse('Numbers must be between 1 and 50', { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if draw exists and belongs to user
    const existingDraw = await db
      .collection<LotteryDraw>('lotteryDraws')
      .findOne({ _id: new ObjectId(id), userEmail })

    if (!existingDraw) {
      return new NextResponse('Draw not found', { status: 404 })
    }

    // Check for duplicate date (excluding current draw)
    const duplicateDate = await db
      .collection<LotteryDraw>('lotteryDraws')
      .findOne({
        _id: { $ne: new ObjectId(id) },
        userEmail,
        date: body.date
      })

    if (duplicateDate) {
      return new NextResponse('Another draw already exists for this date', { status: 409 })
    }

    const result = await db
      .collection<LotteryDraw>('lotteryDraws')
      .updateOne(
        { _id: new ObjectId(id), userEmail },
        {
          $set: {
            date: body.date,
            numbers: body.numbers,
            updatedAt: new Date()
          }
        }
      )

    if (result.modifiedCount === 0) {
      return new NextResponse('Failed to update draw', { status: 400 })
    }

    const updatedDraw = await db
      .collection<LotteryDraw>('lotteryDraws')
      .findOne({ _id: new ObjectId(id) })

    return NextResponse.json(updatedDraw)
  } catch (error) {
    console.error('Error updating lottery draw:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
