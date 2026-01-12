import { useState } from 'react'
import { useEvaluationStore } from '@/stores/useEvaluationStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Smartphone, Plus, Pencil, Copy, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { BasePriceDialog } from './BasePriceDialog'
import { BasePriceConfig } from '@/types'

export function BasePriceList() {
  const { basePrices, addBasePrice, updateBasePrice, deleteBasePrice } =
    useEvaluationStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'duplicate'>(
    'create',
  )
  const [selectedItem, setSelectedItem] = useState<BasePriceConfig | undefined>(
    undefined,
  )

  const handleAdd = () => {
    setDialogMode('create')
    setSelectedItem(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (item: BasePriceConfig) => {
    setDialogMode('edit')
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const handleDuplicate = (item: BasePriceConfig) => {
    setDialogMode('duplicate')
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este modelo?')) {
      const result = await deleteBasePrice(id)
      if (result.success) {
        toast.success('Modelo removido')
      } else {
        toast.error('Erro ao remover modelo')
      }
    }
  }

  const handleSubmit = async (modelo: string, preco: number) => {
    let result

    if (dialogMode === 'edit' && selectedItem) {
      result = await updateBasePrice(selectedItem.id, modelo, preco)
    } else {
      // Create or Duplicate (Create new)
      result = await addBasePrice(modelo, preco)
    }

    if (result.success) {
      toast.success(
        dialogMode === 'edit'
          ? 'Modelo atualizado com sucesso'
          : 'Modelo adicionado com sucesso',
      )
      return true
    } else {
      toast.error('Erro ao salvar modelo')
      return false
    }
  }

  return (
    <>
      <Card className="flex flex-col h-[600px]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Preços Base por Modelo
              </CardTitle>
              <CardDescription className="mt-1">
                Gerencie o valor de compra para aparelhos em perfeito estado.
              </CardDescription>
            </div>
            <Button onClick={handleAdd} size="sm" className="h-8">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 sticky top-0 hover:bg-slate-50 z-10">
                  <TableHead className="pl-6">Modelo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[120px] text-right pr-6">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {basePrices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhum modelo cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  basePrices.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium pl-6">
                        {item.modelo}
                      </TableCell>
                      <TableCell className="text-right">
                        R${' '}
                        {item.preco_base.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                            onClick={() => handleEdit(item)}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                            onClick={() => handleDuplicate(item)}
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(item.id)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <BasePriceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={selectedItem}
        onSubmit={handleSubmit}
      />
    </>
  )
}
