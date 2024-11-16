'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog } from '@/components/ui/modal-dialog'
import { analyzeSequence } from '@/lib/sequence-analysis'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Flame, Snowflake, Activity, TrendingUp, TrendingDown, Minus, Target, Percent, LineChart, BarChart2 } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface AnalysisDialogProps {
  isOpen: boolean
  onClose: () => void
  sequence: number[]
}

export function AnalysisDialog({ isOpen, onClose, sequence }: AnalysisDialogProps) {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeSequence> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!sequence.length) return
      
      try {
        setLoading(true)
        setError(null)
        const result = await analyzeSequence(sequence)
        setAnalysis(result)
      } catch (err) {
        console.error('Analysis error:', err)
        setError('Failed to analyze sequence')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [sequence])

  const chartData = useMemo(() => {
    if (!analysis) return null

    return {
      labels: analysis.frequencies.map(f => f.number),
      datasets: [
        {
          label: 'Number Frequency',
          data: analysis.frequencies.map(f => f.count),
          backgroundColor: analysis.frequencies.map(f => {
            switch (f.status) {
              case 'hot':
                return 'rgba(239, 68, 68, 0.5)'
              case 'warm':
                return 'rgba(249, 115, 22, 0.5)'
              case 'cold':
                return 'rgba(59, 130, 246, 0.5)'
            }
          }),
          borderColor: analysis.frequencies.map(f => {
            switch (f.status) {
              case 'hot':
                return 'rgb(239, 68, 68)'
              case 'warm':
                return 'rgb(249, 115, 22)'
              case 'cold':
                return 'rgb(59, 130, 246)'
            }
          }),
          borderWidth: 1,
        },
      ],
    }
  }, [analysis])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Number Frequency Distribution (%)'
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const frequency = context.raw.toFixed(1)
            const number = analysis?.frequencies[context.dataIndex]
            return [
              `Frequency: ${frequency}%`,
              `Status: ${number?.status?.toUpperCase()}`,
              number?.lastDrawn ? `Last Drawn: ${number.lastDrawn}` : 'Never drawn'
            ]
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Frequency (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Number'
        }
      }
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Sequence Analysis"
      description="Analysis based on historical lottery draws"
    >
      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading analysis...</div>
        </div>
      ) : error ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-red-500 dark:text-red-400">{error}</div>
        </div>
      ) : !analysis ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">No analysis available</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Number Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20 touch-manipulation">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                <h3 className="font-medium text-red-900 dark:text-red-200">Hot Numbers</h3>
              </div>
              <div className="mt-2 font-mono text-sm text-red-800 dark:text-red-300 overflow-x-auto whitespace-nowrap">
                {sequence.filter(n => 
                  analysis.frequencies.find(f => f.number === n && f.status === 'hot')
                ).join(', ') || 'None'}
              </div>
            </div>

            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20 touch-manipulation">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                <h3 className="font-medium text-orange-900 dark:text-orange-200">Warm Numbers</h3>
              </div>
              <div className="mt-2 font-mono text-sm text-orange-800 dark:text-orange-300 overflow-x-auto whitespace-nowrap">
                {sequence.filter(n => 
                  analysis.frequencies.find(f => f.number === n && f.status === 'warm')
                ).join(', ') || 'None'}
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 touch-manipulation">
              <div className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-blue-900 dark:text-blue-200">Cold Numbers</h3>
              </div>
              <div className="mt-2 font-mono text-sm text-blue-800 dark:text-blue-300 overflow-x-auto whitespace-nowrap">
                {sequence.filter(n => 
                  analysis.frequencies.find(f => f.number === n && f.status === 'cold')
                ).join(', ') || 'None'}
              </div>
            </div>
          </div>

          {/* Pattern Analysis */}
          <div className="rounded-lg border p-4 dark:border-gray-700 touch-manipulation">
            <h3 className="font-medium text-gray-900 dark:text-white">Pattern Analysis</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-gray-600 dark:text-gray-400">Consecutive Numbers:</div>
                <div className="font-medium text-gray-900 dark:text-white">{analysis.pattern.consecutive} pairs</div>
              </div>
              <div className="space-y-2">
                <div className="text-gray-600 dark:text-gray-400">Even/Odd Distribution:</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {analysis.pattern.evenOdd.even} even, {analysis.pattern.evenOdd.odd} odd
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-gray-600 dark:text-gray-400">High/Low Distribution:</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {analysis.pattern.highLow.high} high, {analysis.pattern.highLow.low} low
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-gray-600 dark:text-gray-400">Sum/Average:</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {analysis.pattern.sum} / {analysis.pattern.average.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Win Probability */}
          <div className="rounded-lg border p-4 dark:border-gray-700 touch-manipulation">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Win Probability</h3>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Overall Probability</span>
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-500" />
                  <span className="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {analysis.winProbability.overall}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {analysis.winProbability.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{factor.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${factor.impact}%` }}
                        />
                      </div>
                      <span className="font-mono text-gray-900 dark:text-gray-100">
                        {factor.impact.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pattern Strength */}
          <div className="rounded-lg border p-4 dark:border-gray-700 touch-manipulation">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Pattern Strength</h3>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysis.patternStrength.map((pattern, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{pattern.type}</span>
                    <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                      {pattern.score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${pattern.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{pattern.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Trends */}
          <div className="rounded-lg border p-4 dark:border-gray-700 touch-manipulation">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Historical Trends</h3>
            </div>
            <div className="mt-4 space-y-4">
              {analysis.historicalTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {trend.period}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {trend.frequency} occurrences
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {trend.performance === 'increasing' && (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    )}
                    {trend.performance === 'decreasing' && (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    {trend.performance === 'stable' && (
                      <Minus className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                      {trend.performance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="rounded-lg border p-4 dark:border-gray-700 touch-manipulation">
            <h3 className="font-medium text-gray-900 dark:text-white">Performance Metrics</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysis.performanceMetrics.map((metric, index) => (
                <div key={index} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{metric.metric}</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                        {metric.value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-lg border p-4 dark:border-gray-700 touch-manipulation">
            <h3 className="font-medium text-gray-900 dark:text-white">Recommendations</h3>
            <ul className="mt-2 list-inside list-disc space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="break-words">{rec}</li>
              ))}
            </ul>
          </div>

          {/* Similar Draws */}
          {analysis.matchingDraws.length > 0 && (
            <div className="rounded-lg border p-4 dark:border-gray-700 touch-manipulation">
              <h3 className="font-medium text-gray-900 dark:text-white">Similar Historical Draws</h3>
              <div className="mt-2 space-y-2">
                {analysis.matchingDraws.map(draw => (
                  <div
                    key={draw.date}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-800 space-y-2 sm:space-y-0"
                  >
                    <span className="text-gray-600 dark:text-gray-400">{draw.date}</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className="font-mono text-gray-900 dark:text-white break-all sm:break-normal">
                        {draw.numbers.join(', ')}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {draw.matches} matches
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Frequency Chart */}
          {chartData && (
            <div className="rounded-lg border p-4 dark:border-gray-700 touch-manipulation overflow-x-auto">
              <div className="min-w-[600px]">
                <Bar data={chartData} options={chartOptions} height={300} />
              </div>
            </div>
          )}

          {/* Legal Disclaimer */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Disclaimer:</strong> This analysis is provided for entertainment purposes only. 
              The statistics, probabilities, and recommendations shown here are based on historical data 
              and mathematical calculations, but do not guarantee any future lottery outcomes. Lottery 
              games are games of chance, and each draw is an independent event. Please gamble responsibly 
              and be aware that lottery participation can be addictive. If you have a gambling problem, 
              please seek professional help.
            </p>
          </div>
        </div>
      )}
    </Dialog>
  )
}
