import { SessionList } from '@/components/SessionList'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center group cursor-pointer">
              <img 
                src="/logo-full.webp" 
                alt="ReplayDash" 
                className="h-7 transform group-hover:scale-105 transition-transform duration-200"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Sessions
          </h1>
          <p className="text-gray-600">
            View and replay user sessions
          </p>
        </div>

        <SessionList />
      </div>
    </div>
  )
}
