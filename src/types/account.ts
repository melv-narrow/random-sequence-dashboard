export interface ProfileUpdateData {
  name?: string
  username?: string
  email?: string
}

export interface PasswordUpdateData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface EmailUpdateData {
  newEmail: string
  password: string
}

export interface AccountDeletionData {
  password: string
  confirmation: string
}
