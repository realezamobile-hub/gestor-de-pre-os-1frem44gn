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
  ChevronDown,
  UserPlus,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface SidebarProps {
  mode?: 'desktop' | 'mobile'
}

export function Sidebar({ mode = 'desktop' }: SidebarProps) {
  const location = useLocation()
  const { currentUser, logout } = useAuthStore()
  const isDesktop = mode === 'desktop'
  const [isCadastroOpen, setIsCadastroOpen] = useState(true)

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const hasModule = (module: string) => {
    if (currentUser?.isSuperAdmin || currentUser?.role === 'ADMIN') return true
    return currentUser?.activeModules?.includes(module) ?? false
  }

  const mainItems = [
    {
      label: 'Melhor Preço',
      icon: LayoutDashboard,
      path: '/',
      visible: hasModule('melhor_preco'),
    },
    {
      label: 'Leads',
      icon: MessageSquare,
      path: '/leads',
      visible: hasModule('leads'),
    },
    {
      label: 'Gerador de Lista',
      icon: ListChecks,
      path: '/generator',
      visible: hasModule('generator'),
    },
    {
      label: 'Avaliação Técnica',
      icon: ClipboardCheck,
      path: '/evaluation',
      visible: hasModule('evaluation'),
    },
  ]

  const cadastroItems = [
    {
      label: 'Clientes',
      icon: Users,
      path: '/clients',
      visible: hasModule('cadastro'),
    },
    {
      label: 'Usuários',
      icon: UserPlus,
      path: '/users',
      visible: hasModule('cadastro'),
    },
  ]

  const bottomItems = [
    {
      label: 'Relatórios',
      icon: BarChart3,
      path: '/reports',
      visible: hasModule('reports'),
    },
    {
      label: 'Configurações',
      icon: Settings,
      path: '/admin',
      visible: hasModule('admin'),
    },
  ]

  const cadastroVisible = cadastroItems.some((item) => item.visible)

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out z-40 overflow-hidden',
        isDesktop
          ? 'hidden md:flex fixed left-0 top-0 h-screen w-20 hover:w-64 group'
          : 'w-full h-full',
      )}
    >
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 h-[70px] whitespace-nowrap">
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
          <img
            src="/favicon.ico"
            alt="RMcell Logo"
            className="w-full h-full object-contain rounded"
          />
        </div>
        <span
          className={cn(
            'font-bold text-lg tracking-tight transition-opacity duration-300',
            isDesktop ? 'opacity-0 group-hover:opacity-100' : 'opacity-100',
          )}
        >
          RMcell
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {mainItems
          .filter((item) => item.visible)
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={cn(
                  'transition-opacity duration-300',
                  isDesktop
                    ? 'opacity-0 group-hover:opacity-100'
                    : 'opacity-100',
                )}
              >
                {item.label}
              </span>
            </Link>
          ))}

        {cadastroVisible && (
          <Collapsible
            open={isCadastroOpen}
            onOpenChange={setIsCadastroOpen}
            className="space-y-1"
          >
            <CollapsibleTrigger
              className={cn(
                'flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap text-slate-400 hover:text-slate-100 hover:bg-slate-800',
                isDesktop && 'justify-start',
              )}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 flex-shrink-0" />
                <span
                  className={cn(
                    'transition-opacity duration-300',
                    isDesktop
                      ? 'opacity-0 group-hover:opacity-100'
                      : 'opacity-100',
                  )}
                >
                  Cadastro
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isCadastroOpen ? '' : '-rotate-90',
                  isDesktop && 'opacity-0 group-hover:opacity-100',
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {cadastroItems
                .filter((item) => item.visible)
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 pl-11 pr-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                      isActive(item.path)
                        ? 'text-primary'
                        : 'text-slate-500 hover:text-slate-200',
                      isDesktop && !isCadastroOpen && 'hidden',
                    )}
                  >
                    <span
                      className={cn(
                        'transition-opacity duration-300',
                        isDesktop
                          ? 'opacity-0 group-hover:opacity-100'
                          : 'opacity-100',
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {bottomItems
          .filter((item) => item.visible)
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={cn(
                  'transition-opacity duration-300',
                  isDesktop
                    ? 'opacity-0 group-hover:opacity-100'
                    : 'opacity-100',
                )}
              >
                {item.label}
              </span>
            </Link>
          ))}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50 whitespace-nowrap">
        <Link
          to="/profile"
          className="flex items-center gap-3 mb-4 px-2 py-2 hover:bg-slate-800 rounded-md transition-colors group/profile"
        >
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 flex-shrink-0 group-hover/profile:border-slate-600 overflow-hidden">
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
          <div
            className={cn(
              'flex-1 min-w-0 transition-opacity duration-300',
              isDesktop ? 'opacity-0 group-hover:opacity-100' : 'opacity-100',
            )}
          >
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
          className={cn(
            'w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20 px-2',
            isDesktop ? 'group-hover:px-4' : 'px-4',
          )}
          onClick={() => logout()}
        >
          <LogOut className="w-5 h-5 mr-2 flex-shrink-0" />
          <span
            className={cn(
              'transition-opacity duration-300',
              isDesktop ? 'opacity-0 group-hover:opacity-100' : 'opacity-100',
            )}
          >
            Sair
          </span>
        </Button>
      </div>
    </aside>
  )
}
