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

interface PeripheralDiscountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: { nome: string; valor_desconto: number }
  mode: 'create' | 'edit'
  onSubmit: (nome: string, valor: number) => Promise<boolean>
}

export function PeripheralDiscountDialog({
  open,
  onOpenChange,
  initialData,
  mode,
  onSubmit,
}: PeripheralDiscountDialogProps) {
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.nome)
      setValue(initialData.valor_desconto.toString())
    } else if (open && !initialData) {
      setName('')
      setValue('')
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !value) return

    setIsSubmitting(true)
    const success = await onSubmit(name, parseFloat(value))
    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Adicionar Desconto'
      case 'edit':
        return 'Editar Desconto'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Cadastre um novo desconto para defeitos ou peças.'
                : 'Atualize as informações do desconto.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Defeito / Peça</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tela Quebrada"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Dedução (R$)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
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
