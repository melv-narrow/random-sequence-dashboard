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
  frequencies: Array<{ 
    number: number; 
    count: number;
    status?: 'hot' | 'warm' | 'cold';
    lastDrawn?: string;
  }>
  pattern: {
    consecutive: number
    evenOdd: {
      even: number
      odd: number
    }
    highLow: {
      high: number
      low: number
    }
    sum: number
    average: number
  }
  winProbability: {
    overall: number
    factors: Array<{
      name: string
      impact: number
      description: string
    }>
  }
  patternStrength: Array<{
    type: string
    score: number
    description: string
  }>
  historicalTrends: Array<{
    period: string
    frequency: number
    performance: 'increasing' | 'decreasing' | 'stable'
  }>
  performanceMetrics: Array<{
    metric: string
    value: number
    trend: 'up' | 'down' | 'neutral'
    description?: string
  }>
  recommendations: string[]
  matchingDraws: Array<{
    date: string
    numbers: number[]
    matches: number
  }>
}

export type Theme = 'light' | 'dark'

export interface GenerateSequenceParams {
  numberOfSequences: number
  numbersPerSequence: number
}
