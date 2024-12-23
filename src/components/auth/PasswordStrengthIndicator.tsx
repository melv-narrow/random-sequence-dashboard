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
    if (score <= 1) return 'bg-red-500 dark:bg-red-400'
    if (score === 2) return 'bg-orange-500 dark:bg-orange-400'
    if (score === 3) return 'bg-yellow-500 dark:bg-yellow-400'
    if (score === 4) return 'bg-green-500 dark:bg-green-400'
    return 'bg-emerald-500 dark:bg-emerald-400'
  }

  const getTextColor = () => {
    if (score <= 1) return 'text-red-500 dark:text-red-400'
    if (score === 2) return 'text-orange-500 dark:text-orange-400'
    if (score === 3) return 'text-yellow-500 dark:text-yellow-400'
    if (score === 4) return 'text-green-500 dark:text-green-400'
    return 'text-emerald-500 dark:text-emerald-400'
  }

  // Only show if password is not empty
  if (!password) return null

  return (
    <div className="mt-2 space-y-2 animate-fade-in">
      <div className="relative h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out transform origin-left ${getColor()}`}
          style={{ width: `${strengthPercentage}%`, transform: `scaleX(${password ? 1 : 0})` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-medium transition-colors duration-200 ${getTextColor()}`}>
          {feedback}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {score}/{maxScore} criteria met
        </p>
      </div>
      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 mt-2">
        <li className={`flex items-center space-x-2 transition-colors duration-200 ${password.length >= 8 ? getTextColor() : ''}`}>
          <svg className={`w-4 h-4 transition-transform duration-200 ${password.length >= 8 ? 'scale-100' : 'scale-0'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>At least 8 characters</span>
        </li>
        <li className={`flex items-center space-x-2 transition-colors duration-200 ${/[A-Z]/.test(password) ? getTextColor() : ''}`}>
          <svg className={`w-4 h-4 transition-transform duration-200 ${/[A-Z]/.test(password) ? 'scale-100' : 'scale-0'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>One uppercase letter</span>
        </li>
        <li className={`flex items-center space-x-2 transition-colors duration-200 ${/[a-z]/.test(password) ? getTextColor() : ''}`}>
          <svg className={`w-4 h-4 transition-transform duration-200 ${/[a-z]/.test(password) ? 'scale-100' : 'scale-0'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>One lowercase letter</span>
        </li>
        <li className={`flex items-center space-x-2 transition-colors duration-200 ${/[0-9]/.test(password) ? getTextColor() : ''}`}>
          <svg className={`w-4 h-4 transition-transform duration-200 ${/[0-9]/.test(password) ? 'scale-100' : 'scale-0'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>One number</span>
        </li>
        <li className={`flex items-center space-x-2 transition-colors duration-200 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? getTextColor() : ''}`}>
          <svg className={`w-4 h-4 transition-transform duration-200 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'scale-100' : 'scale-0'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>One special character</span>
        </li>
      </ul>
    </div>
  )
}
