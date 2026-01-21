import { useState, useEffect } from 'react'
import { DraftItem } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Trash2,
  Loader2,
  StickyNote,
  Building2,
  Phone,
  ExternalLink,
} from 'lucide-react'
import { useProductStore } from '@/stores/useProductStore'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'

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

  const [model, setModel] = useState('')
  const [details, setDetails] = useState('')
  const [price, setPrice] = useState<string>('')
  const [group, setGroup] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  // Sync state with props
  useEffect(() => {
    // Model: Prefer custom_model, fallback to constructed model
    if (item.custom_model) {
      setModel(item.custom_model)
    } else if (item.product) {
      const full = [
        item.product.modelo,
        item.product.memoria,
        item.product.ram ? `${item.product.ram} RAM` : null,
        item.product.cor,
      ]
        .filter(Boolean)
        .join(' ')
      setModel(full)
    } else {
      setModel('')
    }

    setDetails(item.custom_details || '')

    const p = item.custom_price ?? item.product?.valor
    setPrice(p !== undefined && p !== null ? p.toString() : '')

    setGroup(item.group_name || item.product?.categoria || 'Outros')

    if (item.custom_details) setShowDetails(true)
  }, [item])

  const handleBlur = async () => {
    const currentPrice = price ? parseFloat(price) : null
    const originalPrice = item.custom_price ?? item.product?.valor

    // Construct default for comparison
    const defaultModel = item.product
      ? [
          item.product.modelo,
          item.product.memoria,
          item.product.ram ? `${item.product.ram} RAM` : null,
          item.product.cor,
        ]
          .filter(Boolean)
          .join(' ')
      : ''

    // Compare with current props to avoid unnecessary saves
    const hasChanges =
      model !== (item.custom_model || defaultModel) ||
      details !== (item.custom_details || '') ||
      currentPrice !== originalPrice ||
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

  const listId = `groups-list-${item.id}`

  return (
    <div className="group relative rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md">
      <div className="grid grid-cols-12 gap-3 items-end">
        {/* Group - Col 3 */}
        <div className="col-span-12 sm:col-span-3 space-y-1">
          <Label className="text-xs text-muted-foreground">Grupo</Label>
          <Input
            list={listId}
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            onBlur={handleBlur}
            className="h-9 text-sm font-medium"
            placeholder="Grupo..."
          />
          <datalist id={listId}>
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
            <option value="Outros" />
          </datalist>
        </div>

        {/* Model (Description) - Col 6 */}
        <div className="col-span-12 sm:col-span-6 space-y-1">
          <Label className="text-xs text-muted-foreground">
            Descrição (Modelo + Specs)
          </Label>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            onBlur={handleBlur}
            className="h-9 text-sm font-semibold"
            placeholder="Ex: iPhone 13 128GB Preto"
          />
        </div>

        {/* Price - Col 3 */}
        <div className="col-span-10 sm:col-span-2 space-y-1">
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
              className="h-9 text-sm font-bold pl-7 text-emerald-600"
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Actions - Col 1 */}
        <div className="col-span-2 sm:col-span-1 flex justify-end pb-0.5">
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
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Collapsible
          open={showDetails}
          onOpenChange={setShowDetails}
          className="flex-1 min-w-[200px]"
        >
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <StickyNote className="w-3 h-3 mr-1.5" />
                {showDetails ? 'Ocultar Detalhes' : 'Adicionar Detalhes'}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="pt-2">
            <Input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              onBlur={handleBlur}
              className="h-8 text-xs text-muted-foreground"
              placeholder="Detalhes adicionais (aparecem ao lado do modelo)"
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Supplier Info Badge */}
        {item.product && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground ml-auto bg-slate-50 px-2 py-1 rounded border">
            {item.product.fornecedor && (
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span className="font-medium truncate max-w-[100px]">
                  {item.product.fornecedor}
                </span>
              </div>
            )}
            {item.product.telefone && (
              <div className="flex items-center gap-1 border-l pl-2 ml-1">
                <Phone className="w-3 h-3" />
                <span>{item.product.telefone}</span>
              </div>
            )}
            {item.product.link_whatsapp && (
              <a
                href={item.product.link_whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 border-l pl-2 ml-1 text-blue-600 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Link</span>
              </a>
            )}
          </div>
        )}
      </div>

      {isSaving && (
        <div className="absolute top-2 right-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse block" />
        </div>
      )}
    </div>
  )
}
