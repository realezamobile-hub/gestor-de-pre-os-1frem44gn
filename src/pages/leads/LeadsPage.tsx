import { useEffect, useState } from 'react'
import { useLeadStore } from '@/stores/useLeadStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { LeadsTable } from '@/components/leads/LeadsTable'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, RefreshCw, MessageSquare } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Lead } from '@/types'
import { useDebounce } from '@/hooks/use-debounce'

export default function LeadsPage() {
  const {
    fetchLeads,
    getProcessedLeads,
    markAsHandled,
    addToBlacklist,
    setFilterStatus,
    setSearchTerm,
    isLoading,
  } = useLeadStore()

  const { currentUser } = useAuthStore()

  const [localSearch, setLocalSearch] = useState('')
  const debouncedSearch = useDebounce(localSearch, 300)
  const [leadToBlock, setLeadToBlock] = useState<Lead | null>(null)

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(fetchLeads, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setSearchTerm(debouncedSearch)
  }, [debouncedSearch])

  const handleActionClick = async (lead: Lead) => {
    if (lead.link_acao) {
      window.open(lead.link_acao, '_blank')
    }

    if (
      lead.status_atendimento?.toLowerCase() === 'pendente' &&
      currentUser?.name
    ) {
      await markAsHandled(lead, currentUser.name)
    }
  }

  const handleBlockConfirm = async () => {
    if (leadToBlock) {
      await addToBlacklist(leadToBlock.nome_contato)
      setLeadToBlock(null)
    }
  }

  const leads = getProcessedLeads()

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            Gestão de Leads
          </h1>
          <p className="text-muted-foreground">
            Acompanhe e responda às mensagens recebidas via campanha.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchLeads()}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          Atualizar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, telefone ou mensagem..."
            className="pl-8"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select
            defaultValue="pendente"
            onValueChange={(val) => setFilterStatus(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="atendido">Atendidos</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <LeadsTable
          leads={leads}
          onActionClick={handleActionClick}
          onBlockClick={setLeadToBlock}
        />
      </div>

      <AlertDialog
        open={!!leadToBlock}
        onOpenChange={(open) => !open && setLeadToBlock(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquear Contato?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja bloquear{' '}
              <strong>{leadToBlock?.nome_contato}</strong>?
              <br />
              Mensagens futuras deste contato não serão mais exibidas na lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirmar Bloqueio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
