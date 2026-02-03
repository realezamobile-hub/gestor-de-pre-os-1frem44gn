import { useState, useMemo } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Smartphone, DollarSign, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ModelDiscountConfig() {
  const {
    basePrices,
    checklistItems,
    peripheralDiscounts,
    categories,
    addDiscount,
    updateDiscount,
  } = useEvaluationStore()

  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [editingValues, setEditingValues] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const modelDiscounts = useMemo(() => {
    if (!selectedModelId) return []
    return peripheralDiscounts.filter((d) => d.modelo_id === selectedModelId)
  }, [peripheralDiscounts, selectedModelId])

  const handleValueChange = (checklistItemId: string, value: string) => {
    setEditingValues((prev) => ({ ...prev, [checklistItemId]: value }))
  }

  const getCurrentValue = (itemId: string) => {
    if (editingValues[itemId] !== undefined) return editingValues[itemId]
    const discount = modelDiscounts.find((d) => d.checklist_item_id === itemId)
    return discount ? discount.valor_desconto.toString() : ''
  }

  const handleSave = async (item: any) => {
    const valStr = editingValues[item.id]
    if (valStr === undefined) return

    const val = parseFloat(valStr)
    if (isNaN(val)) return

    setIsSaving(true)
    const existingDiscount = modelDiscounts.find(
      (d) => d.checklist_item_id === item.id,
    )

    let result
    if (existingDiscount) {
      result = await updateDiscount(existingDiscount.id, val)
    } else {
      result = await addDiscount(item.nome, val, selectedModelId, item.id)
    }

    setIsSaving(false)
    if (result.success) {
      toast.success('Valor salvo')
      setEditingValues((prev) => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
    } else {
      toast.error('Erro ao salvar')
    }
  }

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || 'Desconhecida'
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-red-500" />
          Preços de Defeitos por Modelo
        </CardTitle>
        <CardDescription>
          Configure o valor de dedução para cada defeito em cada modelo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-col gap-4 flex h-full min-h-0">
        <div className="space-y-2">
          <span className="text-sm font-medium">Selecione o Modelo</span>
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um modelo..." />
            </SelectTrigger>
            <SelectContent>
              {basePrices.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedModelId ? (
          <ScrollArea className="flex-1 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Item / Defeito</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="w-[150px]">Dedução (R$)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklistItems.map((item) => {
                  const hasEdit = editingValues[item.id] !== undefined
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {getCategoryName(item.category_id)}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={getCurrentValue(item.id)}
                          onChange={(e) =>
                            handleValueChange(item.id, e.target.value)
                          }
                          className={cn(
                            'h-8 text-right',
                            hasEdit && 'border-amber-400 bg-amber-50',
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {hasEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-emerald-600"
                            onClick={() => handleSave(item)}
                            disabled={isSaving}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-slate-50">
            Selecione um modelo para configurar os descontos
          </div>
        )}
      </CardContent>
    </Card>
  )
}
