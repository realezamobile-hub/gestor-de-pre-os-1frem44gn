import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  History,
  Trash2,
  Copy,
  Eye,
  Package,
  Search,
  X,
  Lock,
} from 'lucide-react'
import { useProductStore } from '@/stores/useProductStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { GeneratedList } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function GeneratorHistory() {
  const { generatedLists, deleteGeneratedList } = useProductStore()
  const [selectedList, setSelectedList] = useState<GeneratedList | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInternalDetails, setShowInternalDetails] = useState(false)

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Conteúdo copiado!')
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Tem certeza que deseja excluir este item do histórico?')) {
      await deleteGeneratedList(id)
    }
  }

  const filteredLists = generatedLists.filter((list) => {
    const term = searchTerm.toLowerCase()
    const titleMatch = list.title?.toLowerCase().includes(term)
    const contentMatch = list.content?.toLowerCase().includes(term)
    return !term || titleMatch || contentMatch
  })

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <History className="w-4 h-4" />
            Histórico
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Histórico de Listas</SheetTitle>
            <SheetDescription>
              Acesse as listas geradas anteriormente.
            </SheetDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou conteúdo..."
                className="pl-9 pr-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </SheetHeader>
          <div className="mt-6 h-[calc(100vh-12rem)]">
            <ScrollArea className="h-full">
              {filteredLists.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 opacity-20" />
                  <p>
                    {searchTerm
                      ? 'Nenhuma lista encontrada para a busca.'
                      : 'Nenhuma lista gerada ainda.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLists.map((list) => (
                      <TableRow
                        key={list.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedList(list)}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {format(
                                new Date(list.created_at),
                                "dd/MM 'às' HH:mm",
                                { locale: ptBR },
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {list.title || 'Sem título'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-xs bg-secondary px-2 py-1 rounded">
                            {list.type === 'supplier' ? 'Interna' : 'Cliente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopy(list.content || '')
                              }}
                              title="Copiar Texto"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => handleDelete(list.id, e)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!selectedList}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedList(null)
            setShowInternalDetails(false)
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da Lista</span>
              <span className="text-sm font-normal text-muted-foreground">
                {selectedList &&
                  format(new Date(selectedList.created_at), "PPP 'às' HH:mm", {
                    locale: ptBR,
                  })}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedList && (
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-2 min-h-0">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Eye className="w-4 h-4" />
                  Visualização do Texto
                </div>
                <div className="border rounded-md p-3 bg-muted/30 flex-1 overflow-auto text-xs font-mono whitespace-pre-wrap">
                  {selectedList.content}
                </div>
                <Button
                  onClick={() => handleCopy(selectedList.content || '')}
                  variant="secondary"
                  size="sm"
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Copiar Texto
                </Button>
              </div>

              <div className="flex flex-col gap-2 min-h-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Package className="w-4 h-4" />
                    Itens ({selectedList.items_snapshot?.length || 0})
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="internal-mode"
                      checked={showInternalDetails}
                      onCheckedChange={setShowInternalDetails}
                    />
                    <Label htmlFor="internal-mode" className="text-xs">
                      {showInternalDetails
                        ? 'Ver Detalhes Públicos'
                        : 'Ver Dados Internos'}
                    </Label>
                  </div>
                </div>

                <div className="border rounded-md bg-white flex-1 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-xs">Produto</TableHead>
                        {showInternalDetails ? (
                          <>
                            <TableHead className="h-8 text-xs">
                              Fornecedor
                            </TableHead>
                            <TableHead className="h-8 text-xs text-right">
                              Custo Orig.
                            </TableHead>
                          </>
                        ) : (
                          <TableHead className="h-8 text-xs text-right">
                            Preço Lista
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedList.items_snapshot?.map((item, idx) => {
                        const originalPrice = item.product?.valor
                        const hasProduct = !!item.product
                        return (
                          <TableRow key={idx}>
                            <TableCell className="py-2 text-xs">
                              <div className="font-medium">
                                {item.custom_model || item.product?.modelo}
                              </div>
                              <div className="text-muted-foreground scale-90 origin-left">
                                {item.group_name}
                              </div>
                            </TableCell>

                            {showInternalDetails ? (
                              <>
                                <TableCell className="py-2 text-xs">
                                  {hasProduct ? (
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {item.product?.fornecedor || '-'}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">
                                        {item.product?.telefone || '-'}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground italic">
                                      Manual
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 text-xs text-right font-mono text-red-600">
                                  {originalPrice
                                    ? `R$ ${originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                    : '-'}
                                </TableCell>
                              </>
                            ) : (
                              <TableCell className="py-2 text-xs text-right font-mono text-emerald-600">
                                R${' '}
                                {item.custom_price?.toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                {showInternalDetails && (
                  <div className="p-2 bg-yellow-50 border border-yellow-100 rounded text-[10px] text-yellow-800 flex items-start gap-2">
                    <Lock className="w-3 h-3 mt-0.5 shrink-0" />
                    <p>
                      Estes dados são internos (custo e fornecedor original) e
                      foram salvos no momento da geração da lista.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
