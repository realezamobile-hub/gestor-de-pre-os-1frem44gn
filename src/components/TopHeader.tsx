import { useAuthStore } from '@/stores/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

export function TopHeader() {
  const { currentUser } = useAuthStore()

  if (!currentUser) return null

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-end gap-4 sticky top-0 z-40 w-full">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mr-4">
        <Clock className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sessão monitorada</span>
      </div>

      <div className="flex items-center gap-3 pl-4 border-l">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-none">{currentUser.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentUser.email}
          </p>
        </div>
        <Avatar className="h-9 w-9 border cursor-pointer hover:ring-2 ring-primary transition-all">
          <AvatarImage
            src={`https://img.usecurling.com/ppl/thumbnail?seed=${currentUser.id}`}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1.5 hidden sm:flex"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </Badge>
      </div>
    </header>
  )
}
