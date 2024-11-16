export interface Sequence {
  _id: string
  userId: string
  numbers: number[]
  createdAt: string
  metadata: {
    sequenceLength: number
    totalSequences: number
  }
}

export interface PatternStats {
  consecutive: number
  evenOdd: number
  highLow: number
}

export interface DashboardStats {
  totalSequences: number
  uniqueNumbers: number
  lastGenerated: string | null
  recentActivity: {
    today: number
    week: number
    month: number
  }
  patterns: PatternStats
}

export interface PreferencesState {
  defaultSequenceLength: number
  defaultSequenceCount: number
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export interface SequenceAnalysis {
  frequencies: Array<{ number: number; count: number }>
  pattern: {
    consecutive: number
    evenOdd: number
    highLow: number
    sum: number
    average: number
  }
  winProbability: Array<{ factor: string; value: number }>
  patternStrength: Array<{ pattern: string; value: number }>
  historicalTrends: Array<{ trend: string; value: number }>
  performanceMetrics: Array<{ metric: string; value: number }>
  recommendations: Array<{ text: string; importance: number }>
  matchingDraws: Array<{
    date: string
    numbers: number[]
    similarity: number
  }>
}

export type Theme = 'light' | 'dark'
