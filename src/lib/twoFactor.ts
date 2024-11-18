import { authenticator } from 'otplib'
import QRCode from 'qrcode'

// Configure authenticator
authenticator.options = {
  window: 1, // Allow 30 seconds before/after for time drift
  step: 30   // 30-second period
}

export interface TOTPConfig {
  secret: string
  uri: string
  qrCode: string
}

/**
 * Generate a new TOTP configuration for a user
 */
export async function generateTOTPConfig(email: string): Promise<TOTPConfig> {
  // Generate a random secret
  const secret = authenticator.generateSecret()
  
  // Create the TOTP URI (used by authenticator apps)
  const uri = authenticator.keyuri(
    email,
    'Random Sequence Dashboard',
    secret
  )
  
  // Generate QR code
  const qrCode = await QRCode.toDataURL(uri)
  
  return {
    secret,
    uri,
    qrCode
  }
}

/**
 * Verify a TOTP token
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch {
    return false
  }
}

/**
 * Generate backup codes
 * Returns an array of 16-character codes
 */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    // Generate a random 16-character code
    const code = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
    
    // Format as XXXX-XXXX-XXXX-XXXX
    codes.push(code.match(/.{4}/g)!.join('-'))
  }
  return codes
}

/**
 * Hash a backup code for storage
 */
export async function hashBackupCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code.replace(/-/g, ''))
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Verify a backup code against a list of hashed codes
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<boolean> {
  const hashedInput = await hashBackupCode(code)
  return hashedCodes.includes(hashedInput)
}
