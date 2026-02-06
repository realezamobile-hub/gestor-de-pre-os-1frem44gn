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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Smartphone,
  Eye,
  Loader2,
  User,
  Banknote,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EvaluationDetailsDialog } from './EvaluationDetailsDialog'
import { Evaluation } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FilePreviewDialog } from '@/components/common/FilePreviewDialog'
import { isPdfFile } from '@/lib/utils'

export function EvaluationHistory() {
  const {
    evaluations,
    fetchEvaluations,
    isLoading,
    checklistItems,
    categories,
  } = useEvaluationStore()
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<Evaluation | null>(null)
  const [previewFile, setPreviewFile] = useState<{
    url: string
    name: string
  } | null>(null)

  useEffect(() => {
    fetchEvaluations()
  }, [])

  const handleOpenReceipt = (evaluation: Evaluation) => {
    if (!evaluation.url_comprovante_pagamento) return

    if (isPdfFile(evaluation.url_comprovante_pagamento)) {
      window.open(evaluation.url_comprovante_pagamento, '_blank')
    } else {
      setPreviewFile({
        url: evaluation.url_comprovante_pagamento,
        name: `Comprovante - ${evaluation.modelo}`,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (evaluations.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-slate-50 text-muted-foreground">
        Nenhuma avaliação encontrada.
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Data</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Avaliador</TableHead>
              <TableHead className="text-right">Valor Final</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-slate-400" />
                      {item.modelo}
                    </span>
                    {item.serial_number && (
                      <span className="text-xs text-muted-foreground font-mono bg-slate-100 px-1 rounded w-fit mt-1">
                        {item.serial_number}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>
                      {item.nome_cliente ||
                        (item.client ? item.client.nome : 'N/A')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.cpf_cliente || (item.client ? item.client.cpf : '')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">
                      {item.profiles?.name || 'Sistema'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-200 bg-emerald-50"
                  >
                    R${' '}
                    {item.valor_final?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    {item.url_comprovante_pagamento && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => handleOpenReceipt(item)}
                            >
                              <Banknote className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ver Comprovante de Pagamento</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => setSelectedEvaluation(item)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhes
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EvaluationDetailsDialog
        open={!!selectedEvaluation}
        onOpenChange={(open) => !open && setSelectedEvaluation(null)}
        evaluation={selectedEvaluation}
        checklistItems={checklistItems}
        categories={categories}
      />

      <FilePreviewDialog
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
      />
    </>
  )
}
