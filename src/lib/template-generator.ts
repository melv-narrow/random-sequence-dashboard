import { format } from 'date-fns'
import { SEQUENCE_LIMITS } from '@/constants'

export function generateDrawTemplate(numberOfRows = 5): string {
  const header = 'Date,Numbers (space-separated)\n'
  const rows = Array.from({ length: numberOfRows }, () => {
    const date = format(new Date(), 'yyyy-MM-dd')
    const numbers = generateTemplate(6).join(' ')
    return `${date},${numbers}`
  }).join('\n')

  return header + rows
}

export function generateTemplate(length: number): number[] {
  return Array.from({ length }, () => 
    Math.floor(Math.random() * SEQUENCE_LIMITS.MAX_NUMBER) + 1
  ).sort((a, b) => a - b)
}

export const templateInstructions = `
Instructions for Lottery Draw Import:

1. File Format:
   - CSV or TXT file
   - Two columns: Date and Numbers
   - Numbers should be space-separated

2. Date Format:
   - YYYY-MM-DD (e.g., 2024-01-01)

3. Numbers Format:
   - Space-separated integers
   - Example: 1 15 22 34 45 49

4. Example Row:
   2024-01-01,1 15 22 34 45 49

Note: Each row should contain exactly one draw.
`
