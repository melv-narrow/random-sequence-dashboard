interface LotteryDraw {
  date: string
  numbers: number[]
  drawId?: string
}

interface NumberFrequency {
  number: number
  frequency: number
  percentage: number
  lastDrawn?: string
  gapsBetweenAppearances: number[]
}

interface SequenceAnalysis {
  frequencies: NumberFrequency[]
  hotNumbers: number[] // Numbers drawn more frequently than average
  coldNumbers: number[] // Numbers drawn less frequently than average
  overdue: number[] // Numbers not drawn for longer than average
  patterns: {
    consecutive: number
    evenOdd: number // Percentage of even numbers
    highLow: number // Percentage of numbers in upper half of range
  }
  gaps: {
    average: number
    longest: number
    current: Record<number, number>
  }
}

export function analyzeLotteryHistory(draws: LotteryDraw[], maxNumber: number = 50): SequenceAnalysis {
  // Initialize frequency tracking for all possible numbers
  const frequencies: Record<number, NumberFrequency> = {}
  for (let i = 1; i <= maxNumber; i++) {
    frequencies[i] = {
      number: i,
      frequency: 0,
      percentage: 0,
      gapsBetweenAppearances: []
    }
  }

  // Track last appearance and calculate gaps
  const lastAppearance: Record<number, number> = {}
  let drawIndex = 0

  // Calculate frequencies and gaps
  draws.forEach((draw, index) => {
    draw.numbers.forEach(num => {
      frequencies[num].frequency++
      
      if (lastAppearance[num] !== undefined) {
        const gap = index - lastAppearance[num]
        frequencies[num].gapsBetweenAppearances.push(gap)
      }
      
      lastAppearance[num] = index
      frequencies[num].lastDrawn = draw.date
    })
    drawIndex = index
  })

  // Calculate current gaps
  const currentGaps: Record<number, number> = {}
  for (let i = 1; i <= maxNumber; i++) {
    currentGaps[i] = lastAppearance[i] ? drawIndex - lastAppearance[i] : drawIndex + 1
  }

  // Calculate percentages and averages
  const totalDraws = draws.length
  const averageFrequency = totalDraws * 6 / maxNumber // Expected frequency if perfectly distributed

  Object.values(frequencies).forEach(f => {
    f.percentage = (f.frequency / totalDraws) * 100
  })

  // Identify hot and cold numbers
  const sortedByFrequency = Object.values(frequencies).sort((a, b) => b.frequency - a.frequency)
  const hotNumbers = sortedByFrequency
    .filter(f => f.frequency > averageFrequency)
    .map(f => f.number)
  const coldNumbers = sortedByFrequency
    .filter(f => f.frequency < averageFrequency)
    .map(f => f.number)

  // Calculate overdue numbers (numbers not drawn for longer than average)
  const averageGap = Object.values(frequencies)
    .flatMap(f => f.gapsBetweenAppearances)
    .reduce((sum, gap) => sum + gap, 0) / 
    Object.values(frequencies)
    .flatMap(f => f.gapsBetweenAppearances)
    .length

  const overdue = Object.entries(currentGaps)
    .filter(([_, gap]) => gap > averageGap)
    .map(([num]) => parseInt(num))

  // Analyze patterns in recent draws (last 10 draws)
  const recentDraws = draws.slice(-10)
  const patterns = {
    consecutive: recentDraws.filter(draw => 
      draw.numbers.some((num, i) => i > 0 && num === draw.numbers[i - 1] + 1)
    ).length / recentDraws.length,
    evenOdd: recentDraws.reduce((sum, draw) => 
      sum + draw.numbers.filter(n => n % 2 === 0).length / draw.numbers.length
    , 0) / recentDraws.length,
    highLow: recentDraws.reduce((sum, draw) => 
      sum + draw.numbers.filter(n => n > maxNumber / 2).length / draw.numbers.length
    , 0) / recentDraws.length
  }

  // Calculate gap statistics
  const allGaps = Object.values(frequencies).flatMap(f => f.gapsBetweenAppearances)
  const gaps = {
    average: averageGap,
    longest: Math.max(...allGaps),
    current: currentGaps
  }

  return {
    frequencies: Object.values(frequencies),
    hotNumbers,
    coldNumbers,
    overdue,
    patterns,
    gaps
  }
}

export function compareWithHistory(
  sequence: number[],
  analysis: SequenceAnalysis
): {
  hotNumbersUsed: number[]
  coldNumbersUsed: number[]
  overdueNumbersUsed: number[]
  patterns: {
    consecutive: boolean
    evenOddRatio: number
    highLowRatio: number
  }
  recommendation: string[]
} {
  const hotNumbersUsed = sequence.filter(n => analysis.hotNumbers.includes(n))
  const coldNumbersUsed = sequence.filter(n => analysis.coldNumbers.includes(n))
  const overdueNumbersUsed = sequence.filter(n => analysis.overdue.includes(n))

  const patterns = {
    consecutive: sequence.some((num, i) => i > 0 && num === sequence[i - 1] + 1),
    evenOddRatio: sequence.filter(n => n % 2 === 0).length / sequence.length,
    highLowRatio: sequence.filter(n => n > 50 / 2).length / sequence.length
  }

  // Generate recommendations
  const recommendation: string[] = []

  if (hotNumbersUsed.length > sequence.length / 2) {
    recommendation.push('Consider using fewer frequently drawn numbers')
  }
  if (coldNumbersUsed.length > sequence.length / 2) {
    recommendation.push('Consider using fewer rarely drawn numbers')
  }
  if (overdueNumbersUsed.length === 0) {
    recommendation.push('Consider including some overdue numbers')
  }
  if (patterns.consecutive) {
    recommendation.push('Your sequence contains consecutive numbers, which are less common')
  }
  if (Math.abs(patterns.evenOddRatio - 0.5) > 0.3) {
    recommendation.push('Consider balancing even and odd numbers')
  }
  if (Math.abs(patterns.highLowRatio - 0.5) > 0.3) {
    recommendation.push('Consider balancing high and low numbers')
  }

  return {
    hotNumbersUsed,
    coldNumbersUsed,
    overdueNumbersUsed,
    patterns,
    recommendation
  }
}
