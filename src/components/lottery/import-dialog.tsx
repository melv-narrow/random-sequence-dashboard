'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/modal-dialog'
import { SuccessDialog } from '@/components/ui/success-dialog'
import { DuplicateDialog } from '@/components/ui/duplicate-dialog'
import { useToast } from '@/components/ui/toast'
import { Upload, Download, FileText } from 'lucide-react'
import { generateDrawTemplate, templateInstructions } from '@/lib/template-generator'

interface ImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: () => void
}

export function ImportDialog({ isOpen, onClose, onImportSuccess }: ImportDialogProps) {
  const { addToast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [importResult, setImportResult] = useState<{
    status?: 'success' | 'partial'
    count?: number
    newDrawsCount?: number
    duplicates?: Array<{ date: string; numbers: number[] }>
  }>({})

  const handleDownloadTemplate = () => {
    const template = generateDrawTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lottery-draws-template-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleSuccessClose = () => {
    setSuccessDialogOpen(false)
    onImportSuccess()
    onClose()
  }

  const handleDuplicateClose = () => {
    setDuplicateDialogOpen(false)
    onImportSuccess()
    onClose()
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    try {
      setLoading(true)
      const text = await file.text()
      const rows = text.split('\n')
        .filter(row => row.trim() && !row.startsWith('Date')) // Skip header and empty lines
        .map(row => {
          const [date, numbersStr] = row.split(',')
          if (!date || !numbersStr) return null
          
          const numbers = numbersStr.trim().split(' ')
            .map(n => parseInt(n.trim()))
            .filter(n => !isNaN(n))
          
          if (numbers.length !== 6) return null
          
          return { date: date.trim(), numbers }
        })
        .filter((draw): draw is { date: string; numbers: number[] } => draw !== null)

      if (rows.length === 0) {
        addToast('No valid draws found in file', 'error')
        return
      }

      const response = await fetch('/api/lottery/draws/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows)
      })

      const data = await response.json()
      
      if (!response.ok && response.status !== 409) {
        throw new Error(data.message || 'Failed to import draws')
      }

      setImportResult(data)

      // Show appropriate dialog based on import result
      if (data.status === 'partial') {
        setDuplicateDialogOpen(true)
      } else {
        setSuccessDialogOpen(true)
      }
    } catch (error) {
      console.error('Error importing draws:', error)
      addToast(error instanceof Error ? error.message : 'Failed to import draws', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      addToast('Please upload a CSV or TXT file', 'error')
      return
    }

    await handleFileUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      addToast('Please upload a CSV or TXT file', 'error')
      return
    }

    await handleFileUpload(file)
  }

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="Import Lottery Draws"
        description="Upload a CSV or TXT file with your lottery draws"
      >
        <div className="mt-4 space-y-4">
          <div className="flex justify-between">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
            <button
              onClick={() => {
                const blob = new Blob([templateInstructions], { type: 'text/plain' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'import-instructions.txt'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              Download Instructions
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/50'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
            }`}
          >
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center gap-2"
            >
              <Upload
                className={`h-8 w-8 ${
                  isDragging ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400'
                }`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {loading
                  ? 'Uploading...'
                  : isDragging
                  ? 'Drop your file here'
                  : 'Drag and drop or click to upload'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Supports CSV and TXT files
              </span>
            </label>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Quick Instructions
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>Use CSV or TXT file format</li>
              <li>Each line: date,numbers (space-separated)</li>
              <li>Example: 2024-01-20,1 2 3 4 5 6</li>
              <li>Numbers must be unique and between 1-50</li>
            </ul>
          </div>
        </div>
      </Dialog>

      <SuccessDialog
        isOpen={successDialogOpen}
        onClose={handleSuccessClose}
        title="Import Successful"
        message={`Successfully imported ${importResult.count} lottery ${
          importResult.count === 1 ? 'draw' : 'draws'
        }. Click OK to continue.`}
      />

      <DuplicateDialog
        isOpen={duplicateDialogOpen}
        onClose={handleDuplicateClose}
        title="Duplicate Draws Found"
        message="Some draws were skipped because they already exist in your history."
        duplicates={importResult.duplicates || []}
        newDrawsCount={importResult.newDrawsCount || 0}
      />
    </>
  )
}
