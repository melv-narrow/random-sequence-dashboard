'use client'

interface AuthToggleProps {
  mode: 'signin' | 'signup'
  onToggle: () => void
}

export function AuthToggle({ mode, onToggle }: AuthToggleProps) {
  return (
    <div className="mt-4 text-center text-sm">
      <span className="text-gray-500 dark:text-gray-400">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        {mode === 'signin' ? 'Sign up' : 'Sign in'}
      </button>
    </div>
  )
}
