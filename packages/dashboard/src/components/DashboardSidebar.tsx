'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Play, 
  Key, 
  BarChart3, 
  Settings, 
  CreditCard,
  FileText,
  Activity
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sessions', href: '/dashboard/sessions', icon: Play },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Activity Log', href: '/dashboard/activity', icon: Activity },
  { name: 'Documentation', href: '/dashboard/docs', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-700">
        <img 
          src="/logo-full.png" 
          alt="ReplayDash" 
          className="h-6"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Account Info */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
            M
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Medina
            </p>
            <p className="text-xs text-gray-400">
              Free Plan
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
