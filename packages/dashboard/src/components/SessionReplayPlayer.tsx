'use client'

import { useEffect, useRef, useState } from 'react'
import { fetchSessionEvents, SessionEvent } from '@/lib/api'
import { NetworkViewer, NetworkRequest } from './NetworkViewer'
import { EventTimeline } from './EventTimeline'
import { PageNavigationPlayer } from './PageNavigationPlayer'

interface SessionReplayPlayerProps {
  sessionId: string
}

export function SessionReplayPlayer({ sessionId }: SessionReplayPlayerProps) {
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<SessionEvent[]>([])
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([])
  const [activeTab, setActiveTab] = useState<'replay' | 'network' | 'console' | 'errors'>('replay')

  useEffect(() => {
    loadSessionEvents()
  }, [sessionId])

  useEffect(() => {
    if (events.length > 0 && playerContainerRef.current) {
      initializePlayer()
    }
  }, [events])

  async function loadSessionEvents() {
    try {
      setLoading(true)
      const data = await fetchSessionEvents(sessionId)
      
      // Store full response including events
      setSessionInfo({ ...data.session, events: data.events })
      
      // Filter only rrweb events
      const rrwebEvents = data.events
        .filter((e: any) => e.type === 'rrweb')
        .map((e: any) => e.data)
      
      setEvents(rrwebEvents)

      // Extract network requests
      const networkEvents = data.events
        .filter((e: any) => e.type === 'network')
        .map((e: any, index: number) => ({
          id: e.id || `network_${index}`,
          type: e.type,
          timestamp: e.timestamp,
          data: e.data,
        }))
      
      setNetworkRequests(networkEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  async function initializePlayer() {
    if (!playerContainerRef.current || events.length === 0) return

    try {
      // Dynamically import rrweb-player (client-side only)
      const rrwebPlayer = await import('rrweb-player')
      
      // Clear container
      playerContainerRef.current.innerHTML = ''

      // Initialize player
      new rrwebPlayer.default({
        target: playerContainerRef.current,
        props: {
          events,
          width: 1024,
          height: 768,
          autoPlay: false,
        },
      })
    } catch (err) {
      console.error('Failed to initialize player:', err)
      setError('Failed to initialize replay player')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-200">
        <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <div className="text-gray-600 font-medium text-lg">Loading session replay...</div>
        <div className="text-gray-400 text-sm mt-2">Fetching {sessionId.substring(0, 16)}...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 border-2 border-red-200">
        <div className="flex items-start space-x-4">
          <div className="text-5xl">⚠️</div>
          <div>
            <h3 className="text-2xl font-bold text-red-900 mb-2">Error loading replay</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadSessionEvents}
              className="px-4 py-2 bg-white border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If no rrweb events, check if we have page_view events for navigation replay
  if (events.length === 0) {
    // Check if we have page_view events
    const pageViewEvents = sessionInfo?.events?.filter((e: any) => e.type === 'page_view') || []

    if (pageViewEvents.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-200">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No replay data found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            This session doesn&apos;t have any replay data yet. Make sure the SDK is properly configured.
          </p>
        </div>
      )
    }

    // We have page_view events - show navigation replay player
    return (
      <div className="space-y-6">
        {/* Session Info Card */}
        {sessionInfo && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  📊
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Events Captured</div>
                  <div className="text-2xl font-bold text-gray-900">{sessionInfo.eventCount || pageViewEvents.length}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  ⏱️
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Session Started</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date(sessionInfo.startedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  🎬
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Page Views</div>
                  <div className="text-2xl font-bold text-gray-900">{pageViewEvents.length}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  🗺️
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Unique Pages</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {new Set(pageViewEvents.map((e: any) => e.data?.pathname || '')).size}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Navigation Player */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🎬 Page Navigation Replay</h3>
            <p className="text-gray-600">
              Watch the user&apos;s journey through your app. For full DOM session replay, integrate the rrweb SDK.
            </p>
          </div>
          <PageNavigationPlayer events={pageViewEvents} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Info Card */}
      {sessionInfo && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                📊
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Events Captured</div>
                <div className="text-2xl font-bold text-gray-900">{sessionInfo.eventCount}</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                ⏱️
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Session Started</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(sessionInfo.startedAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                🎬
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Replay Events</div>
                <div className="text-2xl font-bold text-gray-900">{events.length}</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                🌐
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Network Requests</div>
                <div className="text-2xl font-bold text-gray-900">{networkRequests.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-1">
            {[
              { id: 'replay', label: 'Session Replay', icon: '🎬' },
              { id: 'network', label: 'Network', icon: '🌐', count: networkRequests.length },
              { id: 'console', label: 'Console', icon: '💬', disabled: true },
              { id: 'errors', label: 'Errors', icon: '⚠️', disabled: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                disabled={tab.disabled}
                className={`px-6 py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : tab.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'replay' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Session Recording</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">Recording</span>
                </div>
              </div>
              <div ref={playerContainerRef} className="w-full rounded-xl overflow-hidden bg-gray-50" />
            </div>
          )}

          {activeTab === 'network' && <NetworkViewer requests={networkRequests} />}

          {activeTab === 'console' && (
            <div className="text-center py-16 text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <div className="text-lg font-semibold mb-2">Console logs coming soon</div>
              <div className="text-sm">Console capture is not yet implemented</div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="text-center py-16 text-gray-500">
              <div className="text-6xl mb-4">⚠️</div>
              <div className="text-lg font-semibold mb-2">Error tracking coming soon</div>
              <div className="text-sm">Error viewer is not yet implemented</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
