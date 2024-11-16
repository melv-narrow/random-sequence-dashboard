'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { FileSpreadsheet, FileText, Trash2, ChevronDown, ChevronUp, ChevronsUpDown, ChartBar, RotateCcw } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { SequenceDisplay } from '@/components/sequence/sequence-display'
import { Dialog } from '@/components/ui/dialog'
import { AnalysisDialog } from '@/components/lottery/analysis-dialog'
import { ErrorDialog } from '@/components/ui/error-dialog'
import * as XLSX from 'xlsx'
import { isAfter, isBefore, parseISO } from 'date-fns'

interface Sequence {
  _id: string
  userId: string
  numbers: number[]
  createdAt: string
  metadata: {
    sequenceLength: number
    totalSequences: number
  }
}

interface PaginationInfo {
  total: number
  pages: number
  current: number
  pageSize: number
}

type ExportFormat = 'csv' | 'excel'

type SortField = 'date' | 'length' | 'min' | 'max' | 'average'
type SortDirection = 'asc' | 'desc'

interface SortState {
  field: SortField
  direction: SortDirection
}

export default function HistoryPage() {
  const { addToast, ToastContainer } = useToast()
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [selectedSequences, setSelectedSequences] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    current: 1,
    pageSize: 10
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    sequenceLength: ''
  })
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [sortState, setSortState] = useState<SortState>({
    field: 'date',
    direction: 'desc'
  })
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [selectedSequence, setSelectedSequence] = useState<number[]>([])
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchRef = useRef(false)

  const getSortIcon = (field: SortField) => {
    if (sortState.field !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortState.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  const handleSort = (field: SortField) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }))
  }

  const sortSequences = (sequences: Sequence[]) => {
    return [...sequences].sort((a, b) => {
      const direction = sortState.direction === 'asc' ? 1 : -1
      
      switch (sortState.field) {
        case 'date':
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction
        case 'length':
          return (a.metadata.sequenceLength - b.metadata.sequenceLength) * direction
        case 'min':
          return (Math.min(...a.numbers) - Math.min(...b.numbers)) * direction
        case 'max':
          return (Math.max(...a.numbers) - Math.max(...b.numbers)) * direction
        case 'average':
          const avgA = a.numbers.reduce((sum, n) => sum + n, 0) / a.numbers.length
          const avgB = b.numbers.reduce((sum, n) => sum + n, 0) / b.numbers.length
          return (avgA - avgB) * direction
        default:
          return 0
      }
    })
  }

  const fetchSequences = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || '',
        sequenceLength: filters.sequenceLength?.toString() || ''
      })

      console.log('Fetching sequences with params:', params.toString())
      
      const response = await fetch(`/api/sequences/history?${params}`)
      const contentType = response.headers.get('content-type')
      
      if (!response.ok) {
        const errorData = contentType?.includes('application/json') 
          ? await response.json()
          : await response.text()
        throw new Error(typeof errorData === 'string' ? errorData : errorData.error)
      }

      const data = await response.json()
      console.log('Received data:', data)

      if (!data.sequences || !Array.isArray(data.sequences)) {
        throw new Error('Invalid response format')
      }

      setSequences(data.sequences)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages,
        current: data.pagination.current,
        pageSize: data.pagination.pageSize
      }))
    } catch (error) {
      console.error('Error fetching sequences:', error)
      addToast(error instanceof Error ? error.message : 'Failed to fetch sequences', 'error')
      setSequences([])
      setPagination(prev => ({
        ...prev,
        total: 0,
        pages: 0
      }))
    } finally {
      setLoading(false)
    }
  }, [pagination, filters, addToast])

  useEffect(() => {
    if (fetchRef.current) return
    fetchRef.current = true
    
    fetchSequences()
  }, [fetchSequences])

  useEffect(() => {
    if (!fetchRef.current) return

    const debounceTimer = setTimeout(() => {
      fetchSequences()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [
    fetchSequences,
    filters.dateFrom,
    filters.dateTo,
    filters.sequenceLength,
    pagination
  ])

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }))
  }

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      sequenceLength: ''
    })
    setPagination(prev => ({ ...prev, current: 1 }))
    addToast('Filters have been reset')
  }

  const handleDelete = async (sequenceId: string) => {
    try {
      setDeleting(sequenceId)
      setSequences(prev => prev.filter(seq => seq._id !== sequenceId))
      
      const response = await fetch(`/api/sequences/delete?id=${sequenceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        fetchSequences()
        throw new Error('Failed to delete sequence')
      }

      addToast('Sequence deleted successfully')
    } catch (error) {
      console.error('Error:', error)
      addToast(error instanceof Error ? error.message : 'Failed to delete sequence', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedSequences.size === 0) return

    try {
      setLoading(true)
      const response = await fetch('/api/sequences/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequenceIds: Array.from(selectedSequences),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to delete sequences')
      }

      const data = await response.json()
      addToast(data.message)
      setSelectedSequences(new Set())
      fetchSequences()
    } catch (error) {
      console.error('Error:', error)
      addToast(error instanceof Error ? error.message : 'Failed to delete sequences', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedSequences.size === sequences.length) {
      setSelectedSequences(new Set())
    } else {
      setSelectedSequences(new Set(sequences.map(seq => seq._id)))
    }
  }

  const toggleSelect = (sequenceId: string) => {
    const newSelected = new Set(selectedSequences)
    if (newSelected.has(sequenceId)) {
      newSelected.delete(sequenceId)
    } else {
      newSelected.add(sequenceId)
    }
    setSelectedSequences(newSelected)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss')
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return dateString
    }
  }

  const getFileName = (type: 'csv' | 'excel', selectedOnly: boolean) => {
    const timestamp = format(new Date(), 'yyyy-MM-dd')
    const suffix = selectedOnly ? '-selected' : ''
    const extension = type === 'excel' ? '.xlsx' : '.csv'
    return `sequences-${timestamp}${suffix}${extension}`
  }

  const exportData = (selectedOnly: boolean = false, exportFormat: ExportFormat = 'csv') => {
    const sequencesToExport = selectedOnly
      ? sequences.filter(seq => selectedSequences.has(seq._id))
      : sequences

    if (sequencesToExport.length === 0) {
      addToast('No sequences selected for export', 'error')
      return
    }

    const data = sequencesToExport.map((seq) => ({
      Date: formatDate(seq.createdAt),
      'Sequence Length': seq.metadata.sequenceLength,
      'Numbers': seq.numbers.join(', '),
      'Min Value': Math.min(...seq.numbers),
      'Max Value': Math.max(...seq.numbers),
      'Average': (seq.numbers.reduce((a, b) => a + b, 0) / seq.numbers.length).toFixed(2),
    }))

    if (exportFormat === 'excel') {
      try {
        // Convert data to worksheet
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sequences')

        // Style the headers (first row)
        const headers = Object.keys(data[0])
        const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
        
        // Set column widths
        worksheet['!cols'] = headers.map((header) => {
          const maxLength = Math.max(
            header.length,
            ...data.map((row) => String(row[header as keyof typeof row]).length)
          )
          return { wch: maxLength + 2 } // Add padding
        })

        // Add cell styles for headers
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
          const address = XLSX.utils.encode_col(C) + '1'
          if (!worksheet[address]) continue
          worksheet[address].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "EFEFEF" } },
            alignment: { horizontal: 'center' }
          }
        }

        // Write the file
        const fileName = getFileName('excel', selectedOnly)
        XLSX.writeFile(workbook, fileName, {
          bookType: 'xlsx',
          bookSST: false,
          type: 'binary'
        })

        addToast(
          `Successfully exported ${sequencesToExport.length} sequences as ${exportFormat.toUpperCase()}`
        )
      } catch (error) {
        console.error('Error exporting to Excel:', error)
        addToast('Failed to export as Excel. Please try again.', 'error')
      }
    } else {
      try {
        const headers = Object.keys(data[0])
        const csvContent = [
          headers,
          ...data.map(row => headers.map(header => row[header as keyof typeof row]))
        ]
          .map(row => row.join(','))
          .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = getFileName('csv', selectedOnly)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        addToast(
          `Successfully exported ${sequencesToExport.length} sequences as ${exportFormat.toUpperCase()}`
        )
      } catch (error) {
        console.error('Error exporting to CSV:', error)
        addToast('Failed to export as CSV. Please try again.', 'error')
      }
    }
  }

  const handleAnalyze = (sequence: number[]) => {
    setSelectedSequence(sequence)
    setAnalysisOpen(true)
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const validateAndSetFilters = (newFilters: typeof filters, isDateTo = false) => {
    if (isDateTo && newFilters.dateFrom && newFilters.dateTo) {
      const fromDate = parseISO(newFilters.dateFrom)
      const toDate = parseISO(newFilters.dateTo)

      if (isBefore(toDate, fromDate)) {
        setErrorMessage('End date cannot be before start date')
        setErrorDialogOpen(true)
        return false
      }
    }

    // Always update the filters first
    setFilters(newFilters)

    // Only validate if both dates are set
    if (newFilters.dateFrom && newFilters.dateTo) {
      const fromDate = parseISO(newFilters.dateFrom)
      const toDate = parseISO(newFilters.dateTo)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Check if "from" date is after tomorrow
      if (isAfter(fromDate, tomorrow)) {
        setErrorMessage('Start date cannot be later than tomorrow')
        setErrorDialogOpen(true)
        return false
      }

      // Check if "to" date is after tomorrow
      if (isAfter(toDate, tomorrow)) {
        setErrorMessage('End date cannot be later than tomorrow')
        setErrorDialogOpen(true)
        return false
      }
    }

    return true
  }

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, dateFrom: e.target.value }
    validateAndSetFilters(newFilters, false)
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, dateTo: e.target.value }
    if (!validateAndSetFilters(newFilters, true)) {
      // Reset the date if validation fails
      setFilters(prev => ({ ...prev, dateTo: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Delete Sequences"
        description={`Are you sure you want to delete ${selectedSequences.size} sequence${
          selectedSequences.size === 1 ? '' : 's'
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sequence History</h1>
        <div className="flex items-center gap-4">
          {selectedSequences.size > 0 && (
            <>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => exportData(true, 'csv')}
                  className="flex items-center gap-2 rounded-l-md border-r border-green-700 bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:border-green-400 dark:hover:bg-green-500"
                  title="Export as CSV"
                >
                  <FileText className="h-4 w-4" />
                  CSV
                </button>
                <button
                  onClick={() => exportData(true, 'excel')}
                  className="flex items-center gap-2 rounded-r-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:hover:bg-green-500"
                  title="Export as Excel"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </button>
              </div>
              <button
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:hover:bg-red-500"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedSequences.size})
              </button>
            </>
          )}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => exportData(false, 'csv')}
              disabled={sequences.length === 0}
              className="flex items-center gap-2 rounded-l-md border-r border-blue-700 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:border-blue-400 dark:hover:bg-blue-500"
              title="Export all as CSV"
            >
              <FileText className="h-4 w-4" />
              CSV
            </button>
            <button
              onClick={() => exportData(false, 'excel')}
              disabled={sequences.length === 0}
              className="flex items-center gap-2 rounded-r-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:hover:bg-blue-500"
              title="Export all as Excel"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h2>
          {(filters.dateFrom || filters.dateTo || filters.sequenceLength) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-md bg-gray-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={handleDateFromChange}
              max={getTomorrowDate()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={handleDateToChange}
              min={filters.dateFrom || undefined}
              max={getTomorrowDate()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sequence Length
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={filters.sequenceLength}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sequenceLength: e.target.value,
                }))
              }
              placeholder="Any length"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400"></div>
        </div>
      ) : sequences.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="w-8 px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSequences.size === sequences.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('date')}
                    className="group cursor-pointer px-6 py-3 text-left"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Date
                      {getSortIcon('date')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('length')}
                    className="group cursor-pointer px-6 py-3 text-left"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Length
                      {getSortIcon('length')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Sequence
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSort('min')}
                          className="group flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                          title="Sort by minimum value"
                        >
                          Min {getSortIcon('min')}
                        </button>
                        <button
                          onClick={() => handleSort('max')}
                          className="group flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                          title="Sort by maximum value"
                        >
                          Max {getSortIcon('max')}
                        </button>
                        <button
                          onClick={() => handleSort('average')}
                          className="group flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                          title="Sort by average value"
                        >
                          Avg {getSortIcon('average')}
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {sortSequences(sequences).map((sequence) => (
                  <tr key={sequence._id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="w-8 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSequences.has(sequence._id)}
                        onChange={() => toggleSelect(sequence._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(sequence.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {sequence.metadata.sequenceLength}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <SequenceDisplay sequence={sequence.numbers} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAnalyze(sequence.numbers)}
                          className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <ChartBar className="h-4 w-4" />
                          Analyze
                        </button>
                        <button
                          onClick={() => handleDelete(sequence._id)}
                          disabled={deleting === sequence._id}
                          className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {sequences.length > 0 && (
                <>
                  Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
                  {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
                  {pagination.total} sequences
                </>
              )}
            </div>
            <div className="space-x-2">
              {Array.from({ length: Math.max(0, pagination.pages) }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    pagination.current === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No sequences found. Try adjusting your filters or generate some sequences first.
        </p>
      )}
      <AnalysisDialog
        isOpen={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        sequence={selectedSequence}
      />
      <ErrorDialog
        isOpen={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        title="Invalid Date Selection"
        message={errorMessage}
      />
    </div>
  )
}
