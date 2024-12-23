'use client'

interface AuthToggleProps {
  mode: 'signin' | 'signup'
  onToggle: () => void
}

export function AuthToggle({ mode, onToggle }: AuthToggleProps) {
  return (
    <div className="mt-6 text-center text-sm animate-fade-in-delay">
      <span className="text-gray-500 dark:text-gray-400">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="group relative font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
      >
        <span className="relative">
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
          <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-current transition-all duration-200 group-hover:w-full" />
        </span>
      </button>
    </div>
  )
}
