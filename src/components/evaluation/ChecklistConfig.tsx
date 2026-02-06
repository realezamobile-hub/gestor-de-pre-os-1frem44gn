import { useState } from 'react'
import { useEvaluationStore } from '@/stores/useEvaluationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, ListChecks, Pencil, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ChecklistConfig() {
  const {
    checklistItems,
    categories,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
  } = useEvaluationStore()
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = async () => {
    if (!newCategoryId || !newName) {
      toast.error('Selecione uma categoria e informe o nome')
      return
    }
    setIsAdding(true)
    const result = await addChecklistItem(newCategoryId, newName)
    setIsAdding(false)
    if (result.success) {
      toast.success('Item adicionado')
      setNewName('')
    } else {
      toast.error('Erro ao adicionar')
    }
  }

  const startEditing = (item: any) => {
    setEditingId(item.id)
    setEditName(item.nome)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditName('')
  }

  const saveEditing = async () => {
    if (!editingId || !editName.trim()) return

    const result = await updateChecklistItem(editingId, editName.trim())
    if (result.success) {
      toast.success('Item atualizado')
      setEditingId(null)
      setEditName('')
    } else {
      toast.error('Erro ao atualizar item')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza? Isso pode afetar descontos configurados.')) {
      await deleteChecklistItem(id)
    }
  }

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || 'Desconhecida'
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-primary" />
          Itens de Inspeção
        </CardTitle>
        <CardDescription>
          Defina os itens que aparecerão no checklist.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-col gap-4 flex h-full min-h-0">
        <div className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg border">
          <div className="flex-1 space-y-1">
            <span className="text-xs font-medium">Categoria</span>
            <Select value={newCategoryId} onValueChange={setNewCategoryId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-[2] space-y-1">
            <span className="text-xs font-medium">Nome do Item</span>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Câmera Traseira"
              className="bg-white"
            />
          </div>
          <Button onClick={handleAdd} disabled={isAdding}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Categoria</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="w-[120px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklistItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-muted-foreground w-1/3">
                    {getCategoryName(item.category_id)}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing()
                          if (e.key === 'Escape') cancelEditing()
                        }}
                      />
                    ) : (
                      item.nome
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={saveEditing}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelEditing}
                          className="h-8 w-8 text-slate-500 hover:text-slate-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(item)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
