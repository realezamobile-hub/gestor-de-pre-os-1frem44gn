import { Lead } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ban, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface LeadsTableProps {
  leads: Lead[]
  onActionClick: (lead: Lead) => void
  onBlockClick: (lead: Lead) => void
}

export function LeadsTable({
  leads,
  onActionClick,
  onBlockClick,
}: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-md border border-dashed">
        <p className="text-muted-foreground">Nenhum lead encontrado.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead>Cliente</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead className="w-[40%]">Mensagem</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Atendido Por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-slate-50">
              <TableCell className="font-medium">{lead.nome_contato}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {lead.numero_contato}
              </TableCell>
              <TableCell>
                <div
                  className="max-w-[400px] text-sm text-slate-700 break-words line-clamp-2"
                  title={lead.mensagem_cliente}
                >
                  {lead.mensagem_cliente}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    lead.status_atendimento?.toLowerCase() === 'pendente'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }
                >
                  <span className="capitalize">
                    {lead.status_atendimento?.toLowerCase()}
                  </span>
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(lead.data_recebimento), 'dd/MM/yyyy HH:mm', {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {lead.atendido_por ? (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    <span>{lead.atendido_por}</span>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant={
                            lead.status_atendimento?.toLowerCase() ===
                            'pendente'
                              ? 'default'
                              : 'secondary'
                          }
                          className={cn(
                            'h-8 w-8 p-0',
                            lead.status_atendimento?.toLowerCase() ===
                              'pendente' &&
                              'bg-green-600 hover:bg-green-700 text-white',
                          )}
                          onClick={() => onActionClick(lead)}
                        >
                          <img
                            src={
                              lead.status_atendimento?.toLowerCase() ===
                              'pendente'
                                ? 'https://img.usecurling.com/i?q=whatsapp&color=white&shape=fill'
                                : 'https://img.usecurling.com/i?q=whatsapp&color=green&shape=fill'
                            }
                            alt="WhatsApp"
                            className="w-4 h-4"
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {lead.status_atendimento?.toLowerCase() === 'pendente'
                            ? 'Atender no WhatsApp'
                            : 'Abrir Conversa'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onBlockClick(lead)}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bloquear Contato</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
