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
import { Smartphone, FileText, Eye, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilePreviewDialog } from '@/components/common/FilePreviewDialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

export function EvaluationHistory() {
  const { evaluations, fetchEvaluations, isLoading } = useEvaluationStore()
  const [previewFile, setPreviewFile] = useState<{
    url: string
    name: string
  } | null>(null)

  useEffect(() => {
    fetchEvaluations()
  }, [])

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
              <TableHead className="text-right">Valor Final</TableHead>
              <TableHead className="text-right">Arquivos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-muted-foreground">
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
                    <span>{item.nome_cliente || 'N/A'}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.cpf_cliente}
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
                  <div className="flex justify-end gap-1">
                    {item.url_print_seguranca && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                              onClick={() =>
                                setPreviewFile({
                                  url: item.url_print_seguranca!,
                                  name: 'Print Segurança',
                                })
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver Print</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {item.url_foto_documento && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-orange-500 hover:bg-orange-50"
                              onClick={() =>
                                setPreviewFile({
                                  url: item.url_foto_documento!,
                                  name: 'Documento',
                                })
                              }
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver Documento</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {/* Handle extra files count if needed */}
                    {item.arquivos_consulta &&
                      Array.isArray(item.arquivos_consulta) &&
                      item.arquivos_consulta.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="ml-1 h-8">
                                +{item.arquivos_consulta.length}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Arquivos Adicionais (Ver no perfil do cliente)
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <FilePreviewDialog
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
      />
    </>
  )
}
