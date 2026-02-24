'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { searchSessions, Session, SearchParams } from '@/lib/api'
import { formatDistanceToNow, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { Trash2, Download, RefreshCw } from 'lucide-react'

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [browser, setBrowser] = useState('')
  const [device, setDevice] = useState('')
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)

  // New features state
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | null>(null)

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: SearchParams = {
        q: debouncedSearchQuery || undefined,
        browser: browser || undefined,
        device: device || undefined,
        hasErrors: hasErrors,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: pageSize,
        offset: currentPage * pageSize,
        sortBy: 'lastActive',
        sortOrder: 'desc',
      }

      const data = await searchSessions(params)
      setSessions(data.sessions)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchQuery, browser, device, hasErrors, startDate, endDate, currentPage, pageSize])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadSessions()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, loadSessions])

  const handleClearFilters = () => {
    setSearchQuery('')
    setBrowser('')
    setDevice('')
    setHasErrors(undefined)
    setStartDate('')
    setEndDate('')
    setCurrentPage(0)
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''
      
      await fetch(`${apiUrl}/api/v1/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': apiKey,
        },
      })

      // Remove from local state
      setSessions(sessions.filter(s => s.sessionId !== sessionId))
      setTotal(total - 1)
      setDeleteConfirm(null)
    } catch (error) {
      alert('Failed to delete session')
    }
  }

  const handleExportSessions = () => {
    if (!exportFormat) return

    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(sessions, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `replaydash-sessions-${new Date().toISOString()}.json`
      link.click()
    } else if (exportFormat === 'csv') {
      const headers = ['Session ID', 'User', 'Browser', 'Device', 'URL', 'Events', 'Has Errors', 'Started At', 'Last Active']
      const rows = sessions.map(s => [
        s.sessionId,
        s.userEmail || s.userId || 'Anonymous',
        s.browser || '',
        s.device || '',
        s.url || '',
        s.eventCount.toString(),
        s.hasErrors ? 'Yes' : 'No',
        s.startedAt,
        s.lastActive,
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const dataBlob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `replaydash-sessions-${new Date().toISOString()}.csv`
      link.click()
    }

    setExportFormat(null)
  }

  const formatSessionDuration = (session: Session) => {
    const start = new Date(session.startedAt)
    const end = new Date(session.lastActive)
    const diffMinutes = differenceInMinutes(end, start)
    const diffSeconds = differenceInSeconds(end, start)

    if (diffMinutes > 0) {
      return `${diffMinutes}m`
    } else {
      return `${diffSeconds}s`
    }
  }

  const hasActiveFilters = !!(
    searchQuery ||
    browser ||
    device ||
    hasErrors !== undefined ||
    startDate ||
    endDate
  )

  const totalPages = Math.ceil(total / pageSize)

  if (loading && sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
        <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-600 font-medium">Loading sessions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error loading sessions</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search sessions... (session ID, user, URL, browser, console logs, errors)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(0)
              }}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Browser Filter */}
            <select
              value={browser}
              onChange={(e) => {
                setBrowser(e.target.value)
                setCurrentPage(0)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Browsers</option>
              <option value="chrome">Chrome</option>
              <option value="firefox">Firefox</option>
              <option value="safari">Safari</option>
              <option value="edge">Edge</option>
            </select>

            {/* Device Filter */}
            <select
              value={device}
              onChange={(e) => {
                setDevice(e.target.value)
                setCurrentPage(0)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>

            {/* Error Filter */}
            <select
              value={hasErrors === undefined ? '' : hasErrors ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value
                setHasErrors(value === '' ? undefined : value === 'true')
                setCurrentPage(0)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Sessions</option>
              <option value="true">With Errors</option>
              <option value="false">No Errors</option>
            </select>

            {/* Start Date */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setCurrentPage(0)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Start date"
            />

            {/* End Date */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setCurrentPage(0)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="End date"
            />
          </div>

          {/* Active Filters & Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {hasActiveFilters && 'Found '}
                <span className="font-semibold text-gray-900">{total}</span> session{total !== 1 ? 's' : ''}
              </div>

              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  autoRefresh
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={autoRefresh ? 'Auto-refresh enabled (30s)' : 'Auto-refresh disabled'}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Export dropdown */}
              <div className="relative">
                <button
                  onClick={() => setExportFormat(exportFormat ? null : 'json')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  disabled={sessions.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                {exportFormat && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        setExportFormat('json')
                        handleExportSessions()
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => {
                        setExportFormat('csv')
                        handleExportSessions()
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg transition-colors"
                    >
                      Export as CSV
                    </button>
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">
            {hasActiveFilters ? '🔍' : '📹'}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {hasActiveFilters ? 'No sessions found' : 'No sessions yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {hasActiveFilters
              ? 'Try adjusting your search criteria or filters.'
              : 'Sessions will appear here once you integrate the ReplayDash SDK into your application.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Clear Filters
            </button>
          ) : (
            <a
              href="#docs"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              View Integration Docs →
            </a>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Session ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Browser / Device
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sessions.map((session, index) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            session.hasErrors
                              ? 'bg-red-500 animate-pulse'
                              : 'bg-green-500 animate-pulse'
                          }`}
                        ></div>
                        <span className="text-sm font-mono text-gray-900 font-medium">
                          {session.sessionId.substring(0, 16)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {session.userEmail || session.userId ? (
                          <>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {(session.userEmail || session.userId || 'U')[0].toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-900 font-medium">
                              {session.userEmail || session.userId}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Anonymous</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {session.browser || 'Unknown'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {session.device || session.os || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm text-gray-600 truncate group-hover:text-blue-600 transition-colors">
                        {session.url || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          session.hasErrors
                            ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700'
                            : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                        }`}
                      >
                        {session.eventCount} events
                        {session.hasErrors && ' ⚠️'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatSessionDuration(session)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/sessions/${session.sessionId}`}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm font-semibold"
                        >
                          View Replay →
                        </Link>
                        {deleteConfirm === session.sessionId ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteSession(session.sessionId)}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-semibold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(session.sessionId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {currentPage * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min((currentPage + 1) * pageSize, total)}
                </span>{' '}
                of <span className="font-semibold text-gray-900">{total}</span> sessions
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center px-3 text-sm text-gray-600">
                  Page {currentPage + 1} of {totalPages || 1}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
