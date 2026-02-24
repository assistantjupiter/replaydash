'use client'

import { useState, useMemo } from 'react'

export interface NetworkRequestData {
  method: string
  url: string
  status?: number
  statusText?: string
  requestHeaders?: Record<string, string>
  requestBody?: any
  responseHeaders?: Record<string, string>
  responseBody?: any
  error?: string
  duration?: number
}

export interface NetworkRequest {
  id: string
  type: string
  timestamp: number
  data: NetworkRequestData
}

interface NetworkViewerProps {
  requests: NetworkRequest[]
}

export function NetworkViewer({ requests }: NetworkViewerProps) {
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null)
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'headers' | 'request' | 'response'>('headers')

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        // Method filter
        if (filterMethod !== 'all' && req.data.method !== filterMethod) return false

        // Status filter
        if (filterStatus === 'success' && (req.data.status! < 200 || req.data.status! >= 300)) return false
        if (filterStatus === 'error' && (req.data.status! >= 200 && req.data.status! < 400)) return false
        if (filterStatus === 'failed' && req.data.status !== 0) return false

        // Search query
        if (searchQuery && !req.data.url.toLowerCase().includes(searchQuery.toLowerCase())) return false

        return true
      })
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [requests, filterMethod, filterStatus, searchQuery])

  // Get unique methods
  const methods = useMemo(() => {
    return Array.from(new Set(requests.map((r) => r.data.method)))
  }, [requests])

  const getStatusColor = (status?: number) => {
    if (!status || status === 0) return 'text-red-600 bg-red-100'
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100'
    if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-100'
    if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'text-blue-600 bg-blue-100',
      POST: 'text-green-600 bg-green-100',
      PUT: 'text-orange-600 bg-orange-100',
      PATCH: 'text-purple-600 bg-purple-100',
      DELETE: 'text-red-600 bg-red-100',
    }
    return colors[method] || 'text-gray-600 bg-gray-100'
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const renderJson = (data: any) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      return (
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs font-mono max-h-96">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )
    } catch (e) {
      return (
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs font-mono max-h-96">
          {typeof data === 'string' ? data : JSON.stringify(data)}
        </pre>
      )
    }
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-200">
        <div className="text-6xl mb-4">🌐</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No network requests captured</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Network requests will appear here when the SDK captures them. Make sure{' '}
          <code className="px-2 py-1 bg-gray-100 rounded">captureNetwork</code> is enabled.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Network Requests</h2>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-white rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">Total: </span>
              <span className="font-bold text-gray-900">{requests.length}</span>
            </div>
            <div className="px-3 py-1 bg-white rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">Filtered: </span>
              <span className="font-bold text-gray-900">{filteredRequests.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Methods</option>
            {methods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success (2xx)</option>
            <option value="error">Error (4xx-5xx)</option>
            <option value="failed">Failed (Network)</option>
          </select>
        </div>
      </div>

      {/* Split View */}
      <div className="flex" style={{ height: '600px' }}>
        {/* Request List */}
        <div className="w-1/2 border-r border-gray-200 overflow-auto">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              onClick={() => setSelectedRequest(request)}
              className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                selectedRequest?.id === request.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getMethodColor(request.data.method)}`}>
                    {request.data.method}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(request.data.status)}`}>
                    {request.data.status || 'FAILED'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDuration(request.data.duration)}</span>
              </div>
              <div className="text-sm font-medium text-gray-900 truncate mb-1">{request.data.url}</div>
              <div className="text-xs text-gray-500">
                {new Date(request.timestamp).toLocaleTimeString()}
              </div>
              {request.data.error && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  {request.data.error}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Request Details */}
        <div className="w-1/2 overflow-auto">
          {selectedRequest ? (
            <div className="p-6">
              {/* Request Summary */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-3 py-1 rounded font-bold ${getMethodColor(selectedRequest.data.method)}`}>
                    {selectedRequest.data.method}
                  </span>
                  <span className={`px-3 py-1 rounded font-bold ${getStatusColor(selectedRequest.data.status)}`}>
                    {selectedRequest.data.status || 'FAILED'} {selectedRequest.data.statusText || ''}
                  </span>
                </div>
                <div className="text-sm font-mono text-gray-700 break-all mb-3">{selectedRequest.data.url}</div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Duration:</span> {formatDuration(selectedRequest.data.duration)}
                  </div>
                  <div>
                    <span className="font-semibold">Time:</span>{' '}
                    {new Date(selectedRequest.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <div className="flex space-x-4">
                  {(['headers', 'request', 'response'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === 'headers' && (
                  <div className="space-y-4">
                    {selectedRequest.data.requestHeaders && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Request Headers</h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                          {Object.entries(selectedRequest.data.requestHeaders).map(([key, value]) => (
                            <div key={key} className="text-sm font-mono">
                              <span className="text-blue-600">{key}:</span>{' '}
                              <span className="text-gray-700">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedRequest.data.responseHeaders && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Response Headers</h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                          {Object.entries(selectedRequest.data.responseHeaders).map(([key, value]) => (
                            <div key={key} className="text-sm font-mono">
                              <span className="text-purple-600">{key}:</span>{' '}
                              <span className="text-gray-700">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'request' && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
                    {selectedRequest.data.requestBody ? (
                      renderJson(selectedRequest.data.requestBody)
                    ) : (
                      <div className="text-sm text-gray-500 italic">No request body</div>
                    )}
                  </div>
                )}

                {activeTab === 'response' && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Response Body</h4>
                    {selectedRequest.data.error ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        <div className="font-semibold mb-1">Error</div>
                        <div className="text-sm">{selectedRequest.data.error}</div>
                      </div>
                    ) : selectedRequest.data.responseBody ? (
                      renderJson(selectedRequest.data.responseBody)
                    ) : (
                      <div className="text-sm text-gray-500 italic">No response body</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">👈</div>
                <div>Select a request to view details</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
