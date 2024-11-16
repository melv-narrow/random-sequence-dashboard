import { connectToDatabase } from './mongodb'

export async function initializeDatabase() {
  const { db } = await connectToDatabase()

  // Create collections if they don't exist
  const collections = await db.listCollections().toArray()
  const collectionNames = collections.map(col => col.name)

  // Create users collection if it doesn't exist
  if (!collectionNames.includes('users')) {
    await db.createCollection('users')
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
  }

  // Create sequences collection if it doesn't exist
  if (!collectionNames.includes('sequences')) {
    await db.createCollection('sequences')
    await db.collection('sequences').createIndex({ userId: 1 })
  }

  // Create lotteryDraws collection if it doesn't exist
  if (!collectionNames.includes('lotteryDraws')) {
    await db.createCollection('lotteryDraws')
    await db.collection('lotteryDraws').createIndexes([
      { key: { userEmail: 1 }, name: 'userEmail_1' },
      { key: { userEmail: 1, date: 1 }, name: 'userEmail_date_1', unique: true }
    ])
  }
}
