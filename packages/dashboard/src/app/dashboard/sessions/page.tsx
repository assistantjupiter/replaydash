import { SessionList } from '@/components/SessionList'

export default function SessionsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sessions
        </h1>
        <p className="text-gray-600">
          View and replay user sessions
        </p>
      </div>

      <SessionList />
    </div>
  )
}
