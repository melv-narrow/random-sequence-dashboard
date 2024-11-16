import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connectToDatabase } from '@/lib/mongodb'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      try {
        const { db } = await connectToDatabase()
        
        // Check if user exists
        const existingUser = await db.collection('users').findOne({
          email: user.email
        })

        if (!existingUser) {
          // Create new user
          await db.collection('users').insertOne({
            email: user.email,
            name: user.name,
            createdAt: new Date(),
            lastLogin: new Date(),
            preferences: {
              defaultSequenceLength: 6
            }
          })
        } else {
          // Update last login
          await db.collection('users').updateOne(
            { email: user.email },
            { $set: { lastLogin: new Date() } }
          )
        }
        
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    }
  }
}
