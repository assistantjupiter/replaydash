'use client'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  animationSpeed?: number
}

export function GradientText({ 
  children, 
  className = '',
  animationSpeed = 3
}: GradientTextProps) {
  return (
    <span className={`inline-block bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}
