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
import { DollarSign, Save } from 'lucide-react'
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
  // Stores the R$ value for editing
  const [editingValues, setEditingValues] = useState<Record<string, string>>({})
  // Stores the % value for editing
  const [editingPercents, setEditingPercents] = useState<
    Record<string, string>
  >({})
  const [isSaving, setIsSaving] = useState(false)

  const selectedModel = useMemo(
    () => basePrices.find((p) => p.id === selectedModelId),
    [basePrices, selectedModelId],
  )
  const basePrice = selectedModel?.preco_base || 0

  const modelDiscounts = useMemo(() => {
    if (!selectedModelId) return []
    return peripheralDiscounts.filter((d) => d.modelo_id === selectedModelId)
  }, [peripheralDiscounts, selectedModelId])

  const getCurrentValue = (itemId: string) => {
    if (editingValues[itemId] !== undefined) return editingValues[itemId]
    const discount = modelDiscounts.find((d) => d.checklist_item_id === itemId)
    return discount ? discount.valor_desconto.toFixed(2) : ''
  }

  const getCurrentPercent = (itemId: string) => {
    if (editingPercents[itemId] !== undefined) return editingPercents[itemId]
    const discount = modelDiscounts.find((d) => d.checklist_item_id === itemId)
    if (discount && basePrice > 0) {
      return ((discount.valor_desconto / basePrice) * 100).toFixed(2)
    }
    return ''
  }

  const handleAmountChange = (checklistItemId: string, value: string) => {
    // Update R$ state
    setEditingValues((prev) => ({ ...prev, [checklistItemId]: value }))

    // Calculate and update % state
    if (basePrice > 0 && value) {
      const val = parseFloat(value)
      if (!isNaN(val)) {
        const pct = (val / basePrice) * 100
        setEditingPercents((prev) => ({
          ...prev,
          [checklistItemId]: pct.toFixed(2),
        }))
      } else {
        setEditingPercents((prev) => ({ ...prev, [checklistItemId]: '' }))
      }
    } else {
      setEditingPercents((prev) => ({ ...prev, [checklistItemId]: '' }))
    }
  }

  const handlePercentChange = (checklistItemId: string, percent: string) => {
    // Update % state
    setEditingPercents((prev) => ({ ...prev, [checklistItemId]: percent }))

    // Calculate and update R$ state
    if (basePrice > 0 && percent) {
      const pct = parseFloat(percent)
      if (!isNaN(pct)) {
        const val = (pct / 100) * basePrice
        setEditingValues((prev) => ({
          ...prev,
          [checklistItemId]: val.toFixed(2),
        }))
      } else {
        setEditingValues((prev) => ({ ...prev, [checklistItemId]: '' }))
      }
    } else {
      setEditingValues((prev) => ({ ...prev, [checklistItemId]: '' }))
    }
  }

  const handleSave = async (item: any) => {
    const valStr = editingValues[item.id]
    // Use existing value if not editing, but only if editingValues has been touched or init
    // Actually we only save if we have a value in editingValues, otherwise we rely on what's in DB
    // But since we want to allow saving the current visible value:
    const finalValStr =
      valStr !== undefined
        ? valStr
        : modelDiscounts
            .find((d) => d.checklist_item_id === item.id)
            ?.valor_desconto.toString()

    if (finalValStr === undefined) return

    const val = parseFloat(finalValStr)
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
      setEditingPercents((prev) => {
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
          Configure o valor de dedução para cada defeito em cada modelo (R$ ou
          %).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-col gap-4 flex h-full min-h-0">
        <div className="flex gap-4 items-end">
          <div className="space-y-2 flex-1">
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
          <div className="space-y-2 flex-1">
            <span className="text-sm font-medium">Preço Base</span>
            <div className="h-10 px-3 py-2 border rounded-md bg-slate-50 text-slate-700 font-bold">
              R${' '}
              {basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {selectedModelId ? (
          <ScrollArea className="flex-1 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Item / Defeito</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="w-[140px]">Dedução (R$)</TableHead>
                  <TableHead className="w-[140px]">Dedução (%)</TableHead>
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
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-xs text-muted-foreground">
                            R$
                          </span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={getCurrentValue(item.id)}
                            onChange={(e) =>
                              handleAmountChange(item.id, e.target.value)
                            }
                            className={cn(
                              'h-9 pl-7 text-right',
                              hasEdit && 'border-amber-400 bg-amber-50',
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0.0"
                            value={getCurrentPercent(item.id)}
                            onChange={(e) =>
                              handlePercentChange(item.id, e.target.value)
                            }
                            className={cn(
                              'h-9 pr-6 text-right',
                              hasEdit && 'border-amber-400 bg-amber-50',
                            )}
                          />
                          <span className="absolute right-2 top-2 text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
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
