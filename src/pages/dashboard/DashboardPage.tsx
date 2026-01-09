import { useEffect } from 'react'
import { useProductStore } from '@/stores/useProductStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { ProductList } from '@/components/dashboard/ProductList'
import { ProductFilters } from '@/components/dashboard/ProductFilters'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Store, ShoppingCart, Search, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DashboardPage() {
  const {
    products,
    fetchProducts,
    filters,
    setFilters,
    isLoading,
    selectedProductIds,
    subscribeToProducts,
  } = useProductStore()

  const { currentUser } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
    const unsubscribe = subscribeToProducts()

    return () => {
      unsubscribe()
    }
  }, [])

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

        {currentUser?.canCreateList && selectedProductIds.size > 0 && (
          <Button
            onClick={() => navigate('/generator')}
            size="lg"
            className="animate-in fade-in slide-in-from-right-4 bg-primary shadow-lg hover:shadow-xl transition-all"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Gerar Lista
            <Badge
              variant="secondary"
              className="ml-2 bg-white/20 text-white border-0"
            >
              {selectedProductIds.size}
            </Badge>
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border sticky top-16 z-30 transition-all duration-300 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative flex-1 group w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por modelo, categoria, fornecedor..."
              className="pl-10 bg-gray-50/50 focus:bg-white transition-colors"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
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
      </div>
    </div>
  )
}
