import { connectToDatabase } from './mongodb'

export async function initializeDatabase() {
  const { db } = await connectToDatabase()

  // Create collections if they don't exist
  const collections = await db.listCollections().toArray()
  const collectionNames = collections.map(col => col.name)

  // Create users collection if it doesn't exist
  if (!collectionNames.includes('users')) {
    await db.createCollection('users')
    // Create indexes for user authentication
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { username: 1 }, unique: true, sparse: true } // sparse index for optional username
    ])
  } else {
    // Update existing users collection with new indexes
    const existingIndexes = await db.collection('users').listIndexes().toArray()
    const hasUsernameIndex = existingIndexes.some(index => index.name === 'username_1')
    
    if (!hasUsernameIndex) {
      await db.collection('users').createIndex(
        { username: 1 },
        { unique: true, sparse: true }
      )
    }
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

  console.log('Database initialization completed')
}
