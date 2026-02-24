'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Script from 'next/script'

export default function ReplayDashInit() {
  const { user } = useUser()

  useEffect(() => {
    // Only track when explicitly enabled (set NEXT_PUBLIC_ENABLE_REPLAYDASH=true)
    if (process.env.NEXT_PUBLIC_ENABLE_REPLAYDASH !== 'true') {
      return
    }

    // Generate or get session ID FIRST (before any tracking)
    let sessionId = localStorage.getItem('replaydash-session-id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('replaydash-session-id', sessionId)
    }

    console.log('🎬 ReplayDash self-tracking initialized for:', user?.primaryEmailAddress?.emailAddress || 'anonymous')
    console.log('📝 Session ID:', sessionId)
    
    // Basic event tracking - sends page views and user info to our own API
    const trackPageView = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'dev-secret-key-change-in-production'
      
      const now = Date.now()
      
      try {
        const response = await fetch(`${apiUrl}/api/v1/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
          },
          body: JSON.stringify({
            sessionId: sessionId,
            userId: user?.id,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: now,
            events: [{
              type: 'page_view',
              timestamp: now,
              data: {
                pathname: window.location.pathname,
              }
            }]
          })
        })
        
        const result = await response.json()
        if (result.excluded) {
          console.log('🚫 Path excluded from tracking:', window.location.pathname)
        } else {
          console.log('✅ Tracked page view:', window.location.pathname)
        }
      } catch (error) {
        console.error('❌ ReplayDash tracking error:', error)
      }
    }

    // Track initial page view
    trackPageView()

    // Track navigation
    const handleRouteChange = () => trackPageView()
    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [user])

  return null
}
