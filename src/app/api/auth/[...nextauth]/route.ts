import NextAuth from 'next-auth'
import { authOptions } from './auth.config'

const handler = NextAuth(authOptions)

// Export all HTTP methods that NextAuth can handle
export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
export const HEAD = handler
export const OPTIONS = handler