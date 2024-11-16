export const SEQUENCE_LIMITS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 50,
  MIN_COUNT: 1,
  MAX_COUNT: 10,
  MAX_NUMBER: 50
} as const

export const STORAGE_KEYS = {
  PREFERENCES: 'preferences-storage',
  SEQUENCES: 'sequences-storage'
} as const

export const TOAST_DURATION = {
  DEFAULT: 3000,
  ERROR: 5000,
  SUCCESS: 2000
} as const

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500
} as const

export const API_ROUTES = {
  AUTH: {
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    SESSION: '/api/auth/session'
  },
  DASHBOARD: '/dashboard'
} as const
