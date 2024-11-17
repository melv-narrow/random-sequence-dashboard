import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import type { Adapter } from 'next-auth/adapters'
import clientPromise from '@/lib/mongodb'
import { verifyPassword } from '@/lib/password'

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            return null
          }

          const client = await clientPromise
          const db = client.db()
          
          // Find user by username or email
          const user = await db.collection('User').findOne({ 
            $or: [
              { username: credentials.identifier },
              { email: credentials.identifier.toLowerCase() }
            ]
          })

          if (!user || !user.password) {
            return null
          }

          const isValid = await verifyPassword(credentials.password, user.password)

          if (!isValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            username: user.username
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) return false

      try {
        const client = await clientPromise
        const db = client.db()

        // For credentials sign in, just verify the user exists
        if (account?.provider === 'credentials') {
          return true
        }

        // Handle OAuth sign in
        const existingUser = await db.collection('User').findOne({
          email: user.email
        })

        if (!existingUser) {
          // Create new user
          await db.collection('User').insertOne({
            email: user.email,
            name: user.name,
            username: user.email.split('@')[0],
            authType: account?.provider || 'google',
            createdAt: new Date(),
            lastLogin: new Date(),
            preferences: {
              defaultSequenceLength: 6
            }
          })
        } else {
          // Update last login and potentially link accounts
          const updateData: any = { lastLogin: new Date() }
          if (existingUser.authType === 'credentials' && account?.provider === 'google') {
            updateData.authType = 'both'
          }
          await db.collection('User').updateOne(
            { email: user.email },
            { $set: updateData }
          )
        }
        
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.username = token.username as string
      }
      return session
    }
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
