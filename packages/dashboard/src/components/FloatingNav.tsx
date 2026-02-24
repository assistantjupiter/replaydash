'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GradientText } from './GradientText'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'

export function FloatingNav() {
  const [isVisible, setIsVisible] = useState(false)
  const { isSignedIn } = useUser()

  useEffect(() => {
    const handleScroll = () => {
      // Show floating nav after scrolling 200px
      setIsVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <nav className="bg-white/90 backdrop-blur-lg border border-gray-200 rounded-full shadow-lg px-6 py-3">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/logo-full.png" 
              alt="ReplayDash" 
              className="h-6"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Nav links */}
          <div className="flex items-center gap-4 text-sm">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Pricing
            </a>
            <a
              href="#docs"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Docs
            </a>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* CTA */}
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/sessions"
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all text-sm font-medium hover:shadow-md hover:scale-105"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <SignUpButton mode="modal">
              <button className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all text-sm font-medium hover:shadow-md hover:scale-105">
                Sign Up
              </button>
            </SignUpButton>
          )}
        </div>
      </nav>
    </div>
  )
}
