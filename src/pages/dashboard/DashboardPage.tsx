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

export default function DashboardPage() {
  const {
    products,
    fetchProducts,
    filters,
    setFilters,
    isLoading,
    selectedProductIds,
  } = useProductStore()

  const { currentUser } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()

    // Subscribe to realtime updates for products
    // (Optional: Implement supabase realtime subscription here if needed)
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

      <div className="bg-white p-4 rounded-xl shadow-sm border sticky top-16 z-30 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por modelo, obs..."
              className="pl-10 bg-gray-50/50 focus:bg-white transition-colors"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
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

      <ProductList products={products} />

      {isLoading && products.length === 0 && (
        <div className="flex justify-center py-12">
          <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}
