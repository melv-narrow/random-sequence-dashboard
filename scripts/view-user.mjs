import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function viewUser(username) {
  const client = await MongoClient.connect(process.env.MONGODB_URI)
  const db = client.db()

  try {
    const user = await db.collection('users').findOne({ username })
    if (user) {
      // Remove sensitive information before logging
      const { password, ...safeUser } = user
      console.log('Found user:', safeUser)
    } else {
      console.log('No user found with username:', username)
    }
  } catch (error) {
    console.error('Error viewing user:', error)
  } finally {
    await client.close()
  }
}

// Get username from command line argument
const username = process.argv[2]
if (!username) {
  console.error('Please provide a username as an argument')
  process.exit(1)
}

viewUser(username)
