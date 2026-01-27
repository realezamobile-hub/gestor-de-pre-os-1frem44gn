import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { useState } from 'react'

export function Sidebar() {
  const location = useLocation()

  // Use specific selectors to prevent unnecessary re-renders when other parts of the store (like users list) change
  const currentUser = useAuthStore((state) => state.currentUser)
  const currentCompany = useAuthStore((state) => state.currentCompany)
  const logout = useAuthStore((state) => state.logout)

  const [open, setOpen] = useState(false)

  // Check module availability from company config
  const modules = currentCompany?.modulos_ativos || []

  // Robust check: User has module if company has it OR if user is Super Admin (explicit bypass)
  const hasModule = (module: string) =>
    modules.includes(module) || currentUser?.isSuperAdmin

  // Check Role Access
  const isSuperAdmin = currentUser?.isSuperAdmin
  const isAdmin = currentUser?.role === 'ADMIN' || isSuperAdmin
  const isVendedor = currentUser?.role === 'VENDEDOR'
  const isTecnico = currentUser?.role === 'TECNICO'
  const isAdministrativo = currentUser?.role === 'ADMINISTRATIVO'

  // Define visibility logic for each link
  const links = [
    {
      href: '/',
      label: 'Painel',
      icon: LayoutDashboard,
      isVisible: true, // Everyone sees Dashboard
    },
    {
      href: '/generator',
      label: 'Gerador',
      icon: FileText,
      // Visible if module active AND user has permission (Admin, Vendedor, Administrativo)
      isVisible:
        hasModule('generator') &&
        (isAdmin ||
          isVendedor ||
          isAdministrativo ||
          currentUser?.canCreateList),
    },
    {
      href: '/evaluation',
      label: 'Avaliação',
      icon: ClipboardCheck,
      // Visible if module active AND user has permission (Admin, Tecnico)
      // Super Admin bypass ensures this is true if hasModule('evaluation') returns true (which it does for super admin)
      isVisible:
        hasModule('evaluation') &&
        (isAdmin || isTecnico || currentUser?.canAccessEvaluation),
    },
    {
      href: '/admin',
      label: 'Admin',
      icon: Settings,
      // Visible if user is Admin or SuperAdmin
      isVisible: isAdmin,
    },
  ]

  const filteredLinks = links.filter((link) => link.isVisible)

  const NavContent = ({ fullWidth = true }: { fullWidth?: boolean }) => (
    <div className="flex flex-col h-full py-4">
      <div
        className={cn(
          'px-4 mb-6 transition-all duration-300',
          !fullWidth && 'px-2 text-center',
        )}
      >
        <h1
          className={cn(
            'font-bold text-primary tracking-tight transition-all',
            fullWidth ? 'text-xl' : 'text-xs scale-90',
          )}
        >
          {fullWidth ? (
            currentCompany?.nome_fantasia || 'PriceApp'
          ) : (
            <span title={currentCompany?.nome_fantasia || 'PriceApp'}>PA</span>
          )}
        </h1>
        {fullWidth && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {currentCompany?.razao_social || 'Gestão'}
          </p>
        )}
      </div>

      <nav className={cn('flex-1 space-y-2', fullWidth ? 'px-3' : 'px-2')}>
        {filteredLinks.map((link) => {
          const isActive = location.pathname === link.href
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group/link relative',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                !fullWidth && 'justify-center px-0',
              )}
              title={!fullWidth ? link.label : undefined}
            >
              <link.icon
                className={cn('w-5 h-5 shrink-0', !fullWidth && 'w-6 h-6')}
              />
              <span
                className={cn(
                  'transition-all duration-300 overflow-hidden whitespace-nowrap',
                  !fullWidth && 'w-0 opacity-0 hidden',
                )}
              >
                {link.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className={cn('mt-auto', fullWidth ? 'px-3' : 'px-2')}>
        <Button
          variant="ghost"
          className={cn(
            'w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all',
            fullWidth ? 'justify-start' : 'justify-center px-0',
          )}
          onClick={() => logout()}
          title={!fullWidth ? 'Sair' : undefined}
        >
          <LogOut className={cn('w-5 h-5', fullWidth && 'mr-2')} />
          {fullWidth && 'Sair'}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Slim/Expandable Sidebar */}
      <aside className="hidden md:flex flex-col border-r bg-sidebar h-screen sticky top-0 z-50 transition-all duration-300 w-16 hover:w-56 group shadow-lg hover:shadow-xl overflow-hidden">
        <div className="w-56 flex flex-col h-full">
          <div className="flex flex-col h-full py-4">
            <div className="px-5 mb-8 flex items-center gap-3 whitespace-nowrap">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="font-bold text-primary">
                  {currentCompany?.nome_fantasia?.charAt(0) || 'P'}
                </span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                <h1 className="font-bold text-lg truncate w-32">
                  {currentCompany?.nome_fantasia || 'PriceApp'}
                </h1>
              </div>
            </div>

            <nav className="flex-1 px-3 space-y-1">
              {filteredLinks.map((link) => {
                const isActive = location.pathname === link.href
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <link.icon className="w-5 h-5 shrink-0" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      {link.label}
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className="px-3 mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 whitespace-nowrap px-3"
                onClick={() => logout()}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  Sair
                </span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 bg-background/80 backdrop-blur-sm shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent fullWidth={true} />
            <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
