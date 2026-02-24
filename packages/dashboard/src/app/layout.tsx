import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'ReplayDash - Session Replay & Event Tracking',
  description: 'Debug production issues 10x faster with session replay and event tracking',
  icons: {
    icon: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
