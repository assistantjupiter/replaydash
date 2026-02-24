'use client'

import { useEffect, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react'

interface PageEvent {
  id: string
  type: string
  timestamp: number
  data: {
    pathname: string
    url?: string
  }
}

interface PageNavigationPlayerProps {
  events: PageEvent[]
  baseUrl?: string
}

export function PageNavigationPlayer({ events, baseUrl = 'http://192.168.4.73:3000' }: PageNavigationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [progress, setProgress] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const currentEvent = events[currentEventIndex]
  const eventData = currentEvent?.data 
    ? (typeof currentEvent.data === 'string' ? JSON.parse(currentEvent.data) : currentEvent.data)
    : null
  const currentUrl = eventData?.pathname ? `${baseUrl}${eventData.pathname}` : ''

  // Calculate timeline positions
  const startTime = events[0]?.timestamp || 0
  const endTime = events[events.length - 1]?.timestamp || startTime
  const totalDuration = endTime - startTime

  useEffect(() => {
    if (isPlaying && currentEventIndex < events.length - 1) {
      const currentEventTime = events[currentEventIndex].timestamp
      const nextEventTime = events[currentEventIndex + 1].timestamp
      const delay = (nextEventTime - currentEventTime) / playbackSpeed

      timeoutRef.current = setTimeout(() => {
        setCurrentEventIndex(prev => prev + 1)
      }, delay)

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    } else if (currentEventIndex >= events.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentEventIndex, events, playbackSpeed])

  useEffect(() => {
    if (currentEvent) {
      const elapsed = currentEvent.timestamp - startTime
      setProgress((elapsed / totalDuration) * 100)
    }
  }, [currentEvent, startTime, totalDuration])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleRestart = () => {
    setCurrentEventIndex(0)
    setIsPlaying(false)
  }

  const handlePrevious = () => {
    setCurrentEventIndex(Math.max(0, currentEventIndex - 1))
    setIsPlaying(false)
  }

  const handleNext = () => {
    setCurrentEventIndex(Math.min(events.length - 1, currentEventIndex + 1))
    setIsPlaying(false)
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const targetTime = startTime + (totalDuration * percentage)

    // Find closest event to target time
    let closestIndex = 0
    let closestDiff = Math.abs(events[0].timestamp - targetTime)

    events.forEach((event, index) => {
      const diff = Math.abs(event.timestamp - targetTime)
      if (diff < closestDiff) {
        closestDiff = diff
        closestIndex = index
      }
    })

    setCurrentEventIndex(closestIndex)
    setIsPlaying(false)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-lg font-semibold">No events to replay</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Player Frame */}
      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
        <div className="aspect-video relative bg-gray-800 flex items-center justify-center">
          <iframe
            key={currentEventIndex}
            src={currentUrl}
            className="w-full h-full"
            title="Session Replay"
            sandbox="allow-same-origin allow-scripts"
          />
          
          {/* Event Indicator Overlay */}
          <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-mono text-sm">
            Event {currentEventIndex + 1} / {events.length}
          </div>

          {/* Current Path Overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-sm px-4 py-2 rounded-lg">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Page:</span>
                <code className="text-sm font-mono">{eventData?.pathname || 'N/A'}</code>
              </div>
              <div className="text-xs text-gray-400">
                {currentEvent?.timestamp ? formatTime(currentEvent.timestamp) : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {/* Timeline Track */}
        <div
          className="relative h-12 bg-gray-200 rounded-full cursor-pointer mb-4 overflow-hidden"
          onClick={handleTimelineClick}
        >
          {/* Progress Bar */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />

          {/* Event Markers */}
          {events.map((event, index) => {
            const elapsed = event.timestamp - startTime
            const position = (elapsed / totalDuration) * 100
            const isActive = index === currentEventIndex
            const markerData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

            return (
              <div
                key={event.id || index}
                className="absolute top-1/2 -translate-y-1/2 group"
                style={{ left: `${position}%` }}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 border-white transition-all ${
                    isActive
                      ? 'bg-purple-600 scale-150 shadow-lg'
                      : 'bg-blue-500 hover:scale-125'
                  }`}
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {markerData?.pathname || 'Unknown'}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Playhead */}
          <div
            className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-300"
            style={{ left: `${progress}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-purple-600 shadow-lg" />
          </div>
        </div>

        {/* Duration Display */}
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>{formatDuration(currentEvent?.timestamp - startTime || 0)}</span>
          <span>{formatDuration(totalDuration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              title="Restart"
            >
              <RotateCcw className="h-5 w-5 text-gray-700" />
            </button>

            <button
              onClick={handlePrevious}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              title="Previous Event"
              disabled={currentEventIndex === 0}
            >
              <SkipBack className="h-5 w-5 text-gray-700" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white rounded-xl transition-all transform hover:scale-105"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" fill="white" />
              ) : (
                <Play className="h-6 w-6" fill="white" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              title="Next Event"
              disabled={currentEventIndex === events.length - 1}
            >
              <SkipForward className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Speed:</span>
            {[0.5, 1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  playbackSpeed === speed
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{events.length}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(totalDuration)}
            </div>
            <div className="text-sm text-gray-600">Session Duration</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(events.map(e => {
                const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
                return data?.pathname || ''
              })).size}
            </div>
            <div className="text-sm text-gray-600">Unique Pages</div>
          </div>
        </div>
      </div>
    </div>
  )
}
