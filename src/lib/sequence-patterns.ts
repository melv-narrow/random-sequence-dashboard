interface Pattern {
  type: 'ascending' | 'descending' | 'consecutive' | 'repeated' | 'evenOdd'
  start: number
  end: number
}

export function findPatterns(sequence: number[]): Pattern[] {
  const patterns: Pattern[] = []

  // Check for ascending/descending patterns (minimum 3 numbers)
  for (let i = 0; i < sequence.length - 2; i++) {
    let ascending = true
    let descending = true
    let j = i

    while (j < sequence.length - 1) {
      if (sequence[j + 1] !== sequence[j] + 1) ascending = false
      if (sequence[j + 1] !== sequence[j] - 1) descending = false
      if (!ascending && !descending) break
      j++
    }

    if (ascending && j - i >= 2) {
      patterns.push({
        type: 'ascending',
        start: i,
        end: j
      })
      i = j
    } else if (descending && j - i >= 2) {
      patterns.push({
        type: 'descending',
        start: i,
        end: j
      })
      i = j
    }
  }

  // Check for consecutive numbers (not necessarily in order)
  for (let i = 0; i < sequence.length - 2; i++) {
    const consecutiveSet = new Set([sequence[i]])
    let j = i + 1
    let min = sequence[i]
    let max = sequence[i]

    while (j < sequence.length) {
      consecutiveSet.add(sequence[j])
      min = Math.min(min, sequence[j])
      max = Math.max(max, sequence[j])
      
      if (max - min === consecutiveSet.size - 1 && consecutiveSet.size >= 3) {
        patterns.push({
          type: 'consecutive',
          start: i,
          end: j
        })
      }
      j++
    }
  }

  // Check for repeated numbers
  for (let i = 0; i < sequence.length - 1; i++) {
    if (sequence[i] === sequence[i + 1]) {
      let j = i + 1
      while (j < sequence.length && sequence[j] === sequence[i]) j++
      if (j - i >= 2) {
        patterns.push({
          type: 'repeated',
          start: i,
          end: j - 1
        })
        i = j - 1
      }
    }
  }

  // Check for even/odd patterns (minimum 3 numbers)
  for (let i = 0; i < sequence.length - 2; i++) {
    let allEven = true
    let allOdd = true
    let j = i

    while (j < sequence.length) {
      if (sequence[j] % 2 === 0) allOdd = false
      if (sequence[j] % 2 === 1) allEven = false
      if (!allEven && !allOdd) break
      j++
    }

    if ((allEven || allOdd) && j - i >= 3) {
      patterns.push({
        type: 'evenOdd',
        start: i,
        end: j - 1
      })
      i = j - 1
    }
  }

  return patterns
}

export function getPatternDescription(pattern: Pattern, sequence: number[]): string {
  const numbers = sequence.slice(pattern.start, pattern.end + 1).join(', ')
  
  switch (pattern.type) {
    case 'ascending':
      return `Ascending sequence: ${numbers}`
    case 'descending':
      return `Descending sequence: ${numbers}`
    case 'consecutive':
      return `Consecutive numbers (any order): ${numbers}`
    case 'repeated':
      return `Repeated number: ${numbers}`
    case 'evenOdd':
      return `${sequence[pattern.start] % 2 === 0 ? 'Even' : 'Odd'} numbers: ${numbers}`
    default:
      return ''
  }
}

export const patternColors = {
  ascending: 'text-green-600 dark:text-green-400',
  descending: 'text-blue-600 dark:text-blue-400',
  consecutive: 'text-purple-600 dark:text-purple-400',
  repeated: 'text-red-600 dark:text-red-400',
  evenOdd: 'text-orange-600 dark:text-orange-400'
}
