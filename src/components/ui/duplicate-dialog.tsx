'use client'

import { useEffect, useRef } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface DuplicateDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  duplicates: Array<{ date: string; numbers: number[] }>
  newDrawsCount: number
}

export function DuplicateDialog({
  isOpen,
  onClose,
  title,
  message,
  duplicates,
  newDrawsCount
}: DuplicateDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
      document.body.classList.add('overflow-hidden')
    } else {
      dialog.close()
      document.body.classList.remove('overflow-hidden')
    }

    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-gray-950/50 backdrop:backdrop-blur-sm backdrop:animate-fadeIn open:flex bg-transparent"
    >
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 animate-dialogSlideIn">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>

        <div className="mt-4 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Duplicate Draws:
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-medium text-yellow-800 dark:text-yellow-200 py-2">Date</th>
                  <th className="text-left font-medium text-yellow-800 dark:text-yellow-200 py-2">Numbers</th>
                </tr>
              </thead>
              <tbody>
                {duplicates.map((_draw, _index) => (
                  <tr key={_draw.date} className="border-t border-yellow-200 dark:border-yellow-800">
                    <td className="py-2 text-yellow-800 dark:text-yellow-200">{_draw.date}</td>
                    <td className="py-2 text-yellow-800 dark:text-yellow-200 font-mono">
                      {_draw.numbers.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-green-600 dark:text-green-400">
          {newDrawsCount > 0 ? (
            <p>
              ✓ {newDrawsCount} new {newDrawsCount === 1 ? 'draw has' : 'draws have'} been imported successfully.
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </dialog>
  )
}
