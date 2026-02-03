import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Evaluation, ChecklistItem, ChecklistCategory } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  User,
  Smartphone,
  Calendar,
  DollarSign,
  FileText,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatPhone, formatCPF } from '@/lib/utils'
import { FilePreviewDialog } from '@/components/common/FilePreviewDialog'

interface EvaluationDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluation: Evaluation | null
  checklistItems: ChecklistItem[]
  categories: ChecklistCategory[]
}

export function EvaluationDetailsDialog({
  open,
  onOpenChange,
  evaluation,
  checklistItems,
  categories,
}: EvaluationDetailsDialogProps) {
  const [previewFile, setPreviewFile] = useState<{
    url: string
    name: string
  } | null>(null)

  if (!evaluation) return null

  // Collect all files for gallery
  const files = [
    {
      label: 'Print de Segurança',
      url: evaluation.url_print_seguranca,
      icon: <ShieldCheck className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Documento do Cliente',
      url: evaluation.url_foto_documento,
      icon: <User className="w-4 h-4" />,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    // Add additional research files if they exist
    ...(evaluation.url_pesquisa_1
      ? [
          {
            label: 'Pesquisa Extra 1',
            url: evaluation.url_pesquisa_1,
            icon: <Search className="w-4 h-4" />,
            color: 'text-purple-600 bg-purple-50 border-purple-200',
          },
        ]
      : []),
    ...(evaluation.url_pesquisa_2
      ? [
          {
            label: 'Pesquisa Extra 2',
            url: evaluation.url_pesquisa_2,
            icon: <Search className="w-4 h-4" />,
            color: 'text-purple-600 bg-purple-50 border-purple-200',
          },
        ]
      : []),
    ...(evaluation.url_pesquisa_3
      ? [
          {
            label: 'Pesquisa Extra 3',
            url: evaluation.url_pesquisa_3,
            icon: <Search className="w-4 h-4" />,
            color: 'text-purple-600 bg-purple-50 border-purple-200',
          },
        ]
      : []),
    ...(evaluation.url_pesquisa_4
      ? [
          {
            label: 'Pesquisa Extra 4',
            url: evaluation.url_pesquisa_4,
            icon: <Search className="w-4 h-4" />,
            color: 'text-purple-600 bg-purple-50 border-purple-200',
          },
        ]
      : []),
  ].filter((f) => f.url)

  // Parse checklist
  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || 'Outros'

  const checklistData = evaluation.checklist_data || {}
  const defects = checklistItems.filter((item) => !checklistData[item.id])
  const passedItems = checklistItems.filter((item) => checklistData[item.id])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b shrink-0 bg-slate-50">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-primary" />
                <span>Detalhes da Avaliação</span>
              </div>
              <Badge
                variant="outline"
                className="text-lg px-3 py-1 bg-white text-emerald-600 border-emerald-200"
              >
                R${' '}
                {evaluation.valor_final.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="info" className="h-full flex flex-col">
              <div className="px-6 pt-4 shrink-0">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="info">Informações Gerais</TabsTrigger>
                  <TabsTrigger value="checklist">
                    Checklist & Defeitos
                  </TabsTrigger>
                  <TabsTrigger value="evidence">Evidências & Fotos</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 p-6">
                <TabsContent value="info" className="mt-0 space-y-6">
                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Device Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                        <Smartphone className="w-5 h-5 text-slate-500" />
                        Dados do Aparelho
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-bold">
                            Modelo
                          </span>
                          <p className="font-medium text-lg">
                            {evaluation.modelo}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-bold">
                            Serial / IMEI
                          </span>
                          <p className="font-mono text-sm bg-slate-100 p-1 rounded inline-block">
                            {evaluation.serial_number || 'Não informado'}
                          </p>
                        </div>
                        <div className="col-span-2 space-y-2 pt-2">
                          <span className="text-xs text-muted-foreground uppercase font-bold">
                            Consultas Rápidas
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              asChild
                            >
                              <a
                                href="https://www.consultaserialaparelho.com.br/public-web/homeSiga"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Consultar Siga
                                <ExternalLink className="w-3 h-3 ml-2" />
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              asChild
                            >
                              <a
                                href="https://sickw.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Consultar SickW
                                <ExternalLink className="w-3 h-3 ml-2" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                        <User className="w-5 h-5 text-slate-500" />
                        Dados do Cliente
                      </h3>
                      {evaluation.client ? (
                        <div className="grid gap-3">
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Nome
                            </span>
                            <p className="font-medium">
                              {evaluation.client.nome}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-xs text-muted-foreground">
                                CPF
                              </span>
                              <p className="font-medium">
                                {formatCPF(evaluation.client.cpf)}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Telefone
                              </span>
                              <p className="font-medium">
                                {formatPhone(evaluation.client.telefone)}
                              </p>
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Localização
                            </span>
                            <p className="text-sm">
                              {[
                                evaluation.client.municipio,
                                evaluation.client.estado,
                              ]
                                .filter(Boolean)
                                .join(' - ') || 'Endereço não informado'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Nome
                            </span>
                            <p className="font-medium">
                              {evaluation.nome_cliente || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">
                              CPF
                            </span>
                            <p className="font-medium">
                              {evaluation.cpf_cliente || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Telefone
                            </span>
                            <p className="font-medium">
                              {evaluation.telefone_cliente || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="bg-slate-50 rounded-lg p-4 border grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" /> Data
                      </div>
                      <p className="text-sm font-medium">
                        {format(
                          new Date(evaluation.created_at),
                          'dd/MM/yyyy HH:mm',
                          { locale: ptBR },
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" /> Avaliador
                      </div>
                      <p className="text-sm font-medium truncate">
                        {evaluation.profiles?.name || 'Sistema'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="w-3 h-3" /> Valor Final
                      </div>
                      <p className="text-sm font-bold text-emerald-600">
                        R${' '}
                        {evaluation.valor_final.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" /> ID
                      </div>
                      <p
                        className="text-xs font-mono text-muted-foreground truncate"
                        title={evaluation.id}
                      >
                        {evaluation.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="checklist" className="mt-0 space-y-6">
                  {/* Financial Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                      <DollarSign className="w-5 h-5 text-slate-500" />
                      Composição do Preço
                    </h3>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b">
                        <span className="font-semibold text-sm">
                          Descontos Aplicados (
                          {evaluation.descontos_aplicados?.length || 0})
                        </span>
                      </div>
                      {evaluation.descontos_aplicados &&
                      evaluation.descontos_aplicados.length > 0 ? (
                        <div className="divide-y">
                          {evaluation.descontos_aplicados.map((d: any, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-3 text-sm"
                            >
                              <span className="text-red-600 font-medium">
                                {d.nome}
                              </span>
                              <span className="font-mono text-red-600">
                                - R${' '}
                                {d.valor_desconto?.toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          Nenhum desconto aplicado.
                        </div>
                      )}
                      <div className="p-4 bg-emerald-50 border-t flex justify-between items-center">
                        <span className="font-bold text-emerald-900">
                          Valor Final da Oferta
                        </span>
                        <span className="font-bold text-xl text-emerald-600">
                          R${' '}
                          {evaluation.valor_final.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Defects List */}
                  {defects.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        Defeitos / Itens Não Aprovados
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {defects.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700"
                          >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {item.nome}
                              </span>
                              <span className="text-xs opacity-80">
                                {getCategoryName(item.category_id)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Passed Items List */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                      Itens Aprovados
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {passedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 bg-emerald-50/50 border border-emerald-100 rounded text-emerald-700 text-sm"
                        >
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="evidence" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {files.length > 0 ? (
                      files.map((file, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'group relative aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all hover:bg-slate-50 cursor-pointer overflow-hidden',
                            file.color,
                          )}
                          onClick={() =>
                            setPreviewFile({
                              url: file.url!,
                              name: file.label,
                            })
                          }
                        >
                          {file.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                            <img
                              src={file.url!}
                              alt={file.label}
                              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 z-10">
                              {file.icon}
                              <span className="text-sm font-medium text-center">
                                {file.label}
                              </span>
                              <Badge variant="secondary" className="mt-2">
                                Documento/PDF
                              </Badge>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-0" />

                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm text-white transform translate-y-full group-hover:translate-y-0 transition-transform z-20">
                            <p className="text-xs font-medium truncate">
                              {file.label}
                            </p>
                            <p className="text-[10px] opacity-80">
                              Clique para visualizar
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhuma evidência anexada a esta avaliação.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <FilePreviewDialog
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
      />
    </>
  )
}
