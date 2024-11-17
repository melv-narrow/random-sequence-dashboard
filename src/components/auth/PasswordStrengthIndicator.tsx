'use client'

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getStrength = (password: string): { score: number; feedback: string } => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    // Add points for each criteria met
    if (checks.length) score += 1
    if (checks.uppercase) score += 1
    if (checks.lowercase) score += 1
    if (checks.numbers) score += 1
    if (checks.special) score += 1

    // Get feedback based on score
    const feedback = score === 0 ? 'Very Weak' :
      score === 1 ? 'Weak' :
      score === 2 ? 'Fair' :
      score === 3 ? 'Good' :
      score === 4 ? 'Strong' :
      'Very Strong'

    return { score, feedback }
  }

  const { score, feedback } = getStrength(password)
  const maxScore = 5

  // Calculate width percentage for the progress bar
  const strengthPercentage = (score / maxScore) * 100

  // Determine color based on score
  const getColor = () => {
    if (score <= 1) return 'bg-red-500'
    if (score === 2) return 'bg-orange-500'
    if (score === 3) return 'bg-yellow-500'
    if (score === 4) return 'bg-green-500'
    return 'bg-emerald-500'
  }

  // Only show if password is not empty
  if (!password) return null

  return (
    <div className="mt-1 space-y-1">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>
      <p className={`text-xs ${getColor().replace('bg-', 'text-')}`}>
        Password Strength: {feedback}
      </p>
      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
        <li className={password.length >= 8 ? 'text-green-500' : ''}>
          • At least 8 characters
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>
          • At least one uppercase letter
        </li>
        <li className={/[a-z]/.test(password) ? 'text-green-500' : ''}>
          • At least one lowercase letter
        </li>
        <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>
          • At least one number
        </li>
        <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : ''}>
          • At least one special character
        </li>
      </ul>
    </div>
  )
}
