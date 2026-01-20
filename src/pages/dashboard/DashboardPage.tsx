import { ProductList } from '@/components/dashboard/ProductList'
import { ProductFilters } from '@/components/dashboard/ProductFilters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProductStore } from '@/stores/useProductStore'
import { useDebounce } from '@/hooks/use-debounce'
import { Trash2, Search } from 'lucide-react'
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
    setFilters,
    filters,
  } = useProductStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState(filters.search)

  // Sync internal state with store state if it changes externally
  useEffect(() => {
    setSearchTerm(filters.search)
  }, [filters.search])

  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    // Only update if value is different to avoid loops/unnecessary fetches
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch })
    }
  }, [debouncedSearch, setFilters, filters.search])

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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold tracking-tight">Catálogo</h2>
            <p className="text-muted-foreground hidden md:block">
              Gerencie e visualize os produtos disponíveis.
            </p>
          </div>

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="whitespace-nowrap w-full md:w-auto"
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

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 w-full lg:max-w-xl">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por modelo (ex: iPhone 13)..."
              className="pl-8 w-full bg-background h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 lg:flex-none">
            <ProductFilters />
          </div>
        </div>
      </div>

      <ProductList products={products} isLoading={isLoading} />
    </div>
  )
}
