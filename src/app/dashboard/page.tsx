'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  PlusCircle, 
  History, 
  ChartBar, 
  Target, 
  Hash, 
  TrendingUp,
  Sparkles,
  Clock
} from 'lucide-react'
import { useSequencesStore } from '@/lib/stores/sequences'
import { formatDistanceToNow } from 'date-fns'

interface DashboardStats {
  totalSequences: number
  lastGenerated: string | null
  averageLength: number
  popularNumbers: Array<{ number: number; count: number }>
  recentActivity: {
    today: number
    week: number
    month: number
  }
  patterns: {
    consecutive: number
    evenOdd: number
    highLow: number
  }
}

export default function DashboardPage() {
  const { sequences } = useSequencesStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalSequences: 0,
    lastGenerated: null,
    averageLength: 0,
    popularNumbers: [],
    recentActivity: {
      today: 0,
      week: 0,
      month: 0
    },
    patterns: {
      consecutive: 0,
      evenOdd: 0,
      highLow: 0
    }
  })

  useEffect(() => {
    if (sequences.length > 0) {
      // Calculate total sequences and average length
      const totalLength = sequences.reduce((sum, seq) => sum + seq.numbers.length, 0)
      const avgLength = totalLength / sequences.length

      // Find popular numbers
      const numberFrequency = new Map<number, number>()
      sequences.forEach(seq => {
        seq.numbers.forEach(num => {
          numberFrequency.set(num, (numberFrequency.get(num) || 0) + 1)
        })
      })
      
      const sortedNumbers = Array.from(numberFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([number, count]) => ({ number, count }))

      // Calculate recent activity
      const now = new Date()
      const today = new Date(now.setHours(0, 0, 0, 0))
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const todayCount = sequences.filter(seq => new Date(seq.createdAt) >= today).length
      const weekCount = sequences.filter(seq => new Date(seq.createdAt) >= weekAgo).length
      const monthCount = sequences.filter(seq => new Date(seq.createdAt) >= monthAgo).length

      // Calculate pattern statistics
      const patternStats = sequences.reduce(
        (acc, seq) => {
          // Count consecutive numbers
          let consecutivePairs = 0
          const sortedSeq = [...seq.numbers].sort((a, b) => a - b)
          for (let i = 0; i < sortedSeq.length - 1; i++) {
            if (sortedSeq[i + 1] - sortedSeq[i] === 1) consecutivePairs++
          }

          // Count even/odd ratio
          const evenCount = seq.numbers.filter(n => n % 2 === 0).length
          const oddCount = seq.numbers.length - evenCount
          const evenOddRatio = Math.abs(evenCount - oddCount)

          // Count high/low ratio
          const highCount = seq.numbers.filter(n => n > 25).length
          const lowCount = seq.numbers.length - highCount
          const highLowRatio = Math.abs(highCount - lowCount)

          return {
            consecutive: acc.consecutive + consecutivePairs,
            evenOdd: acc.evenOdd + evenOddRatio,
            highLow: acc.highLow + highLowRatio
          }
        },
        { consecutive: 0, evenOdd: 0, highLow: 0 }
      )

      // Cap percentages at 100%
      const cappedPercentages = {
        consecutive: Math.min(100, Math.round((patternStats.consecutive / sequences.length) * 100)),
        evenOdd: Math.min(100, Math.round((patternStats.evenOdd / sequences.length) * 100)),
        highLow: Math.min(100, Math.round((patternStats.highLow / sequences.length) * 100))
      }

      // Get last generated time
      const lastSequence = sequences[sequences.length - 1]
      const lastGeneratedTime = lastSequence ? formatDistanceToNow(new Date(lastSequence.createdAt), { addSuffix: true }) : null

      setStats({
        totalSequences: sequences.length,
        lastGenerated: lastGeneratedTime,
        averageLength: avgLength,
        popularNumbers: sortedNumbers,
        recentActivity: {
          today: todayCount,
          week: weekCount,
          month: monthCount
        },
        patterns: cappedPercentages
      })
    }
  }, [sequences])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Welcome to your lottery sequence analysis dashboard.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/50">
              <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sequences</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalSequences}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/50">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Generated</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.lastGenerated || 'Never'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/50">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Length</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.averageLength.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/50">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Popular Numbers</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {stats.popularNumbers.slice(0, 3).map(({ number, count }) => (
                  <span
                    key={number}
                    className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                  >
                    {number} ({count}x)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.recentActivity.today} sequences</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.recentActivity.week} sequences</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.recentActivity.month} sequences</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pattern Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Consecutive Numbers</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.patterns.consecutive}%</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden dark:bg-gray-700">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${stats.patterns.consecutive}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Even/Odd Balance</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.patterns.evenOdd}%</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden dark:bg-gray-700">
                <div
                  className="absolute top-0 left-0 h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${stats.patterns.evenOdd}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">High/Low Balance</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.patterns.highLow}%</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden dark:bg-gray-700">
                <div
                  className="absolute top-0 left-0 h-full bg-green-600 rounded-full transition-all duration-300"
                  style={{ width: `${stats.patterns.highLow}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/generate"
          className="group relative rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 dark:bg-blue-900/50">
              <PlusCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Generate Sequence</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create new number sequences</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/history"
          className="group relative rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 group-hover:bg-purple-100 dark:bg-purple-900/50">
              <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">View History</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Browse past sequences</p>
            </div>
          </div>
        </Link>

        <div className="group relative rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/50">
              <ChartBar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Analysis Tools</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Advanced sequence analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Smart Analysis</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Advanced statistical analysis and pattern recognition for your sequences.
          </p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Win Probability</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Calculate theoretical win probabilities based on historical data.
          </p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ChartBar className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Visual Insights</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Interactive charts and visualizations for better understanding.
          </p>
        </div>
      </div>
    </div>
  )
}
