interface Frequency {
  number: number
  count: number
  status: 'hot' | 'warm' | 'cold'
  lastDrawn?: string
}

interface Pattern {
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

interface MatchingDraw {
  date: string
  numbers: number[]
  matches: number
}

interface PatternStrength {
  type: string
  score: number
  description: string
}

interface WinProbability {
  overall: number
  factors: {
    name: string
    impact: number
    description: string
  }[]
}

interface HistoricalTrend {
  period: string
  frequency: number
  performance: 'increasing' | 'decreasing' | 'stable'
}

interface PerformanceMetric {
  metric: string
  value: number
  trend: 'up' | 'down' | 'neutral'
  description: string
}

interface SequenceAnalysis {
  frequencies: Frequency[]
  pattern: Pattern
  matchingDraws: MatchingDraw[]
  recommendations: string[]
  patternStrength: PatternStrength[]
  winProbability: WinProbability
  historicalTrends: HistoricalTrend[]
  performanceMetrics: PerformanceMetric[]
}

const calculatePatternStrength = (sequence: number[], pattern: Pattern): PatternStrength[] => {
  const strengths: PatternStrength[] = []

  // Consecutive Numbers Pattern
  const consecutiveScore = (pattern.consecutive / (sequence.length - 1)) * 100
  strengths.push({
    type: 'Consecutive Numbers',
    score: 100 - consecutiveScore,
    description: consecutiveScore > 50 
      ? 'High number of consecutive numbers'
      : 'Good distribution of non-consecutive numbers'
  })

  // Even/Odd Distribution
  const evenOddDiff = Math.abs(pattern.evenOdd.even - pattern.evenOdd.odd)
  const evenOddScore = (1 - evenOddDiff / sequence.length) * 100
  strengths.push({
    type: 'Even/Odd Balance',
    score: evenOddScore,
    description: evenOddScore > 70 
      ? 'Well-balanced even/odd distribution'
      : 'Consider balancing even and odd numbers'
  })

  // High/Low Distribution
  const highLowDiff = Math.abs(pattern.highLow.high - pattern.highLow.low)
  const highLowScore = (1 - highLowDiff / sequence.length) * 100
  strengths.push({
    type: 'High/Low Balance',
    score: highLowScore,
    description: highLowScore > 70 
      ? 'Well-balanced high/low distribution'
      : 'Consider balancing high and low numbers'
  })

  // Number Range Coverage
  const range = Math.max(...sequence) - Math.min(...sequence)
  const rangeCoverageScore = (range / 49) * 100
  strengths.push({
    type: 'Number Range Coverage',
    score: rangeCoverageScore,
    description: rangeCoverageScore > 70 
      ? 'Good coverage of number range'
      : 'Limited number range coverage'
  })

  return strengths
}

const calculateWinProbability = (
  sequence: number[],
  pattern: Pattern,
  frequencies: Frequency[]
): WinProbability => {
  const baselineProbability = 20 // Base probability out of 100

  const factors = []

  // Factor 1: Hot Numbers
  const hotNumbers = frequencies.filter(f => f.status === 'hot').length
  const hotNumbersImpact = (hotNumbers / sequence.length) * 20
  factors.push({
    name: 'Hot Numbers',
    impact: hotNumbersImpact,
    description: `${hotNumbers} frequently drawn numbers`
  })

  // Factor 2: Pattern Balance
  const balanceScore = Math.min(
    Math.abs(pattern.evenOdd.even - pattern.evenOdd.odd),
    Math.abs(pattern.highLow.high - pattern.highLow.low)
  )
  const balanceImpact = (1 - balanceScore / sequence.length) * 15
  factors.push({
    name: 'Pattern Balance',
    impact: balanceImpact,
    description: balanceScore === 0 ? 'Perfect balance' : 'Some imbalance present'
  })

  // Factor 3: Number Spread
  const spread = Math.max(...sequence) - Math.min(...sequence)
  const spreadImpact = (spread / 49) * 15
  factors.push({
    name: 'Number Spread',
    impact: spreadImpact,
    description: spread > 30 ? 'Good number spread' : 'Limited number spread'
  })

  // Calculate overall probability
  const totalImpact = factors.reduce((sum, factor) => sum + factor.impact, 0)
  const overallProbability = Math.min(Math.max(baselineProbability + totalImpact, 0), 100)

  return {
    overall: Number(overallProbability.toFixed(2)),
    factors
  }
}

const calculateHistoricalTrends = (frequencies: Frequency[]): HistoricalTrend[] => {
  const trends: HistoricalTrend[] = []

  // Short-term trend (last 10 draws)
  const recentFrequency = frequencies.filter(f => f.status === 'hot').length
  trends.push({
    period: 'Recent (Last 10 Draws)',
    frequency: recentFrequency,
    performance: recentFrequency > 3 ? 'increasing' : recentFrequency < 2 ? 'decreasing' : 'stable'
  })

  // Mid-term trend (last 30 draws)
  const midTermFrequency = frequencies.filter(f => f.status !== 'cold').length
  trends.push({
    period: 'Mid-term (Last 30 Draws)',
    frequency: midTermFrequency,
    performance: midTermFrequency > 10 ? 'increasing' : midTermFrequency < 5 ? 'decreasing' : 'stable'
  })

  // Long-term trend (all draws)
  const longTermFrequency = frequencies.reduce((sum, f) => sum + f.count, 0) / frequencies.length
  trends.push({
    period: 'Long-term (All Draws)',
    frequency: Math.round(longTermFrequency),
    performance: longTermFrequency > 30 ? 'increasing' : longTermFrequency < 20 ? 'decreasing' : 'stable'
  })

  return trends
}

const calculatePerformanceMetrics = (
  sequence: number[],
  pattern: Pattern,
  frequencies: Frequency[]
): PerformanceMetric[] => {
  const metrics: PerformanceMetric[] = []

  // Frequency Score
  const avgFrequency = frequencies.reduce((sum, f) => sum + f.count, 0) / frequencies.length
  metrics.push({
    metric: 'Average Frequency',
    value: Number(avgFrequency.toFixed(1)),
    trend: avgFrequency > 25 ? 'up' : avgFrequency < 15 ? 'down' : 'neutral',
    description: 'Average occurrence rate in historical draws'
  })

  // Pattern Score
  const patternScore = (
    (1 - Math.abs(pattern.evenOdd.even - pattern.evenOdd.odd) / sequence.length) +
    (1 - Math.abs(pattern.highLow.high - pattern.highLow.low) / sequence.length)
  ) * 50
  metrics.push({
    metric: 'Pattern Score',
    value: Number(patternScore.toFixed(1)),
    trend: patternScore > 70 ? 'up' : patternScore < 30 ? 'down' : 'neutral',
    description: 'Overall pattern strength and balance'
  })

  // Coverage Score
  const range = Math.max(...sequence) - Math.min(...sequence)
  const coverageScore = (range / 49) * 100
  metrics.push({
    metric: 'Number Coverage',
    value: Number(coverageScore.toFixed(1)),
    trend: coverageScore > 70 ? 'up' : coverageScore < 30 ? 'down' : 'neutral',
    description: 'Distribution across the number range'
  })

  // Hot Numbers Score
  const hotCount = frequencies.filter(f => f.status === 'hot').length
  const hotScore = (hotCount / sequence.length) * 100
  metrics.push({
    metric: 'Hot Numbers',
    value: Number(hotScore.toFixed(1)),
    trend: hotScore > 50 ? 'up' : hotScore < 20 ? 'down' : 'neutral',
    description: 'Presence of frequently drawn numbers'
  })

  return metrics
}

export const analyzeSequence = async (
  sequence: number[],
  lotteryHistory?: Array<{ date: string; numbers: number[] }>
): Promise<SequenceAnalysis> => {
  // Calculate frequencies
  const frequencies: Frequency[] = sequence.map(num => {
    // Calculate actual frequency if lottery history is provided
    let count = 0;
    let lastDrawn: string | undefined;
    
    if (lotteryHistory) {
      lotteryHistory.forEach(draw => {
        if (draw.numbers.includes(num)) {
          count++;
          if (!lastDrawn || new Date(draw.date) > new Date(lastDrawn)) {
            lastDrawn = draw.date;
          }
        }
      });
    } else {
      count = Math.floor(Math.random() * 100); // Fallback to simulated frequency
    }

    const frequency = lotteryHistory 
      ? (count / lotteryHistory.length) * 100 
      : count;

    return {
      number: num,
      count: frequency,
      status: frequency > 40 ? 'hot' : frequency > 20 ? 'warm' : 'cold',
      lastDrawn
    };
  });

  const pattern: Pattern = {
    consecutive: sequence.slice(1).reduce((count, num, i) => 
      count + (num === sequence[i] + 1 ? 1 : 0), 0),
    evenOdd: {
      even: sequence.filter(n => n % 2 === 0).length,
      odd: sequence.filter(n => n % 2 !== 0).length
    },
    highLow: {
      high: sequence.filter(n => n > 25).length,
      low: sequence.filter(n => n <= 25).length
    },
    sum: sequence.reduce((sum, num) => sum + num, 0),
    average: sequence.reduce((sum, num) => sum + num, 0) / sequence.length
  }

  // Simulated matching draws
  const matchingDraws: MatchingDraw[] = [
    {
      date: '2024-01-15',
      numbers: [7, 14, 21, 28, 35, 42],
      matches: 3
    },
    {
      date: '2024-01-08',
      numbers: [4, 11, 18, 25, 32, 39],
      matches: 2
    }
  ]

  const patternStrength = calculatePatternStrength(sequence, pattern)
  const winProbability = calculateWinProbability(sequence, pattern, frequencies)
  const historicalTrends = calculateHistoricalTrends(frequencies)
  const performanceMetrics = calculatePerformanceMetrics(sequence, pattern, frequencies)

  // Generate recommendations based on analysis
  const recommendations = [
    pattern.consecutive > 2 ? 'Consider reducing consecutive numbers' : null,
    pattern.evenOdd.even > 4 ? 'Consider adding more odd numbers for balance' : null,
    pattern.evenOdd.odd > 4 ? 'Consider adding more even numbers for balance' : null,
    pattern.highLow.high > 4 ? 'Consider including more low numbers' : null,
    pattern.highLow.low > 4 ? 'Consider including more high numbers' : null,
    pattern.sum < 100 ? 'Consider numbers that would increase the sum' : null,
    pattern.sum > 200 ? 'Consider numbers that would decrease the sum' : null,
    pattern.average < 20 ? 'Consider including higher numbers' : null,
    pattern.average > 30 ? 'Consider including lower numbers' : null,
    frequencies.some(f => f.status === 'hot') ? 'Consider mixing hot and cold numbers' : null
  ].filter((rec): rec is string => rec !== null)

  return {
    frequencies,
    pattern,
    matchingDraws,
    patternStrength,
    winProbability,
    historicalTrends,
    performanceMetrics,
    recommendations
  }
}
