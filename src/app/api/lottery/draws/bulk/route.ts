import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { LotteryDraw, LotteryDrawInput } from '@/lib/models/lottery-draw'

async function getUserEmail() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  
  if (!email) {
    throw new Error('Unauthorized')
  }
  
  return email
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

    // Check for duplicate dates within the import
    const dates = draws.map(d => d.date)
    const duplicateDatesInImport = dates.filter((date, index) => dates.indexOf(date) !== index)
    if (duplicateDatesInImport.length > 0) {
      return new NextResponse('Duplicate dates found in import file', { status: 400 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection<LotteryDraw>('lotteryDraws')

    // Check for existing dates
    const existingDraws = await collection
      .find({ userEmail, date: { $in: dates } })
      .toArray()

    // If there are duplicates, we'll still import the non-duplicates
    const existingDates = new Set(existingDraws.map(d => d.date))
    const newDraws = draws.filter(d => !existingDates.has(d.date))

    // Insert new draws if any
    if (newDraws.length > 0) {
      const drawsToInsert = newDraws.map(draw => ({
        userEmail,
        date: draw.date,
        numbers: draw.numbers,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      await collection.insertMany(drawsToInsert)
    }

    // If there were duplicates, return them along with success info
    if (existingDraws.length > 0) {
      return NextResponse.json({
        status: 'partial',
        duplicates: existingDraws.map(d => ({
          date: d.date,
          numbers: d.numbers
        })),
        newDrawsCount: newDraws.length,
        message: 'Some draws were duplicates and were skipped'
      }, { status: 409 })
    }

    // All draws were imported successfully
    return NextResponse.json({
      status: 'success',
      count: newDraws.length,
      message: 'All draws imported successfully'
    })
  } catch (error) {
    console.error('Error importing lottery draws:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
