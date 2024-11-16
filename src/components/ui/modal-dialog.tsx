'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  children: React.ReactNode
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children
}: ModalDialogProps) {
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

  // Close when clicking on the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="backdrop:bg-gray-950/50 backdrop:backdrop-blur-sm backdrop:animate-fadeIn open:flex bg-transparent max-h-[90vh] w-full max-w-3xl p-0 overflow-hidden"
    >
      <div className="w-full rounded-lg bg-white dark:bg-gray-800 shadow-xl animate-dialogSlideIn flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content with scrolling */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </dialog>
  )
}
