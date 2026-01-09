import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FileText, Settings, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuthStore'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'

export function Sidebar() {
  const location = useLocation()
  const { currentUser, logout } = useAuthStore()
  const [open, setOpen] = useState(false)

  const links = [
    {
      href: '/',
      label: 'Painel de Preços',
      icon: LayoutDashboard,
      roles: ['admin', 'user'],
    },
    {
      href: '/generator',
      label: 'Gerador de Lista',
      icon: FileText,
      roles: ['admin', 'user'],
    },
    {
      href: '/admin',
      label: 'Administração',
      icon: Settings,
      roles: ['admin'],
    },
  ]

  const filteredLinks = links.filter((link) =>
    link.roles.includes(currentUser?.role || ''),
  )

  const NavContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-primary tracking-tight">
          PriceApp
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Gestão de Revenda</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {filteredLinks.map((link) => {
          const isActive = location.pathname === link.href
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => logout()}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
