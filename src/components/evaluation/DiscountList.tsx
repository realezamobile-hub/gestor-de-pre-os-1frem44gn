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
import { Wrench, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PeripheralDiscountDialog } from './PeripheralDiscountDialog'
import { PeripheralDiscountConfig } from '@/types'

export function DiscountList() {
  const { peripheralDiscounts, addDiscount, updateDiscount, deleteDiscount } =
    useEvaluationStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedItem, setSelectedItem] = useState<
    PeripheralDiscountConfig | undefined
  >(undefined)

  const handleAdd = () => {
    setDialogMode('create')
    setSelectedItem(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (item: PeripheralDiscountConfig) => {
    setDialogMode('edit')
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este desconto?')) {
      const result = await deleteDiscount(id)
      if (result.success) {
        toast.success('Desconto removido')
      } else {
        toast.error('Erro ao remover desconto')
      }
    }
  }

  const handleSubmit = async (nome: string, valor: number) => {
    let result

    if (dialogMode === 'edit' && selectedItem) {
      result = await updateDiscount(selectedItem.id, nome, valor)
    } else {
      result = await addDiscount(nome, valor)
    }

    if (result.success) {
      toast.success(
        dialogMode === 'edit'
          ? 'Desconto atualizado com sucesso'
          : 'Desconto adicionado com sucesso',
      )
      return true
    } else {
      toast.error('Erro ao salvar desconto')
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
                <Wrench className="w-5 h-5 text-red-500" />
                Descontos de Periféricos
              </CardTitle>
              <CardDescription className="mt-1">
                Defina os valores a serem deduzidos para cada defeito.
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
                  <TableHead className="pl-6">Defeito</TableHead>
                  <TableHead className="text-right">Dedução</TableHead>
                  <TableHead className="w-[100px] text-right pr-6">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peripheralDiscounts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhum desconto cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  peripheralDiscounts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium pl-6">
                        {item.nome}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        - R${' '}
                        {item.valor_desconto.toLocaleString('pt-BR', {
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

      <PeripheralDiscountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={selectedItem}
        onSubmit={handleSubmit}
      />
    </>
  )
}
