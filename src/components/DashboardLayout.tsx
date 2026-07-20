import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { Sidebar } from '@/components/Sidebar'
import { TopHeader } from '@/components/TopHeader'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout() {
  const { currentUser, isLoading, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized || (isLoading && !currentUser)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const isAdmin = currentUser.isSuperAdmin || currentUser.role === 'ADMIN'

  if (currentUser.status === 'pending' && !isAdmin) {
    return <Navigate to="/pending" replace />
  }

  if (!currentUser.accessAllowed && !isAdmin) {
    return <Navigate to="/access-denied" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
