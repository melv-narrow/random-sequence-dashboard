'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { AnalysisDisplay } from '@/components/lottery/analysis-display'
import { useToast } from '@/components/ui/toast'

export default function AnalysisPage() {
  const { addToast, ToastContainer } = useToast()
  const [lotteryHistory, setLotteryHistory] = useState<Array<{ date: string; numbers: number[] }>>([])
  const [newDraw, setNewDraw] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    numbers: ['', '', '', '', '', ''] as string[]
  })
  const [selectedSequence, setSelectedSequence] = useState<number[]>([])

  const handleAddDraw = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate numbers
    const numbers = newDraw.numbers.map(n => parseInt(n))
    if (numbers.some(isNaN)) {
      addToast('Please enter valid numbers', 'error')
      return
    }

    if (new Set(numbers).size !== numbers.length) {
      addToast('Numbers must be unique', 'error')
      return
    }

    if (numbers.some(n => n < 1 || n > 50)) {
      addToast('Numbers must be between 1 and 50', 'error')
      return
    }

    // Add new draw
    setLotteryHistory(prev => [
      ...prev,
      {
        date: newDraw.date,
        numbers: numbers
      }
    ])

    // Reset form
    setNewDraw({
      date: format(new Date(), 'yyyy-MM-dd'),
      numbers: ['', '', '', '', '', '']
    })

    addToast('Lottery draw added successfully')
  }

  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...newDraw.numbers]
    
    // Only allow numbers and empty string
    if (value !== '' && !/^\d+$/.test(value)) return
    
    // Limit to 2 digits
    if (value.length > 2) return

    newNumbers[index] = value
    setNewDraw(prev => ({ ...prev, numbers: newNumbers }))
  }

  const handleAnalyzeSequence = (e: React.FormEvent) => {
    e.preventDefault()

    if (lotteryHistory.length < 10) {
      addToast('Please add at least 10 lottery draws for meaningful analysis', 'error')
      return
    }

    // Get sequence from localStorage or generate new one
    const sequences = JSON.parse(localStorage.getItem('sequences') || '[]')
    if (sequences.length === 0) {
      addToast('Please generate some sequences first', 'error')
      return
    }

    // Use the most recent sequence
    setSelectedSequence(sequences[0].numbers)
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lottery Analysis</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Add historical lottery draws and analyze your sequences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Lottery Draw</h2>
          <form onSubmit={handleAddDraw} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Draw Date
                <input
                  type="date"
                  value={newDraw.date}
                  onChange={e => setNewDraw(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Numbers (1-50)
              </label>
              <div className="mt-1 grid grid-cols-6 gap-2">
                {newDraw.numbers.map((num, index) => (
                  <input
                    key={index}
                    type="text"
                    value={num}
                    onChange={e => handleNumberChange(index, e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    placeholder={(index + 1).toString()}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-500"
            >
              Add Draw
            </button>
          </form>

          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Recent Draws</h3>
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {lotteryHistory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No lottery draws added yet
                </p>
              ) : (
                lotteryHistory.map((draw, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md bg-gray-50 p-2 text-sm dark:bg-gray-700/50"
                  >
                    <span className="font-medium">{draw.date}</span>
                    <span className="font-mono">{draw.numbers.join(', ')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={handleAnalyzeSequence}
            disabled={lotteryHistory.length === 0}
            className="mb-4 w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:hover:bg-green-500"
          >
            Analyze Latest Sequence
          </button>

          {selectedSequence.length > 0 && lotteryHistory.length > 0 && (
            <AnalysisDisplay
              sequence={selectedSequence}
              lotteryHistory={lotteryHistory}
            />
          )}
        </div>
      </div>
    </div>
  )
}
