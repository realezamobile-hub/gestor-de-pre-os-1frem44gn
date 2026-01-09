import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'
import { useAuthStore } from '@/stores/useAuthStore'
import { useInactivity } from '@/hooks/use-inactivity'

export default function DashboardLayout() {
  const { currentUser } = useAuthStore()
  const location = useLocation()

  // Initialize inactivity monitor
  useInactivity()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (currentUser.status === 'pending') {
    return <Navigate to="/pending" replace />
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
