import { SEQUENCE_LIMITS } from '@/constants'
import type { PatternStats } from '@/types'

export function generateSequence(length: number): number[] {
  const numbers = Array.from({ length: SEQUENCE_LIMITS.MAX_NUMBER }, (_, i) => i + 1)
  const sequence = []
  
  while (sequence.length < length) {
    const randomIndex = Math.floor(Math.random() * numbers.length)
    sequence.push(numbers[randomIndex])
    numbers.splice(randomIndex, 1)
  }
  
  return sequence.sort((a, b) => a - b)
}

export function validateSequence(sequence: number[]): boolean {
  if (!Array.isArray(sequence)) return false
  if (sequence.length < SEQUENCE_LIMITS.MIN_LENGTH || sequence.length > SEQUENCE_LIMITS.MAX_LENGTH) return false
  
  const uniqueNumbers = new Set(sequence)
  if (uniqueNumbers.size !== sequence.length) return false
  
  return sequence.every(num => 
    Number.isInteger(num) && 
    num >= 1 && 
    num <= SEQUENCE_LIMITS.MAX_NUMBER
  )
}

export function analyzePatterns(sequence: number[]): PatternStats {
  // Count consecutive numbers
  let consecutivePairs = 0
  const sortedSeq = [...sequence].sort((a, b) => a - b)
  for (let i = 0; i < sortedSeq.length - 1; i++) {
    if (sortedSeq[i + 1] - sortedSeq[i] === 1) consecutivePairs++
  }

  // Count even/odd ratio
  const evenCount = sequence.filter(n => n % 2 === 0).length
  const oddCount = sequence.length - evenCount
  const evenOddRatio = Math.abs(evenCount - oddCount)

  // Count high/low ratio
  const highCount = sequence.filter(n => n > SEQUENCE_LIMITS.MAX_NUMBER / 2).length
  const lowCount = sequence.length - highCount
  const highLowRatio = Math.abs(highCount - lowCount)

  return {
    consecutive: consecutivePairs,
    evenOdd: evenOddRatio,
    highLow: highLowRatio
  }
}

export function formatSequence(sequence: number[]): string {
  return sequence.map(num => num.toString().padStart(2, '0')).join(' - ')
}
