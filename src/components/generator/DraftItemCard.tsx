import { useState, useEffect } from 'react'
import { DraftItem } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trash2, GripVertical, Loader2 } from 'lucide-react'
import { useProductStore } from '@/stores/useProductStore'
import { cn } from '@/lib/utils'

interface DraftItemCardProps {
  item: DraftItem
  onUpdate: (id: string, updates: Partial<DraftItem>) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export function DraftItemCard({
  item,
  onUpdate,
  onRemove,
}: DraftItemCardProps) {
  const { categories } = useProductStore()

  // Initialize state with item values or defaults
  const [model, setModel] = useState(
    item.custom_model || item.product?.modelo || '',
  )
  const [details, setDetails] = useState(() => {
    if (item.custom_details) return item.custom_details
    if (!item.product) return ''
    return [
      item.product.ram && `${item.product.ram} RAM`,
      item.product.memoria,
      item.product.cor,
    ]
      .filter(Boolean)
      .join(' ')
  })
  const [price, setPrice] = useState<string>(() => {
    const p = item.custom_price ?? item.product?.valor
    return p !== undefined && p !== null ? p.toString() : ''
  })
  const [group, setGroup] = useState(
    item.group_name || item.product?.categoria || 'Outros',
  )

  const [isSaving, setIsSaving] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  // Sync state if item changes from outside (e.g. after reorder/refresh)
  useEffect(() => {
    setModel(item.custom_model || item.product?.modelo || '')

    if (item.custom_details) {
      setDetails(item.custom_details)
    } else if (item.product) {
      setDetails(
        [
          item.product.ram && `${item.product.ram} RAM`,
          item.product.memoria,
          item.product.cor,
        ]
          .filter(Boolean)
          .join(' '),
      )
    }

    const p = item.custom_price ?? item.product?.valor
    setPrice(p !== undefined && p !== null ? p.toString() : '')

    setGroup(item.group_name || item.product?.categoria || 'Outros')
  }, [item])

  const handleBlur = async () => {
    // Check if changes exist
    const currentPrice = price ? parseFloat(price) : null

    const hasChanges =
      model !== (item.custom_model || item.product?.modelo) ||
      (details !== item.custom_details &&
        details !==
          [
            item.product?.ram && `${item.product?.ram} RAM`,
            item.product?.memoria,
            item.product?.cor,
          ]
            .filter(Boolean)
            .join(' ')) ||
      currentPrice !== (item.custom_price ?? item.product?.valor) ||
      group !== (item.group_name || item.product?.categoria)

    if (hasChanges) {
      setIsSaving(true)
      await onUpdate(item.id, {
        custom_model: model,
        custom_details: details,
        custom_price: currentPrice,
        group_name: group,
      })
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    await onRemove(item.id)
    setIsRemoving(false)
  }

  return (
    <div className="group relative rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md">
      <div className="grid grid-cols-12 gap-3 items-end">
        {/* Group - Col 3 */}
        <div className="col-span-12 sm:col-span-3 space-y-1">
          <Label className="text-xs text-muted-foreground">Grupo</Label>
          <Input
            list="groups-list"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            onBlur={handleBlur}
            className="h-8 text-xs font-medium"
            placeholder="Grupo..."
          />
          <datalist id="groups-list">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
            <option value="Outros" />
          </datalist>
        </div>

        {/* Model - Col 5 */}
        <div className="col-span-12 sm:col-span-5 space-y-1">
          <Label className="text-xs text-muted-foreground">Modelo</Label>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            onBlur={handleBlur}
            className="h-8 text-xs font-semibold"
            placeholder="Ex: iPhone 13"
          />
        </div>

        {/* Price - Col 3 */}
        <div className="col-span-10 sm:col-span-3 space-y-1">
          <Label className="text-xs text-muted-foreground">Preço (R$)</Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              R$
            </span>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={handleBlur}
              className="h-8 text-xs font-bold pl-7 text-emerald-600"
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Actions - Col 1 */}
        <div className="col-span-2 sm:col-span-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Details - Full Width Row 2 */}
        <div className="col-span-12 space-y-1">
          <Label className="text-xs text-muted-foreground">
            Detalhes / Specs
          </Label>
          <Input
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onBlur={handleBlur}
            className="h-8 text-xs text-muted-foreground"
            placeholder="Ex: 128GB Preto"
          />
        </div>
      </div>

      {isSaving && (
        <div className="absolute top-2 right-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse block" />
        </div>
      )}
    </div>
  )
}
