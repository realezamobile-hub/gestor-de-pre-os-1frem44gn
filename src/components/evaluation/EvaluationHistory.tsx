import { useEffect } from 'react'
import { useEvaluationStore } from '@/stores/useEvaluationStore'
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
import { Badge } from '@/components/ui/badge'

export function EvaluationHistory() {
  const { evaluations, fetchEvaluations, isLoading } = useEvaluationStore()

  useEffect(() => {
    fetchEvaluations()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Serial</TableHead>
            <TableHead className="text-right">Valor Final</TableHead>
            <TableHead className="text-center">Arquivos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                Nenhuma avaliação registrada.
              </TableCell>
            </TableRow>
          ) : (
            evaluations.map((ev) => (
              <TableRow key={ev.id}>
                <TableCell>
                  {format(new Date(ev.created_at), 'dd/MM/yyyy HH:mm', {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  {ev.nome_cliente || 'N/A'}
                  <div className="text-xs text-muted-foreground">
                    {ev.cpf_cliente}
                  </div>
                </TableCell>
                <TableCell>{ev.modelo}</TableCell>
                <TableCell className="font-mono text-xs">
                  {ev.serial_number}
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-600">
                  R${' '}
                  {ev.valor_final?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    {ev.url_print_seguranca && (
                      <Badge variant="outline" className="text-[10px]">
                        Print
                      </Badge>
                    )}
                    {ev.url_foto_documento && (
                      <Badge variant="outline" className="text-[10px]">
                        Doc
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
