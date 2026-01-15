import { useState, useEffect } from 'react'
import { DraftItem } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DraftItemEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: DraftItem | null
  onSave: (id: string, updates: Partial<DraftItem>) => Promise<void>
}

export function DraftItemEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: DraftItemEditDialogProps) {
  const [model, setModel] = useState('')
  const [details, setDetails] = useState('')
  const [price, setPrice] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (item && item.product) {
      setModel(item.custom_model || item.product.modelo || '')

      const defaultDetails = [
        item.product.ram && `${item.product.ram} RAM`,
        item.product.memoria,
        item.product.cor,
      ]
        .filter(Boolean)
        .join(' ')

      setDetails(item.custom_details || defaultDetails)

      const p = item.custom_price ?? item.product.valor
      setPrice(p ? p.toString() : '')
    }
  }, [item])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    setIsSaving(true)
    await onSave(item.id, {
      custom_model: model,
      custom_details: details,
      custom_price: price ? parseFloat(price) : null,
    })
    setIsSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Item da Lista</DialogTitle>
          <DialogDescription>
            Personalize como este produto aparecerá na lista gerada.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Ex: iPhone 13 Pro"
            />
          </div>
          <div className="space-y-2">
            <Label>Detalhes (Specs)</Label>
            <Input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Ex: 128GB Azul"
            />
          </div>
          <div className="space-y-2">
            <Label>Preço (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              O markup global será aplicado sobre este valor.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
