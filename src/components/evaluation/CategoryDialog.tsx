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
import { ChecklistCategory } from '@/types'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ChecklistCategory
  mode: 'create' | 'edit'
  onSubmit: (name: string) => Promise<boolean>
}

export function CategoryDialog({
  open,
  onOpenChange,
  initialData,
  mode,
  onSubmit,
}: CategoryDialogProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name)
    } else if (open && !initialData) {
      setName('')
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    const success = await onSubmit(name.trim())
    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  const getTitle = () => {
    return mode === 'create' ? 'Nova Categoria' : 'Editar Categoria'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Crie uma nova categoria para agrupar itens do checklist.'
                : 'Renomeie a categoria existente.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Aparência, Hardware..."
                autoFocus
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
