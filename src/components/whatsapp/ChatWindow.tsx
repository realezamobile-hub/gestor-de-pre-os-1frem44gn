import { useState, useRef, useEffect } from 'react'
import { useWhatsAppStore } from '@/stores/useWhatsAppStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Search,
  UserCircle,
  CheckCheck,
  Clock,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export function ChatWindow() {
  const {
    activeConversationId,
    conversations,
    messages,
    sendMessage,
    isConnected,
  } = useWhatsAppStore()
  const { currentUser } = useAuthStore()
  const [inputText, setInputText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  )
  const activeMessages = activeConversationId
    ? messages[activeConversationId] || []
    : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages, activeConversationId])

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim() || !activeConversationId || !currentUser) return

    sendMessage(inputText, currentUser.name)
    setInputText('')
  }

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 flex-col gap-4 text-center p-8">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
          <UserCircle className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-800">
            Nenhuma conversa selecionada
          </h3>
          <p className="text-slate-500 mt-1">
            Selecione um contato para iniciar o atendimento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] h-full relative">
      {/* Header */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Avatar className="cursor-pointer">
            <AvatarImage src={activeConversation.avatarUrl} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700">
              {activeConversation.contactName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-800 leading-tight">
              {activeConversation.contactName}
            </h3>
            <p className="text-xs text-slate-500">
              {activeConversation.contactNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        className="flex-1 p-4 bg-opacity-10"
        style={{
          backgroundImage:
            'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)',
          backgroundRepeat: 'repeat',
        }}
      >
        <div className="flex flex-col gap-3 min-h-full justify-end pb-2">
          {activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'max-w-[80%] rounded-lg p-2.5 px-3 relative shadow-sm text-sm leading-relaxed',
                msg.sender === 'me'
                  ? 'self-end bg-[#d9fdd3] rounded-tr-none'
                  : 'self-start bg-white rounded-tl-none',
              )}
            >
              {/* Agent Attribution Legend */}
              {msg.agentName && msg.sender === 'me' && (
                <div className="text-[10px] font-bold text-emerald-700 mb-1 opacity-80 uppercase tracking-wider">
                  {msg.agentName}
                </div>
              )}

              <div className="whitespace-pre-wrap text-slate-900">
                {msg.text.split('\n\nAttended by:')[0]}
              </div>

              <div className="flex items-center justify-end gap-1 mt-1 select-none">
                <span className="text-[10px] text-slate-500">
                  {format(new Date(msg.timestamp), 'HH:mm')}
                </span>
                {msg.sender === 'me' &&
                  (msg.status === 'read' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                  ))}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-[#f0f2f5] p-3 px-4 shrink-0 flex gap-3 items-end">
        <form
          className="flex-1 flex gap-3 items-end bg-white rounded-lg border shadow-sm p-1 pl-3"
          onSubmit={handleSend}
        >
          <Input
            className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent px-0 py-3 min-h-[44px] max-h-32"
            placeholder="Digite uma mensagem..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="pb-1 pr-1">
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all"
              disabled={!inputText.trim()}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
