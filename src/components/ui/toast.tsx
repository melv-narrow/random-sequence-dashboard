'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      // Wait for exit animation to complete
      setTimeout(onClose, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${
          type === 'success'
            ? 'bg-green-500 text-white dark:bg-green-600'
            : 'bg-red-500 text-white dark:bg-red-600'
        }
        fixed right-4 top-4 z-50 rounded-md px-6 py-4 shadow-lg animate-toastSlideIn`}
    >
      <div className="flex items-center space-x-2">
        <span>{message}</span>
        <button
          onClick={() => {
            setIsExiting(true)
            setTimeout(onClose, 300)
          }}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

const toastState = {
  toasts: [] as Toast[],
  listeners: new Set<() => void>(),
  addToast(message: string, type: 'success' | 'error' = 'success') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    this.toasts.push({ id, message, type })
    this.notifyListeners()
  },
  removeToast(id: number) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notifyListeners()
  },
  notifyListeners() {
    this.listeners.forEach(listener => listener())
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const updateToasts = () => setToasts([...toastState.toasts])
    toastState.listeners.add(updateToasts)
    return () => {
      toastState.listeners.delete(updateToasts)
    }
  }, [])

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => toastState.removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export function useToast() {
  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    toastState.addToast(message, type)
  }

  return { addToast, ToastContainer }
}
