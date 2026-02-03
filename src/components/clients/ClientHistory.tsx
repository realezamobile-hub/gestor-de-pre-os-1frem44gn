import { useEffect, useState } from 'react'
import { useClientStore } from '@/stores/useClientStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Smartphone } from 'lucide-react'

interface ClientHistoryProps {
  clientId: string
}

export function ClientHistory({ clientId }: ClientHistoryProps) {
  const { fetchClientEvaluations } = useClientStore()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await fetchClientEvaluations(clientId)
      setHistory(data)
      setLoading(false)
    }
    load()
  }, [clientId])

  if (loading)
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Carregando histórico...
      </div>
    )

  if (history.length === 0)
    return (
      <div className="p-8 text-center border rounded-lg bg-gray-50 text-muted-foreground">
        Nenhuma avaliação registrada para este cliente.
      </div>
    )

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Data</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Serial</TableHead>
            <TableHead className="text-right">Valor Final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-muted-foreground">
                {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className="font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-400" />
                {item.modelo}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {item.serial_number}
              </TableCell>
              <TableCell className="text-right font-bold text-emerald-600">
                R${' '}
                {item.valor_final?.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
