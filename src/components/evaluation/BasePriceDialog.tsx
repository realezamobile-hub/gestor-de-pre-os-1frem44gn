import { useState, useEffect } from 'react'
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
import { Loader2 } from 'lucide-react'
import { BasePriceConfig } from '@/types'

interface BasePriceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: BasePriceConfig
  mode: 'create' | 'edit' | 'duplicate'
  onSubmit: (modelo: string, preco: number) => Promise<boolean>
}

export function BasePriceDialog({
  open,
  onOpenChange,
  initialData,
  mode,
  onSubmit,
}: BasePriceDialogProps) {
  const [modelo, setModelo] = useState('')
  const [preco, setPreco] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && initialData) {
      setModelo(
        mode === 'duplicate'
          ? `${initialData.modelo} (Cópia)`
          : initialData.modelo,
      )
      setPreco(initialData.preco_base.toString())
    } else if (open && !initialData) {
      setModelo('')
      setPreco('')
    }
  }, [open, initialData, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modelo.trim() || !preco) return

    const precoNum = parseFloat(preco)
    if (isNaN(precoNum)) return

    setIsSubmitting(true)
    const success = await onSubmit(modelo.trim(), precoNum)
    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  const getTitle = () => {
    if (mode === 'create') return 'Novo Modelo'
    if (mode === 'edit') return 'Editar Modelo'
    return 'Duplicar Modelo'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogDescription>
              {mode === 'edit'
                ? 'Atualize os dados do modelo.'
                : 'Defina o nome e o preço base para o novo modelo.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ex: iPhone 13 Pro Max"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preco">Preço Base (R$)</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
