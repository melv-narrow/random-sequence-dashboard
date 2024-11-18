import { Schema, model, models, Document, Model } from 'mongoose'

export interface ISession extends Document {
  userId: string
  sessionToken: string
  deviceInfo: {
    userAgent: string
    ip: string
    lastActive: Date
    deviceName?: string
  }
  isValid: boolean
  createdAt: Date
  expiresAt: Date
}

const SessionSchema = new Schema<ISession>({
  userId: { type: String, required: true },
  sessionToken: { type: String, required: true, unique: true },
  deviceInfo: {
    userAgent: { type: String, required: true },
    ip: { type: String, required: true },
    lastActive: { type: Date, default: Date.now },
    deviceName: { type: String }
  },
  isValid: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
})

// Index for faster queries and automatic cleanup
SessionSchema.index({ userId: 1, isValid: 1 })
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Session = models.Session || model<ISession>('Session', SessionSchema)
