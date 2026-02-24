'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { useState } from 'react'

export default function APIKeysPage() {
  const [keys, setKeys] = useState([
    { id: '1', name: 'Production', key: 'rd_live_xxxxxxxxxxxxxxxxxxxxxxxx', created: '2024-01-15', lastUsed: '2 hours ago', requests: '1.2M' },
    { id: '2', name: 'Staging', key: 'rd_test_xxxxxxxxxxxxxxxxxxxxxxxx', created: '2024-02-01', lastUsed: '5 minutes ago', requests: '340K' },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
            <p className="text-gray-600 mt-1">Manage your ReplayDash API keys</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            + Create New Key
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-900">Keep your API keys secure</p>
            <p className="text-sm text-amber-700 mt-1">Never share your secret keys in publicly accessible areas such as GitHub, client-side code, etc.</p>
          </div>
        </div>

        {/* API Keys List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{key.name}</span>
                        {key.name === 'Production' && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                            Live
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">{key.key}</code>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          onClick={() => navigator.clipboard.writeText(key.key)}
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{key.created}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{key.lastUsed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{key.requests}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                          Rotate
                        </button>
                        <button className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">1. Install the SDK</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <code className="text-sm text-green-400 font-mono">npm install @replaydash/sdk</code>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">2. Initialize in your app</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-green-400 font-mono">{`import ReplayDash from '@replaydash/sdk'

ReplayDash.init({
  apiKey: 'your-api-key-here',
  // Optional configuration
  maskAllInputs: true,
  blockClass: 'rd-block',
})`}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">3. That's it! 🎉</h3>
              <p className="text-sm text-gray-600">ReplayDash will automatically start recording sessions. View them in the Sessions tab.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New API Key</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Production, Staging, Development"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>Production</option>
                  <option>Staging</option>
                  <option>Development</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  Create Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
