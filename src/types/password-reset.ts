export interface PasswordReset {
  email: string
  token: string // hashed token
  createdAt: Date
  expiresAt: Date
  used: boolean
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetSubmission {
  token: string
  password: string
  confirmPassword: string
}
