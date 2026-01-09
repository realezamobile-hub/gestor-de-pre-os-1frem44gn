import { useEffect } from 'react'
import { useProductStore } from '@/stores/useProductStore'
import { ProductCard } from '@/components/dashboard/ProductCard'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, ShoppingCart, FilterX, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const {
    products,
    suppliers,
    setFilters,
    getFilteredProducts,
    selectedProducts,
    filters,
  } = useProductStore()

  const navigate = useNavigate()
  const filteredProducts = getFilteredProducts()

  // Get unique brands and categories for filters
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort()
  const categories = Array.from(new Set(products.map((p) => p.category))).sort()

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            Painel de Preços
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
            Compare preços em tempo real entre {suppliers.length} fornecedores
            conectados e encontre as melhores ofertas para o seu negócio.
          </p>
        </div>

        {selectedProducts.length > 0 && (
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
              {selectedProducts.length}
            </Badge>
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 sticky top-16 z-30 transition-all duration-300">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar produto por nome, modelo..."
            className="pl-10 bg-gray-50/50 focus:bg-white transition-colors"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Select
            value={filters.brand}
            onValueChange={(val) => setFilters({ brand: val })}
          >
            <SelectTrigger className="w-[160px] bg-gray-50/50">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Marcas</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(val) => setFilters({ category: val })}
          >
            <SelectTrigger className="w-[160px] bg-gray-50/50">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filters.search ||
            filters.brand !== 'all' ||
            filters.category !== 'all') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setFilters({ search: '', brand: 'all', category: 'all' })
              }
              title="Limpar filtros"
              className="text-muted-foreground hover:text-destructive"
            >
              <FilterX className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-dashed animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">
            Não encontramos produtos correspondentes aos filtros selecionados.
          </p>
          <Button
            variant="link"
            className="mt-4"
            onClick={() =>
              setFilters({ search: '', brand: 'all', category: 'all' })
            }
          >
            Limpar todos os filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              suppliers={suppliers}
            />
          ))}
        </div>
      )}
    </div>
  )
}
