import { ProductList } from '@/components/dashboard/ProductList'
import { ProductFilters } from '@/components/dashboard/ProductFilters'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProductStore } from '@/stores/useProductStore'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const { currentUser } = useAuthStore()
  const {
    products,
    isLoading,
    fetchProducts,
    subscribeToProducts,
    deleteZeroValueProducts,
  } = useProductStore()
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProducts()
    const unsubscribe = subscribeToProducts()
    return () => unsubscribe()
  }, [])

  const canDelete = currentUser?.canDeleteRecords || false

  const handleDeleteZeros = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteZeroValueProducts()
      if (result.success) {
        toast.success('Limpeza concluída com sucesso!')
      } else {
        toast.error(
          `Erro ao limpar: ${result.error?.message || result.error || 'Erro desconhecido'}`,
        )
      }
    } catch (e) {
      toast.error('Erro ao limpar: Erro inesperado ao tentar remover produtos.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Catálogo</h2>
          <p className="text-muted-foreground">
            Gerencie e visualize os produtos disponíveis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProductFilters />

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-2"
                  title="Deletar produtos com valor menor ou igual a R$ 0,00"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar Zerados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Produtos Zerados?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover permanentemente todos os produtos com
                    valor igual ou inferior a R$ 0,00 (ou sem valor definido) do
                    catálogo. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteZeros}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <ProductList products={products} isLoading={isLoading} />
    </div>
  )
}
