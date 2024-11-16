'use client'

import { useState } from 'react'
import { findPatterns, getPatternDescription, patternColors } from '@/lib/sequence-patterns'

interface SequenceDisplayProps {
  sequence: number[]
  showPatterns?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function SequenceDisplay({ sequence, showPatterns = true, size = 'md' }: SequenceDisplayProps) {
  const [showPatternDetails, setShowPatternDetails] = useState(false)
  const patterns = showPatterns ? findPatterns(sequence) : []

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  }

  // Create spans with appropriate colors for each number based on patterns
  const renderSequence = () => {
    const spans: JSX.Element[] = []
    
    for (let i = 0; i < sequence.length; i++) {
      const matchingPattern = patterns.find(p => i >= p.start && i <= p.end)
      
      spans.push(
        <div
          key={i}
          className={`flex ${sizeClasses[size]} items-center justify-center rounded-full bg-gray-100 font-mono font-semibold text-gray-900 dark:bg-gray-700 dark:text-white select-none touch-manipulation ${
            matchingPattern ? patternColors[matchingPattern.type] : 'text-gray-900 dark:text-gray-100'
          }`}
          title={matchingPattern ? getPatternDescription(matchingPattern, sequence) : undefined}
        >
          {sequence[i]}
        </div>
      )
    }

    return spans
  }

  return (
    <div className="space-y-2 touch-manipulation">
      <div className="flex flex-wrap gap-2 rounded-md bg-gray-50 p-3 dark:bg-gray-700/50">
        {renderSequence()}
      </div>
      
      {showPatterns && patterns.length > 0 && (
        <div className="space-y-1">
          <button
            onClick={() => setShowPatternDetails(!showPatternDetails)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showPatternDetails ? 'Hide' : 'Show'} {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
          </button>
          
          {showPatternDetails && (
            <ul className="space-y-1 rounded-md bg-gray-50 p-2 text-sm dark:bg-gray-700/50">
              {patterns.map((pattern, index) => (
                <li key={index} className={patternColors[pattern.type]}>
                  {getPatternDescription(pattern, sequence)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
