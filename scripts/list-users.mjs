import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function listUsers() {
  const client = await MongoClient.connect(process.env.MONGODB_URI)
  const db = client.db()

  try {
    console.log('Connected to database:', db.databaseName)
    console.log('Collections:', await db.listCollections().toArray())
    
    const users = await db.collection('users').find({}).toArray()
    console.log('\nTotal users:', users.length)
    users.forEach(user => {
      // Remove sensitive information before logging
      const { password, ...safeUser } = user
      console.log('\nUser:', safeUser)
    })
  } catch (error) {
    console.error('Error listing users:', error)
  } finally {
    await client.close()
  }
}

listUsers()
