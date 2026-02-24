'use client'

import { useEffect, useRef } from 'react'

interface StarBorderProps {
  children: React.ReactNode
  className?: string
  speed?: number
  starDensity?: number
}

export function StarBorder({ 
  children, 
  className = '',
  speed = 3,
  starDensity = 80
}: StarBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    container.appendChild(canvas)

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    updateCanvasSize()

    const stars: Array<{
      x: number
      y: number
      size: number
      progress: number
      speed: number
    }> = []

    // Create stars along the perimeter
    const perimeter = (canvas.width + canvas.height) * 2
    const numStars = Math.floor(perimeter / starDensity)

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: 0,
        y: 0,
        size: Math.random() * 2 + 1,
        progress: Math.random(),
        speed: (Math.random() * 0.5 + 0.5) * speed
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach(star => {
        // Update progress
        star.progress += star.speed * 0.001
        if (star.progress > 1) star.progress = 0

        // Calculate position along perimeter
        const totalPerimeter = (canvas.width + canvas.height) * 2
        const distance = star.progress * totalPerimeter

        if (distance < canvas.width) {
          // Top edge
          star.x = distance
          star.y = 0
        } else if (distance < canvas.width + canvas.height) {
          // Right edge
          star.x = canvas.width
          star.y = distance - canvas.width
        } else if (distance < canvas.width * 2 + canvas.height) {
          // Bottom edge
          star.x = canvas.width - (distance - canvas.width - canvas.height)
          star.y = canvas.height
        } else {
          // Left edge
          star.x = 0
          star.y = canvas.height - (distance - canvas.width * 2 - canvas.height)
        }

        // Draw star with glow
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 3
        )
        gradient.addColorStop(0, 'rgba(239, 68, 68, 1)') // red-500
        gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.5)')
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Draw bright center
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    const resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      canvas.remove()
    }
  }, [speed, starDensity])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
    </div>
  )
}
