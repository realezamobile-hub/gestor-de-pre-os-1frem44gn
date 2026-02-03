import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  LayoutDashboard,
  ListChecks,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const location = useLocation()
  const { currentUser, logout } = useAuthStore()

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      visible: true,
    },
    {
      label: 'Gerador de Lista',
      icon: ListChecks,
      path: '/generator',
      visible: currentUser?.canCreateList || currentUser?.role === 'ADMIN',
    },
    {
      label: 'Avaliação Técnica',
      icon: ClipboardCheck,
      path: '/evaluation',
      visible:
        currentUser?.canAccessEvaluation ||
        currentUser?.role === 'TECNICO' ||
        currentUser?.role === 'ADMIN',
    },
    {
      label: 'Clientes',
      icon: Users,
      path: '/clients',
      visible: true,
    },
    {
      label: 'Relatórios',
      icon: BarChart3,
      path: '/reports',
      visible: currentUser?.role === 'ADMIN' || currentUser?.isSuperAdmin,
    },
    {
      label: 'Administração',
      icon: Settings,
      path: '/admin',
      visible: currentUser?.role === 'ADMIN' || currentUser?.isSuperAdmin,
    },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-slate-900 text-slate-100 h-screen transition-all">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white">
          P
        </div>
        <span className="font-bold text-lg tracking-tight">PriceApp</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems
          .filter((item) => item.visible)
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <Link
          to="/profile"
          className="flex items-center gap-3 mb-4 px-2 py-2 hover:bg-slate-800 rounded-md transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-600 overflow-hidden">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                className="w-full h-full object-cover"
                alt="Avatar"
              />
            ) : (
              <UserCircle className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">
              {currentUser?.name || 'Usuário'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {currentUser?.role === 'ADMIN' ? 'Administrador' : 'Vendedor'}
            </p>
          </div>
        </Link>

        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
