import { useState, useEffect } from 'react'
import { useWhatsAppStore } from '@/stores/useWhatsAppStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Search, Clock, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ChatSidebar() {
  const { conversations, activeConversationId, selectConversation } =
    useWhatsAppStore()
  const [search, setSearch] = useState('')
  const [now, setNow] = useState(Date.now())

  // Update "now" every 10 seconds to refresh SLA alerts
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredConversations = conversations.filter(
    (c) =>
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactNumber.includes(search),
  )

  const isSlaBreached = (timestamp: Date, sender: 'me' | 'other') => {
    if (sender === 'me') return false
    const diff = now - new Date(timestamp).getTime()
    return diff > 60000 // 60 seconds
  }

  return (
    <div className="w-full md:w-80 lg:w-96 border-r flex flex-col bg-white h-full">
      <div className="p-3 border-b bg-slate-50">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversa..."
            className="pl-8 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {filteredConversations.map((conversation) => {
            const lastMsg = conversation.lastMessage
            const slaBreached =
              lastMsg && isSlaBreached(lastMsg.timestamp, lastMsg.sender)

            return (
              <button
                key={conversation.id}
                onClick={() => selectConversation(conversation.id)}
                className={cn(
                  'flex items-start gap-3 p-3 text-left transition-colors border-b hover:bg-slate-50',
                  activeConversationId === conversation.id &&
                    'bg-slate-100 hover:bg-slate-100 border-l-4 border-l-emerald-600',
                )}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.avatarUrl} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                      {conversation.contactName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm truncate pr-2 text-slate-900">
                      {conversation.contactName}
                    </span>
                    {lastMsg && (
                      <span
                        className={cn(
                          'text-[10px] whitespace-nowrap',
                          slaBreached
                            ? 'text-red-600 font-bold'
                            : 'text-muted-foreground',
                        )}
                      >
                        {formatDistanceToNow(new Date(lastMsg.timestamp), {
                          addSuffix: false,
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground truncate max-w-[140px] lg:max-w-[180px]">
                      {lastMsg?.sender === 'me' && (
                        <span className="text-emerald-600 mr-1">Você:</span>
                      )}
                      {lastMsg?.text || 'Nova conversa'}
                    </p>

                    <div className="flex gap-1.5 items-center">
                      {slaBreached && (
                        <div
                          className="animate-pulse flex items-center"
                          title="Sem resposta há +1min"
                        >
                          <AlertCircle className="w-4 h-4 text-red-500 fill-red-100" />
                        </div>
                      )}

                      {conversation.unreadCount > 0 && (
                        <Badge className="h-5 min-w-5 px-1.5 flex items-center justify-center bg-emerald-600 hover:bg-emerald-600 rounded-full">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
