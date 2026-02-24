'use client'

import { useState } from 'react'
import { Key, Copy, Trash2, Plus, Eye, EyeOff, Check } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
  type: 'frontend' | 'backend'
  excludedPaths: string[]
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production Frontend',
      key: 'rd_pub_live_1234567890abcdef',
      created: '2026-02-20',
      lastUsed: '2 hours ago',
      type: 'frontend',
      excludedPaths: ['/dashboard', '/admin/*']
    },
    {
      id: '2',
      name: 'Development',
      key: 'rd_pub_test_abcdef1234567890',
      created: '2026-02-15',
      lastUsed: '5 minutes ago',
      type: 'frontend',
      excludedPaths: []
    }
  ])
  
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyType, setNewKeyType] = useState<'frontend' | 'backend'>('frontend')
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [newPath, setNewPath] = useState<Record<string, string>>({})

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const deleteKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(keys => keys.filter(k => k.id !== id))
    }
  }

  const createApiKey = () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key')
      return
    }

    const newKey: ApiKey = {
      id: String(Date.now()),
      name: newKeyName,
      key: `rd_pub_${newKeyType === 'frontend' ? 'live' : 'secret'}_${Math.random().toString(36).substring(2, 18)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      type: newKeyType,
      excludedPaths: []
    }

    setApiKeys([...apiKeys, newKey])
    setNewKeyName('')
    setShowCreateModal(false)
  }

  const toggleExpanded = (id: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const addExcludedPath = (keyId: string) => {
    const path = newPath[keyId]?.trim()
    if (!path) return

    setApiKeys(keys => keys.map(k => 
      k.id === keyId 
        ? { ...k, excludedPaths: [...k.excludedPaths, path] }
        : k
    ))
    setNewPath(prev => ({ ...prev, [keyId]: '' }))
  }

  const removeExcludedPath = (keyId: string, pathIndex: number) => {
    setApiKeys(keys => keys.map(k => 
      k.id === keyId
        ? { ...k, excludedPaths: k.excludedPaths.filter((_, i) => i !== pathIndex) }
        : k
    ))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            API Keys
          </h1>
          <p className="text-gray-600">
            Manage your ReplayDash API keys for frontend and backend integration
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Create API Key
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🔑 API Key Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-gray-900 mb-1">Frontend Keys (Public)</p>
            <p className="text-sm text-gray-600">
              Use in your client-side code. Safe to expose in browser. Prefix: <code className="bg-white px-2 py-0.5 rounded text-xs">rd_pub_live_*</code>
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">Backend Keys (Secret)</p>
            <p className="text-sm text-gray-600">
              Use server-side only. Never expose in client code. Prefix: <code className="bg-white px-2 py-0.5 rounded text-xs">rd_sec_*</code>
            </p>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {apiKeys.length === 0 ? (
            <div className="p-12 text-center">
              <Key className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No API Keys Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first API key to start integrating ReplayDash
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                Create API Key
              </button>
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {apiKey.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        apiKey.type === 'frontend' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {apiKey.type === 'frontend' ? '🌐 Frontend' : '🔒 Backend'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Created: {apiKey.created}</span>
                      <span>•</span>
                      <span>Last used: {apiKey.lastUsed}</span>
                    </div>
                  </div>
                </div>

                {/* API Key Display */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-gray-900 px-4 py-3 rounded-xl">
                    <code className="flex-1 text-sm font-mono text-white truncate">
                      {visibleKeys.has(apiKey.id) 
                        ? apiKey.key 
                        : '•'.repeat(apiKey.key.length)
                      }
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                    className={`p-3 rounded-xl transition-all ${
                      copiedKey === apiKey.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title="Copy to clipboard"
                  >
                    {copiedKey === apiKey.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => deleteKey(apiKey.id)}
                    className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                    title="Delete key"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Excluded Paths Section */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <button
                    onClick={() => toggleExpanded(apiKey.id)}
                    className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span>🚫 Excluded Paths {apiKey.excludedPaths.length > 0 && `(${apiKey.excludedPaths.length})`}</span>
                    <span className="text-xs text-gray-500">
                      {expandedKeys.has(apiKey.id) ? '▲' : '▼'}
                    </span>
                  </button>

                  {expandedKeys.has(apiKey.id) && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-600 mb-2">
                        Paths matching these patterns won&apos;t be recorded. Use <code className="bg-gray-100 px-1 rounded">*</code> for wildcards.
                      </p>

                      {/* Existing excluded paths */}
                      {apiKey.excludedPaths.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {apiKey.excludedPaths.map((path, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <code className="flex-1 text-sm text-gray-700">{path}</code>
                              <button
                                onClick={() => removeExcludedPath(apiKey.id, index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new path */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPath[apiKey.id] || ''}
                          onChange={(e) => setNewPath(prev => ({ ...prev, [apiKey.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && addExcludedPath(apiKey.id)}
                          placeholder="/dashboard or /admin/*"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => addExcludedPath(apiKey.id)}
                          disabled={!newPath[apiKey.id]?.trim()}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 font-medium rounded-lg text-sm transition-all"
                        >
                          Add
                        </button>
                      </div>

                      {/* Examples */}
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">Examples:</p>
                        <ul className="text-xs text-blue-700 space-y-0.5">
                          <li><code className="bg-blue-100 px-1 rounded">/dashboard</code> - Exact match</li>
                          <li><code className="bg-blue-100 px-1 rounded">/admin/*</code> - All admin pages</li>
                          <li><code className="bg-blue-100 px-1 rounded">/api/*/internal</code> - Wildcard in middle</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create New API Key
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Production Frontend"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNewKeyType('frontend')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      newKeyType === 'frontend'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold mb-1">🌐 Frontend</p>
                    <p className="text-xs text-gray-600">Public key</p>
                  </button>
                  <button
                    onClick={() => setNewKeyType('backend')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      newKeyType === 'backend'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold mb-1">🔒 Backend</p>
                    <p className="text-xs text-gray-600">Secret key</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createApiKey}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
