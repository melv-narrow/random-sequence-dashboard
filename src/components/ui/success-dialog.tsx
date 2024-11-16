'use client'

import { useEffect, useRef } from 'react'
import { X, CheckCircle } from 'lucide-react'

interface SuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
}

export function SuccessDialog({
  isOpen,
  onClose,
  title,
  message
}: SuccessDialogProps) {
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
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 animate-dialogSlideIn">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
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

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </dialog>
  )
}
