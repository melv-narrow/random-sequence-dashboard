import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable')
}

const resend = new Resend(process.env.RESEND_API_KEY)

// The email address associated with your Resend account
const DEVELOPMENT_EMAIL = 'melvinmpolokeng@gmail.com'

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const appName = 'Random Sequence Dashboard'
  const isDevelopment = process.env.NODE_ENV === 'development'

  try {
    // In development, always send to the development email
    const toEmail = isDevelopment ? DEVELOPMENT_EMAIL : email

    if (isDevelopment && email !== DEVELOPMENT_EMAIL) {
      console.log(`Development mode: Redirecting email from ${email} to ${DEVELOPMENT_EMAIL}`)
    }

    const result = await resend.emails.send({
      from: 'Random Sequence <onboarding@resend.dev>',
      to: toEmail,
      subject: `Reset your ${appName} password`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${isDevelopment && email !== DEVELOPMENT_EMAIL ? `
            <div style="background-color: #FEF3C7; color: #92400E; padding: 12px; margin-bottom: 24px; border-radius: 6px;">
              <strong>Development Mode Notice:</strong><br>
              Original recipient: ${email}<br>
              This email was redirected to ${DEVELOPMENT_EMAIL} for development purposes.
            </div>
          ` : ''}
          <h2 style="color: #4F46E5; margin-bottom: 24px;">Reset Your Password</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
            We received a request to reset your password for ${appName}. If you didn't make this request, you can safely ignore this email.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
            To reset your password, click the button below:
          </p>
          
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: 500;">
            Reset Password
          </a>
          
          <p style="color: #6B7280; font-size: 14px; line-height: 20px; margin-top: 32px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="color: #6B7280; font-size: 14px; line-height: 20px; margin-top: 24px;">
            If the button doesn't work, you can also copy and paste this link into your browser:
            <br>
            <span style="color: #4F46E5;">${resetUrl}</span>
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
          
          <p style="color: #6B7280; font-size: 12px; line-height: 16px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `
    })

    if (result.error) {
      throw result.error
    }

    return { success: true, result }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error }
  }
}

export async function sendEmailChangeVerification(email: string, verificationUrl: string) {
  const appName = 'Random Sequence Dashboard'
  const isDevelopment = process.env.NODE_ENV === 'development'

  try {
    // In development, always send to the development email
    const toEmail = isDevelopment ? DEVELOPMENT_EMAIL : email

    if (isDevelopment && email !== DEVELOPMENT_EMAIL) {
      console.log(`Development mode: Redirecting email from ${email} to ${DEVELOPMENT_EMAIL}`)
    }

    const result = await resend.emails.send({
      from: 'Random Sequence <onboarding@resend.dev>',
      to: toEmail,
      subject: `Verify your new email address for ${appName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${isDevelopment && email !== DEVELOPMENT_EMAIL ? `
            <div style="background-color: #FEF3C7; color: #92400E; padding: 12px; margin-bottom: 24px; border-radius: 6px;">
              <strong>Development Mode Notice:</strong><br>
              Original recipient: ${email}<br>
              This email was redirected to ${DEVELOPMENT_EMAIL} for development purposes.
            </div>
          ` : ''}
          <h2 style="color: #4F46E5; margin-bottom: 24px;">Verify Your New Email</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
            We received a request to change your email address for ${appName}. To complete this process, please verify your new email address.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
            Click the button below to verify this email address:
          </p>
          
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: 500;">
            Verify Email
          </a>
          
          <p style="color: #6B7280; font-size: 14px; line-height: 20px; margin-top: 32px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="color: #6B7280; font-size: 14px; line-height: 20px; margin-top: 24px;">
            If the button doesn't work, you can also copy and paste this link into your browser:
            <br>
            <span style="color: #4F46E5;">${verificationUrl}</span>
          </p>
          
          <p style="color: #6B7280; font-size: 14px; line-height: 20px; margin-top: 24px;">
            If you didn't request this change, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
          
          <p style="color: #6B7280; font-size: 12px; line-height: 16px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `
    })

    if (result.error) {
      throw result.error
    }

    return { success: true, result }
  } catch (error) {
    console.error('Failed to send email verification:', error)
    return { success: false, error }
  }
}
