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
import { Layers, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryDialog } from './CategoryDialog'
import { ChecklistCategory } from '@/types'

export function CategoryConfig() {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useEvaluationStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedItem, setSelectedItem] = useState<
    ChecklistCategory | undefined
  >(undefined)

  const handleAdd = () => {
    setDialogMode('create')
    setSelectedItem(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (item: ChecklistCategory) => {
    setDialogMode('edit')
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (
      confirm(
        'Tem certeza? Todos os itens desta categoria também serão excluídos.',
      )
    ) {
      const result = await deleteCategory(id)
      if (result.success) {
        toast.success('Categoria removida')
      } else {
        toast.error('Erro ao remover categoria')
      }
    }
  }

  const handleSubmit = async (name: string) => {
    let result
    if (dialogMode === 'edit' && selectedItem) {
      result = await updateCategory(selectedItem.id, name)
    } else {
      result = await addCategory(name)
    }
    if (result.success) {
      toast.success(
        dialogMode === 'edit'
          ? 'Categoria atualizada com sucesso'
          : 'Categoria adicionada com sucesso',
      )
      return true
    } else {
      toast.error('Erro ao salvar categoria')
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
                <Layers className="w-5 h-5 text-primary" />
                Categorias de Inspeção
              </CardTitle>
              <CardDescription className="mt-1">
                Gerencie os grupos do checklist (ex: Aparência, Hardware).
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
                  <TableHead className="pl-6">Nome</TableHead>
                  <TableHead className="w-[100px] text-right pr-6">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhuma categoria cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium pl-6">
                        {item.name}
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
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={selectedItem}
        onSubmit={handleSubmit}
      />
    </>
  )
}
