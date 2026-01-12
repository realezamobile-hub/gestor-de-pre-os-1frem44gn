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

interface BasePriceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: { modelo: string; preco_base: number }
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
  const [model, setModel] = useState('')
  const [price, setPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && initialData) {
      setModel(initialData.modelo)
      setPrice(initialData.preco_base.toString())
    } else if (open && !initialData) {
      setModel('')
      setPrice('')
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!model || !price) return

    setIsSubmitting(true)
    const success = await onSubmit(model, parseFloat(price))
    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Adicionar Modelo'
      case 'edit':
        return 'Editar Modelo'
      case 'duplicate':
        return 'Duplicar Modelo'
    }
  }

  const getDescription = () => {
    switch (mode) {
      case 'create':
        return 'Cadastre um novo modelo e seu preço base.'
      case 'edit':
        return 'Atualize as informações do modelo.'
      case 'duplicate':
        return 'Crie uma cópia modificada do modelo selecionado.'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogDescription>{getDescription()}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: iPhone 14 128GB"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Preço Base (R$)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
