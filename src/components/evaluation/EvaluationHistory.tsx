import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search } from 'lucide-react'

export function EvaluationHistory() {
  const { evaluations, fetchEvaluations, isLoading } = useEvaluationStore()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEvaluations()
  }, [])

  const filteredEvaluations = evaluations.filter((item) => {
    const search = searchTerm.toLowerCase()
    return (
      item.modelo.toLowerCase().includes(search) ||
      (item.serial_number && item.serial_number.toLowerCase().includes(search))
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por modelo ou serial..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Data</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Serial</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Valor Final</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredEvaluations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhuma avaliação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredEvaluations.map((evalItem) => {
                const hasDefects =
                  evalItem.descontos_aplicados &&
                  evalItem.descontos_aplicados.length > 0
                return (
                  <TableRow key={evalItem.id} className="hover:bg-gray-50">
                    <TableCell className="text-muted-foreground">
                      {format(
                        new Date(evalItem.created_at),
                        'dd/MM/yyyy HH:mm',
                        {
                          locale: ptBR,
                        },
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {evalItem.modelo}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {evalItem.serial_number || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={hasDefects ? 'secondary' : 'default'}
                        className={
                          hasDefects
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-green-100 text-green-800 border-green-200'
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
    </div>
  )
}
