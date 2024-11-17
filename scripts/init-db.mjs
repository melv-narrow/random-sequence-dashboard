import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function initializeDatabase() {
  const client = await MongoClient.connect(process.env.MONGODB_URI)
  const db = client.db()

  try {
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(col => col.name)

    // Create users collection if it doesn't exist
    if (!collectionNames.includes('users')) {
      await db.createCollection('users')
      console.log('Created users collection')
    }

    // Create or update indexes for user authentication
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { username: 1 }, unique: true, sparse: true } // sparse index for optional username
    ])
    console.log('Created/updated user authentication indexes')

    // Create sequences collection if it doesn't exist
    if (!collectionNames.includes('sequences')) {
      await db.createCollection('sequences')
      await db.collection('sequences').createIndex({ userId: 1 })
      console.log('Created sequences collection and index')
    }

    // Create lotteryDraws collection if it doesn't exist
    if (!collectionNames.includes('lotteryDraws')) {
      await db.createCollection('lotteryDraws')
      await db.collection('lotteryDraws').createIndexes([
        { key: { userEmail: 1 }, name: 'userEmail_1' },
        { key: { userEmail: 1, date: 1 }, name: 'userEmail_date_1', unique: true }
      ])
      console.log('Created lotteryDraws collection and indexes')
    }

    console.log('Database initialization completed successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

initializeDatabase()
