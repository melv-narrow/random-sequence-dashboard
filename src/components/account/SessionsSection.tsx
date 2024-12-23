'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'

interface Session {
  _id: string
  deviceInfo: {
    userAgent: string
    ip: string
    lastActive: string
  }
  isValid: boolean
  createdAt: string
  expires: string
  updatedAt: string
}

export function SessionsSection() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/account/sessions')
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/account/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to revoke session')
      }

      // Refresh the sessions list
      await fetchSessions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session')
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return '📱'
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return '📱'
    } else {
      return '💻'
    }
  }

  const getDeviceName = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes('iphone')) return 'iPhone'
    if (ua.includes('ipad')) return 'iPad'
    if (ua.includes('android')) return 'Android Device'
    if (ua.includes('windows')) return 'Windows PC'
    if (ua.includes('mac')) return 'Mac'
    if (ua.includes('linux')) return 'Linux'
    return 'Unknown Device'
  }

  if (loading) {
    return <div className="text-center">Loading sessions...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-semibold">Active Sessions</h2>
        <button
          onClick={fetchSessions}
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((s) => (
          <div
            key={s._id}
            className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getDeviceIcon(s.deviceInfo.userAgent)}</span>
                  <span className="font-medium">
                    {getDeviceName(s.deviceInfo.userAgent)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-500">
                  <div>
                    <span className="inline-block w-20 font-medium">IP:</span>
                    {s.deviceInfo.ip}
                  </div>
                  <div>
                    <span className="inline-block w-20 font-medium">Last active:</span>
                    {format(new Date(s.deviceInfo.lastActive), 'PPp')}
                  </div>
                  <div>
                    <span className="inline-block w-20 font-medium">Created:</span>
                    {format(new Date(s.createdAt), 'PPp')}
                  </div>
                  <div>
                    <span className="inline-block w-20 font-medium">Expires:</span>
                    {format(new Date(s.expires), 'PPp')}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => revokeSession(s._id)}
                className="w-full md:w-auto px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
              >
                Revoke Session
              </button>
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No active sessions found
          </div>
        )}
      </div>
    </div>
  )
}
