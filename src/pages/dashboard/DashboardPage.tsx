import { useEffect, useState } from 'react'
import { useProductStore } from '@/stores/useProductStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { ProductList } from '@/components/dashboard/ProductList'
import { ProductFilters } from '@/components/dashboard/ProductFilters'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Store,
  ShoppingCart,
  Search,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/use-debounce'
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

export default function DashboardPage() {
  const {
    products,
    fetchProducts,
    filters,
    setFilters,
    isLoading,
    selectedProductIds,
    fetchDraftItems,
    subscribeToProducts,
    page,
    pageSize,
    total,
    setPage,
    deleteZeroValueProducts,
  } = useProductStore()

  const { currentUser } = useAuthStore()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState(filters.search)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [isDeletingZero, setIsDeletingZero] = useState(false)

  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      setFilters({ search: debouncedSearchTerm })
    }
  }, [debouncedSearchTerm, setFilters])

  useEffect(() => {
    if (filters.search !== debouncedSearchTerm) {
      setSearchTerm(filters.search)
    }
  }, [filters.search])

  useEffect(() => {
    fetchProducts()
    fetchDraftItems() // Fetch user draft items on load
    const unsubscribe = subscribeToProducts()

    return () => {
      unsubscribe()
    }
  }, [])

  const handleCleanupZero = async () => {
    setIsDeletingZero(true)
    const result = await deleteZeroValueProducts()
    setIsDeletingZero(false)
    if (result.success) {
      toast.success(`${result.count} produtos com valor zero foram removidos.`)
    } else {
      toast.error('Erro ao limpar produtos.')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            Catálogo de Produtos
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
            Visualize e filtre o inventário em tempo real.
          </p>
        </div>

        {currentUser?.canCreateList && (
          <Button
            onClick={() => navigate('/generator')}
            size="lg"
            className="animate-in fade-in slide-in-from-right-4 bg-primary shadow-lg hover:shadow-xl transition-all"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Gerar Lista
            {selectedProductIds.size > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-white/20 text-white border-0"
              >
                {selectedProductIds.size}
              </Badge>
            )}
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border sticky top-16 z-30 transition-all duration-300 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative flex-1 group w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por modelo, memória, cor (ex: iPhone 15 256 Azul)..."
              className="pl-10 bg-gray-50/50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
          </div>

          <Tabs
            value={filters.dateRange}
            onValueChange={(val) => setFilters({ dateRange: val as any })}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="today">Hoje</TabsTrigger>
              <TabsTrigger value="last_2_days">2 Dias</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2 w-full md:w-auto justify-end">
            <ProductFilters />

            {currentUser?.canCreateList && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Limpar produtos com valor R$ 0,00"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Limpar produtos sem preço?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso excluirá permanentemente todos os produtos com valor{' '}
                      <strong>R$ 0,00</strong>. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCleanupZero}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeletingZero}
                    >
                      {isDeletingZero ? 'Removendo...' : 'Sim, excluir'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchProducts()}
              title="Atualizar"
            >
              <RefreshCcw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className={isLoading ? 'opacity-70 transition-opacity' : ''}>
        <ProductList products={products} isLoading={isLoading} />

        {/* Pagination Controls */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-gray-500">
            Mostrando {products.length > 0 ? page * pageSize + 1 : 0} até{' '}
            {Math.min((page + 1) * pageSize, total)} de {total} produtos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {page + 1} de {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
