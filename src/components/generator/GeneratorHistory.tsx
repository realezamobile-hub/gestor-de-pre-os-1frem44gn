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
import { History, Trash2, Copy, Eye, Calendar, Package } from 'lucide-react'
import { useProductStore } from '@/stores/useProductStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { GeneratedList } from '@/types'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function GeneratorHistory() {
  const { generatedLists, deleteGeneratedList } = useProductStore()
  const [selectedList, setSelectedList] = useState<GeneratedList | null>(null)

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
              Acesse as listas geradas anteriormente e seus dados originais.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-[calc(100vh-10rem)]">
            <ScrollArea className="h-full">
              {generatedLists.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  Nenhuma lista gerada ainda.
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
                    {generatedLists.map((list) => (
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
        onOpenChange={(open) => !open && setSelectedList(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
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
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Package className="w-4 h-4" />
                  Itens Originais ({selectedList.items_snapshot?.length || 0})
                </div>
                <div className="border rounded-md bg-white flex-1 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-xs">Produto</TableHead>
                        <TableHead className="h-8 text-xs text-right">
                          Preço
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedList.items_snapshot?.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="py-2 text-xs">
                            <div className="font-medium">
                              {item.custom_model || item.product?.modelo}
                            </div>
                            <div className="text-muted-foreground scale-90 origin-left">
                              {item.group_name}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-xs text-right font-mono">
                            R${' '}
                            {item.custom_price?.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
