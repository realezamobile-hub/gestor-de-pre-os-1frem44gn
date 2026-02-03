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
import { Plus, Trash2, ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ChecklistConfig() {
  const { checklistItems, addChecklistItem, deleteChecklistItem } =
    useEvaluationStore()

  const [newCategory, setNewCategory] = useState('')
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const CATEGORIES = ['Aparencia', 'Hardware', 'Software', 'Outros']

  const handleAdd = async () => {
    if (!newCategory || !newName) {
      toast.error('Preencha categoria e nome')
      return
    }
    setIsAdding(true)
    const result = await addChecklistItem(newCategory, newName)
    setIsAdding(false)
    if (result.success) {
      toast.success('Item adicionado')
      setNewName('')
    } else {
      toast.error('Erro ao adicionar')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza? Isso pode afetar descontos configurados.')) {
      await deleteChecklistItem(id)
    }
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
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
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
                <TableHead className="w-[80px] text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklistItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {item.categoria}
                  </TableCell>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
