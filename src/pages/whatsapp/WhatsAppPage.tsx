import { useEffect } from 'react'
import { useWhatsAppStore } from '@/stores/useWhatsAppStore'
import { ChatSidebar } from '@/components/whatsapp/ChatSidebar'
import { ChatWindow } from '@/components/whatsapp/ChatWindow'
import { WhatsAppConnect } from '@/components/whatsapp/WhatsAppConnect'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus } from 'lucide-react'
import { toast } from 'sonner'

export default function WhatsAppPage() {
  const { isConnected, simulateIncomingMessage, disconnect } =
    useWhatsAppStore()

  // For Demo Purposes: Simulate incoming message periodically
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isConnected) {
      timeout = setTimeout(() => {
        simulateIncomingMessage()
        toast('Nova mensagem recebida', {
          description: 'Cliente João Silva enviou uma mensagem.',
        })
      }, 30000)
    }
    return () => clearTimeout(timeout)
  }, [isConnected, simulateIncomingMessage])

  if (!isConnected) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="p-6 pb-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Módulo WhatsApp
          </h1>
          <p className="text-muted-foreground mt-1">
            Conecte a conta da empresa para iniciar o atendimento centralizado.
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <WhatsAppConnect />
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-100 rounded-lg border shadow-sm my-1 mx-1 lg:mx-0 lg:my-0 lg:h-full lg:rounded-none lg:border-none lg:shadow-none">
      <div className="h-full flex overflow-hidden">
        <ChatSidebar />
        <ChatWindow />
      </div>

      {/* Debug Controls - Floating */}
      <div className="fixed bottom-4 left-24 z-50 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={simulateIncomingMessage}
          className="shadow-lg bg-white/90 backdrop-blur border text-xs h-7"
        >
          <MessageSquarePlus className="w-3 h-3 mr-1.5 text-blue-500" />
          Simular msg (+1)
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={disconnect}
          className="shadow-lg bg-white/90 backdrop-blur border text-xs h-7 hover:bg-red-50 hover:text-red-600"
        >
          Desconectar
        </Button>
      </div>
    </div>
  )
}
