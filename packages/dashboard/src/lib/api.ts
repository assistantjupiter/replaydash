const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

export interface Session {
  id: string
  sessionId: string
  userId?: string
  userEmail?: string
  userAgent?: string
  url?: string
  browser?: string
  device?: string
  os?: string
  hasErrors?: boolean
  startedAt: string
  lastActive: string
  eventCount: number
}

export interface SessionEvent {
  id: string
  type: string
  timestamp: number
  data: any
}

export interface SessionEventsResponse {
  session: {
    id: string
    sessionId: string
    startedAt: string
    eventCount: number
  }
  events: SessionEvent[]
}

export interface SearchParams {
  q?: string
  browser?: string
  device?: string
  os?: string
  hasErrors?: boolean
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  sortBy?: 'startedAt' | 'lastActive' | 'eventCount'
  sortOrder?: 'asc' | 'desc'
}

export async function fetchSessions(limit = 50, offset = 0) {
  const response = await fetch(
    `${API_URL}/api/v1/sessions?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'X-API-Key': API_KEY,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch sessions')
  }

  return response.json() as Promise<{
    sessions: Session[]
    total: number
    limit: number
    offset: number
  }>
}

export async function searchSessions(params: SearchParams) {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value))
    }
  })

  const response = await fetch(
    `${API_URL}/api/v1/sessions/search?${queryParams.toString()}`,
    {
      headers: {
        'X-API-Key': API_KEY,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to search sessions')
  }

  return response.json() as Promise<{
    sessions: Session[]
    total: number
    limit: number
    offset: number
    query: SearchParams
  }>
}

export async function fetchSession(sessionId: string) {
  const response = await fetch(`${API_URL}/api/v1/sessions/${sessionId}`, {
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch session')
  }

  return response.json() as Promise<Session>
}

export async function fetchSessionEvents(sessionId: string) {
  const response = await fetch(`${API_URL}/api/v1/sessions/${sessionId}/events`, {
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch session events')
  }

  return response.json() as Promise<SessionEventsResponse>
}
