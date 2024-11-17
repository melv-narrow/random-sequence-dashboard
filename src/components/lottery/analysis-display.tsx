'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import type { SequenceAnalysis } from '@/types'
import { analyzeSequence } from '@/lib/sequence-analysis'

interface AnalysisDisplayProps {
  sequence: number[]
  lotteryHistory: Array<{ date: string; numbers: number[] }>
}

export function AnalysisDisplay({ sequence, lotteryHistory }: AnalysisDisplayProps) {
  const [analysis, setAnalysis] = useState<SequenceAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        const result = await analyzeSequence(sequence, lotteryHistory)
        setAnalysis(result)
      } catch (error) {
        console.error('Analysis error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [sequence, lotteryHistory])

  const chartData = useMemo(() => {
    if (!analysis) return []
    return analysis.frequencies.map(f => ({
      number: f.number,
      count: f.count
    }))
  }, [analysis])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400"></div>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  const getBarColor = (index: number): string => {
    const colors = [
      '#3b82f6', // blue
      '#22c55e', // green
      '#a855f7', // purple
      '#f97316', // orange
      '#94a3b8'  // gray
    ]
    return colors[index % colors.length] || colors[colors.length - 1]
  }

  return (
    <div className="space-y-8">
      {/* Frequency Distribution */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Number Frequency Distribution
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="number" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                name="Frequency"
                stroke="#2563eb"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pattern Analysis */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Pattern Analysis
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Consecutive Numbers
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {analysis.pattern.consecutive}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Even/Odd Distribution
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {`${analysis.pattern.evenOdd.even}/${analysis.pattern.evenOdd.odd}`}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              High/Low Distribution
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {`${analysis.pattern.highLow.high}/${analysis.pattern.highLow.low}`}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Average
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {analysis.pattern.average.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Recommendations
        </h3>
        <div className="space-y-2">
          {analysis.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full bg-blue-500`}
                />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Historical Draws */}
      {analysis.matchingDraws.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Similar Historical Draws
          </h3>
          <div className="space-y-2">
            {analysis.matchingDraws.map((draw, index) => (
              <div
                key={index}
                className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {draw.date}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {draw.matches} matching numbers
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {draw.numbers.join(' - ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
