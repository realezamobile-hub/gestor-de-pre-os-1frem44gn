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
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function EvaluationHistory() {
  const { evaluations, fetchEvaluations } = useEvaluationStore()

  useEffect(() => {
    fetchEvaluations()
  }, [])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Serial</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Valor Final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Nenhuma avaliação registrada.
              </TableCell>
            </TableRow>
          ) : (
            evaluations.map((evalItem) => {
              const hasDefects =
                evalItem.descontos_aplicados &&
                evalItem.descontos_aplicados.length > 0
              return (
                <TableRow key={evalItem.id}>
                  <TableCell>
                    {format(new Date(evalItem.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {evalItem.modelo}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {evalItem.serial_number}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={hasDefects ? 'secondary' : 'default'}
                      className={
                        hasDefects
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {hasDefects
                        ? `${evalItem.descontos_aplicados.length} Defeito(s)`
                        : 'Perfeito'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-700">
                    R${' '}
                    {evalItem.valor_final.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
