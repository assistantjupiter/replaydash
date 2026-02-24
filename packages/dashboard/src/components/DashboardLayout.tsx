'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

interface NavItem {
  name: string
  href: string
  icon: string
  badge?: number
}

const navigation: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: '📊' },
  { name: 'Sessions', href: '/dashboard/sessions', icon: '🎬' },
  { name: 'Live', href: '/dashboard/live', icon: '🔴', badge: 3 },
  { name: 'Errors', href: '/dashboard/errors', icon: '⚠️', badge: 12 },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  { name: 'Heatmaps', href: '/dashboard/heatmaps', icon: '🔥' },
  { name: 'Funnels', href: '/dashboard/funnels', icon: '🎯' },
  { name: 'Users', href: '/dashboard/users', icon: '👥' },
  { name: 'Events', href: '/dashboard/events', icon: '⚡' },
  { name: 'Alerts', href: '/dashboard/alerts', icon: '🔔' },
]

const settings: NavItem[] = [
  { name: 'API Keys', href: '/dashboard/settings/api-keys', icon: '🔑' },
  { name: 'Team', href: '/dashboard/settings/team', icon: '👫' },
  { name: 'Integrations', href: '/dashboard/settings/integrations', icon: '🔌' },
  { name: 'Privacy', href: '/dashboard/settings/privacy', icon: '🔒' },
  { name: 'Billing', href: '/dashboard/settings/billing', icon: '💳' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <img src="/logo-full.png" alt="ReplayDash" className="h-6" />
          ) : (
            <img src="/logo-icon.png" alt="ReplayDash" className="h-8" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {/* Main nav */}
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                pathname === item.href
                  ? 'bg-red-50 text-red-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-4 border-t border-gray-200" />

          {/* Settings nav */}
          {settings.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                pathname === item.href
                  ? 'bg-red-50 text-red-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="flex-1">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search sessions, users, events..."
                className="w-96 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick actions */}
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="w-px h-6 bg-gray-200" />

            {/* User */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
