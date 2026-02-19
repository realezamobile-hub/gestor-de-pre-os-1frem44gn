import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import DashboardLayout from './components/DashboardLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage'
import PendingApprovalPage from './pages/auth/PendingApprovalPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ListGeneratorPage from './pages/generator/ListGeneratorPage'
import AdminPage from './pages/admin/AdminPage'
import EvaluationPage from './pages/evaluation/EvaluationPage'
import ProfilePage from './pages/profile/ProfilePage'
import ClientsPage from './pages/clients/ClientsPage'
import ReportsPage from './pages/reports/ReportsPage'
import UsersPage from './pages/users/UsersPage'
import LeadsPage from './pages/leads/LeadsPage'
import NotFound from './pages/NotFound'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

const App = () => {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <BrowserRouter
      future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/auth/update-password"
            element={<UpdatePasswordPage />}
          />
          <Route path="/pending" element={<PendingApprovalPage />} />

          {/* Protected Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/generator" element={<ListGeneratorPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  )
}

export default App
