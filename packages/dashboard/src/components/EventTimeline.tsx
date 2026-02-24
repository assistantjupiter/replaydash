'use client'

import { useEffect, useState } from 'react'
import { fetchSessionEvents } from '@/lib/api'

interface EventTimelineProps {
  sessionId: string
}

export function EventTimeline({ sessionId }: EventTimelineProps) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [sessionId])

  async function loadEvents() {
    try {
      setLoading(true)
      const data = await fetchSessionEvents(sessionId)
      setEvents(data.events)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Loading events...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-lg font-semibold">No events recorded</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const eventData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        const timestamp = new Date(Number(event.timestamp))
        
        return (
          <div
            key={event.id || index}
            className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {index + 1}
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-transparent mt-2"></div>
              )}
            </div>

            {/* Event details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {event.type}
                    </span>
                    {eventData.pathname && (
                      <code className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {eventData.pathname}
                      </code>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
                  {timestamp.toLocaleTimeString()}
                </div>
              </div>

              {/* Event data */}
              {eventData && Object.keys(eventData).length > 0 && (
                <details className="mt-2 group">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 font-medium">
                    📋 Event data
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto font-mono">
                    {JSON.stringify(eventData, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
