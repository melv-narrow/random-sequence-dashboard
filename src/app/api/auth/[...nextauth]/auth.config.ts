import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import type { Adapter } from 'next-auth/adapters'
import clientPromise from '@/lib/mongodb'
import { verifyPassword } from '@/lib/password'
import { verifyTOTP, verifyBackupCode } from '@/lib/twoFactor'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { ObjectId } from 'mongodb'

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    CredentialsProvider({
      id: '2fa',
      name: '2FA',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Verification Code', type: 'text' },
        isBackupCode: { label: 'Is Backup Code', type: 'boolean' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          throw new Error('Missing required fields')
        }

        const client = await clientPromise
        const db = client.db()
        const user = await db.collection('User').findOne({ email: credentials.email })

        if (!user?.twoFactorEnabled) {
          throw new Error('2FA is not enabled')
        }

        const isValid = credentials.isBackupCode === 'true'
          ? await verifyBackupCode(credentials.code, user.backupCodes)
          : verifyTOTP(credentials.code, user.twoFactorSecret)

        if (!isValid) {
          throw new Error('Invalid verification code')
        }

        if (credentials.isBackupCode === 'true') {
          // Remove used backup code
          await db.collection('User').updateOne(
            { email: credentials.email },
            {
              $pull: {
                backupCodes: await hashBackupCode(credentials.code)
              }
            }
          )
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username
        }
      }
    }),
    CredentialsProvider({
      id: 'credentials',
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

          // If 2FA is enabled, return a special response
          if (user.twoFactorEnabled) {
            return {
              id: user._id.toString(),
              email: user.email,
              username: user.username,
              requires2FA: true,
              twoFactorEnabled: true
            }
          }

          // Normal login without 2FA
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            requires2FA: false,
            twoFactorEnabled: false
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.type === 'oauth') {
        try {
          const client = await clientPromise
          const db = client.db()
          
          const existingUser = await db.collection('User').findOne({
            email: user.email
          })

          if (!existingUser) {
            const result = await db.collection('User').insertOne({
              email: user.email,
              name: user.name,
              username: user.email?.split('@')[0],
              image: user.image,
              twoFactorEnabled: false,
              createdAt: new Date()
            })
            user.id = result.insertedId.toString()
          } else {
            user.id = existingUser._id.toString()
          }
        } catch (error) {
          console.error('OAuth user creation error:', error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        return { ...token, ...session.user }
      }
      
      if (user) {
        // When user first signs in, copy all user properties to token
        token = {
          ...token,
          id: user.id,
          sub: user.id,
          email: user.email,
          username: user.username,
          requires2FA: user.requires2FA,
          jti: token.jti || crypto.randomUUID()
        }
      }

      return token
    },

    async session({ session, token }) {
      if (!session?.user) {
        return null
      }

      try {
        const client = await clientPromise
        const db = client.db()

        // Verify MongoDB connection
        try {
          await db.command({ ping: 1 })
        } catch (dbError) {
          console.error('MongoDB connection error:', dbError)
          throw dbError
        }

        const headersList = headers()
        const userAgent = headersList.get('user-agent') || 'unknown'
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
                  headersList.get('x-real-ip') || 
                  'unknown'

        if (!token.jti) {
          console.error('No JTI found in token:', token)
          token.jti = crypto.randomUUID()
        }

        const existingSession = await db.collection('sessions').findOne({
          sessionToken: token.jti
        })

        const now = new Date()
        if (!existingSession) {
          await db.collection('sessions').insertOne({
            userId: new ObjectId(token.sub || token.id),
            sessionToken: token.jti,
            expires: new Date(token.exp ? token.exp * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000),
            deviceInfo: {
              userAgent,
              ip,
              lastActive: now
            },
            isValid: true,
            createdAt: now,
            updatedAt: now
          })
        } else {
          await db.collection('sessions').updateOne(
            { sessionToken: token.jti },
            { 
              $set: { 
                'deviceInfo.lastActive': now,
                isValid: true,
                updatedAt: now
              }
            }
          )
        }

        // Ensure user ID is in the session
        session.user = {
          ...session.user,
          id: token.sub || token.id,
          email: token.email,
          username: token.username
        }

        return session
      } catch (error) {
        console.error('Session tracking error:', error)
        if (error instanceof Error) {
          console.error('Full error stack:', error.stack)
        }
        return session
      }
    }
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    verifyRequest: '/',
  },
  session: {
    strategy: 'jwt'
  }
}
