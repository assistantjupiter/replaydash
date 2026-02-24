'use client'

import { useParams } from 'next/navigation'
import { SessionReplayPlayer } from '@/components/SessionReplayPlayer'
import Link from 'next/link'

export default function SessionDetailPage() {
  const params = useParams()
  const sessionId = params.id as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">📹</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ReplayDash
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/sessions"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Sessions
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Session Replay
            </h1>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 inline-block">
            <span className="text-gray-600 text-sm font-medium">Session ID: </span>
            <code className="text-sm font-mono text-gray-900 font-semibold">{sessionId}</code>
          </div>
        </div>

        <SessionReplayPlayer sessionId={sessionId} />
      </div>
    </div>
  )
}
