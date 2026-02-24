'use client'

import { useEffect, useState } from 'react'

interface CursorPosition {
  x: number
  y: number
  timestamp: number
}

export function CursorTracker() {
  const [positions, setPositions] = useState<CursorPosition[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      }

      setPositions(prev => {
        const updated = [...prev, newPosition]
        // Keep only last 15 positions for trail effect
        return updated.slice(-15)
      })

      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const cleanup = () => {
      const now = Date.now()
      setPositions(prev => prev.filter(pos => now - pos.timestamp < 1000))
      animationFrameId = requestAnimationFrame(cleanup)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    animationFrameId = requestAnimationFrame(cleanup)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  if (!isVisible || positions.length === 0) return null

  const currentPosition = positions[positions.length - 1]

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Subtle cursor trail dots - much simpler */}
      {positions.slice(-8).map((pos, index) => {
        const age = positions.length - index
        const opacity = Math.max(0, 1 - age / 10)
        const scale = Math.max(0.5, 1 - age / 15)

        return (
          <div
            key={`${pos.timestamp}-${index}`}
            className="absolute w-1.5 h-1.5 bg-red-500 rounded-full"
            style={{
              left: pos.x,
              top: pos.y,
              opacity: opacity * 0.3,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          />
        )
      })}

      {/* Clean recording badge */}
      <div
        className="absolute transition-all duration-75 ease-out"
        style={{
          left: currentPosition.x,
          top: currentPosition.y,
          transform: 'translate(10px, 10px)', // Offset from cursor
        }}
      >
        <div className="flex items-center gap-1.5 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow-lg border border-white">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="font-medium">Recording</span>
        </div>
      </div>
    </div>
  )
}
