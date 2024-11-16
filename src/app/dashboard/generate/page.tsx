'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import { AnalysisDialog } from '@/components/lottery/analysis-dialog'
import { ChartBar, Trash2 } from 'lucide-react'
import { useSequencesStore } from '@/lib/stores/sequences'
import { Dialog } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { SequenceDisplay } from '@/components/sequence/sequence-display'
import { usePreferencesStore } from '@/lib/stores/preferences'
import { Sequence } from '@/types'

export default function GeneratePage() {
  const { addToast, ToastContainer } = useToast()
  const [loading, setLoading] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [selectedSequence, setSelectedSequence] = useState<number[]>([])
  const { sequences, addSequence, clearSequences } = useSequencesStore()
  const { defaultSequenceLength, defaultSequenceCount } = usePreferencesStore()
  const [newSequenceIds, setNewSequenceIds] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    numbersPerSequence: defaultSequenceLength,
    numberOfSequences: defaultSequenceCount
  })

  useEffect(() => {
    setFormData({
      numbersPerSequence: defaultSequenceLength,
      numberOfSequences: defaultSequenceCount
    })
  }, [defaultSequenceLength, defaultSequenceCount])

  const handleGenerate = async () => {
    if (!formData.numbersPerSequence || !formData.numberOfSequences) return

    setLoading(true)
    try {
      const response = await fetch('/api/sequences/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          length: formData.numbersPerSequence,
          count: formData.numberOfSequences
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate sequences')
      }

      const data = await response.json()
      const newIds = new Set<string>()
      
      data.sequences.forEach((numbers: number[], _index: number) => {
        const sequenceId = crypto.randomUUID()
        const sequence: Sequence = {
          _id: sequenceId,
          userId: '',
          numbers,
          createdAt: new Date().toISOString(),
          metadata: {
            sequenceLength: formData.numbersPerSequence,
            totalSequences: formData.numberOfSequences
          }
        }
        newIds.add(sequenceId)
        addSequence(sequence)
      })

      setNewSequenceIds(newIds)
      setTimeout(() => {
        setNewSequenceIds(new Set())
      }, 3000)  // Clear highlight after 3 seconds

      addToast('Sequences generated successfully')
    } catch (error) {
      console.error('Error generating sequences:', error)
      addToast('Failed to generate sequences', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClearConfirm = () => {
    clearSequences()
    setClearDialogOpen(false)
    addToast('All sequences cleared')
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Generate Sequences</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Configure and generate unique random number sequences.
        </p>
      </div>

      {/* Legal Disclaimer Alert */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-800 dark:text-yellow-200" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Important Notice
            </h3>
            <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
              <p>
                This tool is designed for entertainment purposes only. The sequences generated and 
                analyses provided are based on mathematical calculations and historical data, but:
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Do not guarantee any future lottery outcomes</li>
                <li>Should not be used as financial or gambling advice</li>
                <li>Cannot predict or influence actual lottery results</li>
              </ul>
              <p className="mt-2">
                Lottery games are games of chance. Please gamble responsibly and be aware that 
                lottery participation can be addictive. If you have a gambling problem, please 
                seek professional help.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Numbers per Sequence
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.numbersPerSequence}
                onChange={(e) => setFormData(prev => ({ ...prev, numbersPerSequence: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Sequences
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.numberOfSequences}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfSequences: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {sequences.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Sequences</h2>
            <button
              onClick={() => setClearDialogOpen(true)}
              className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>

          <div className="space-y-4">
            {[...sequences].reverse().map((seq, _index) => (
              <div
                key={seq._id}
                className={`flex items-center justify-between rounded-lg border p-4 transition-all duration-500 ${
                  newSequenceIds.has(seq._id)
                    ? 'border-green-500 bg-green-50 dark:border-green-500/50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <SequenceDisplay sequence={seq.numbers} />
                <button
                  onClick={() => {
                    setSelectedSequence(seq.numbers)
                    setAnalysisOpen(true)
                  }}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <ChartBar className="h-4 w-4" />
                  Analyze
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog
        isOpen={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        title="Clear All Sequences"
        description="Are you sure you want to clear all generated sequences? This action cannot be undone."
        onConfirm={handleClearConfirm}
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
      />

      <AnalysisDialog
        isOpen={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        sequence={selectedSequence}
      />
    </div>
  )
}
