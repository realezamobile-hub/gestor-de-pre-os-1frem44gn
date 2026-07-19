import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'
import { useAuthStore } from '@/stores/useAuthStore'

export default function DashboardLayout() {
  const { currentUser, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (currentUser.status === 'pending') {
    return <Navigate to="/pending" replace />
  }

  if (currentUser.status === 'blocked') {
    return <Navigate to="/login" replace />
  }

  const isAdmin = currentUser.isSuperAdmin || currentUser.role === 'ADMIN'
  const isExpired =
    currentUser.accessExpiresAt &&
    new Date(currentUser.accessExpiresAt) < new Date()
  if (
    !isAdmin &&
    (!currentUser.accessAllowed ||
      currentUser.subscriptionStatus === 'expired' ||
      isExpired)
  ) {
    return <Navigate to="/access-denied" replace />
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:pl-20 transition-all duration-300">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
