'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, AlertTriangle, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react'

interface DashboardStats {
  totalSessions: number
  sessionsToday: number
  sessionsChange: number
  errorSessions: number
  errorRate: number
  avgSessionLength: number
  activeUsers: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock stats for now - you can fetch from API later
    setTimeout(() => {
      setStats({
        totalSessions: 25,
        sessionsToday: 8,
        sessionsChange: 12.5,
        errorSessions: 7,
        errorRate: 28,
        avgSessionLength: 245,
        activeUsers: 12
      })
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Monitor your session replay analytics and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Sessions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Play className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              {stats!.sessionsChange >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-medium">+{stats!.sessionsChange}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 font-medium">{stats!.sessionsChange}%</span>
                </>
              )}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats!.totalSessions}
          </h3>
          <p className="text-sm text-gray-600">
            Total Sessions
          </p>
        </div>

        {/* Sessions Today */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats!.sessionsToday}
          </h3>
          <p className="text-sm text-gray-600">
            Sessions Today
          </p>
        </div>

        {/* Error Rate */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats!.errorRate}%
          </h3>
          <p className="text-sm text-gray-600">
            Error Rate ({stats!.errorSessions} sessions)
          </p>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats!.activeUsers}
          </h3>
          <p className="text-sm text-gray-600">
            Active Users
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>
            <Link 
              href="/dashboard/sessions"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    session_{Date.now() + i}...
                  </p>
                  <p className="text-xs text-gray-500">
                    {i} minute{i !== 1 ? 's' : ''} ago
                  </p>
                </div>
                <Link
                  href={`/dashboard/sessions/session_${Date.now() + i}`}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Account Usage */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Account Usage</h2>
            <Link 
              href="/dashboard/billing"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Upgrade →
            </Link>
          </div>
          <div className="space-y-4">
            {/* Sessions Quota */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Sessions</span>
                <span className="font-medium text-gray-900">25 / 100</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                  style={{ width: '25%' }}
                ></div>
              </div>
            </div>

            {/* API Requests */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">API Requests</span>
                <span className="font-medium text-gray-900">1.2K / 10K</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                  style={{ width: '12%' }}
                ></div>
              </div>
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium text-gray-900">45 MB / 1 GB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                  style={{ width: '4.5%' }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                ⭐ You're on the <span className="font-semibold text-gray-900">Free Plan</span>
              </p>
              <Link
                href="/dashboard/billing"
                className="block w-full px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-center text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">API</p>
              <p className="text-xs text-gray-500">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Recording</p>
              <p className="text-xs text-gray-500">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Replay</p>
              <p className="text-xs text-gray-500">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
