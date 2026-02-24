'use client'

import { Activity, Play, Key, AlertTriangle, Settings, User } from 'lucide-react'

const activities = [
  {
    id: '1',
    type: 'session',
    icon: Play,
    title: 'New session recorded',
    description: 'session_1771945488750_fjzkorko3',
    timestamp: '2 minutes ago',
    color: 'blue'
  },
  {
    id: '2',
    type: 'error',
    icon: AlertTriangle,
    title: 'Error detected in session',
    description: 'TypeError: Cannot read property \'data\' of undefined',
    timestamp: '15 minutes ago',
    color: 'red'
  },
  {
    id: '3',
    type: 'api_key',
    icon: Key,
    title: 'API key created',
    description: 'Production Frontend (rd_pub_live_****)',
    timestamp: '1 hour ago',
    color: 'green'
  },
  {
    id: '4',
    type: 'session',
    icon: Play,
    title: 'Session replay viewed',
    description: 'session_1771945488817_556izcqbg',
    timestamp: '2 hours ago',
    color: 'blue'
  },
  {
    id: '5',
    type: 'settings',
    icon: Settings,
    title: 'Settings updated',
    description: 'Retention period changed to 30 days',
    timestamp: '5 hours ago',
    color: 'purple'
  },
  {
    id: '6',
    type: 'user',
    icon: User,
    title: 'Account login',
    description: 'From 192.168.4.73',
    timestamp: '8 hours ago',
    color: 'gray'
  }
]

const colorClasses = {
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-gray-100 text-gray-700'
}

export default function ActivityPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Activity Log
        </h1>
        <p className="text-gray-600">
          Track all events and actions in your account
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-medium rounded-xl">
            All Activity
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
            Sessions
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
            Errors
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
            API Keys
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
            Settings
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div 
                key={activity.id} 
                className="p-6 hover:bg-gray-50 transition-colors"
                style={{ 
                  animation: `fadeIn 0.3s ease-in ${index * 0.05}s backwards` 
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${colorClasses[activity.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 font-mono">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Load More */}
        <div className="p-6 bg-gray-50 text-center border-t border-gray-200">
          <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Load More Activity
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
