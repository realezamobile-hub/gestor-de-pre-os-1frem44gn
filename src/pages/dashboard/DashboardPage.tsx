import { useProductStore } from '@/stores/useProductStore'
import { useAuthStore } from '@/stores/useAuthStore'
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
import {
  Search,
  ShoppingCart,
  FilterX,
  Store,
  SlidersHorizontal,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function DashboardPage() {
  const {
    products,
    suppliers,
    setFilters,
    resetFilters,
    getFilteredProducts,
    selectedProducts,
    filters,
  } = useProductStore()

  const { currentUser } = useAuthStore()
  const navigate = useNavigate()
  const filteredProducts = getFilteredProducts()

  // Extract unique values for filters
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort()
  const categories = Array.from(new Set(products.map((p) => p.category))).sort()
  const models = Array.from(new Set(products.map((p) => p.model))).sort()
  const memories = Array.from(
    new Set(products.map((p) => p.memory).filter(Boolean)),
  ).sort() as string[]
  const colors = Array.from(
    new Set(products.map((p) => p.color).filter(Boolean)),
  ).sort() as string[]
  const conditions = Array.from(
    new Set(products.map((p) => p.condition)),
  ).sort()

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== 'all' && v !== '' && v !== false,
  ).length

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            Painel de Preços
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
            Compare preços em tempo real entre {suppliers.length} fornecedores e
            encontre as melhores ofertas.
          </p>
        </div>

        {currentUser?.canCreateList && selectedProducts.length > 0 && (
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

      <div className="bg-white p-4 rounded-xl shadow-sm border sticky top-16 z-30 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por nome, modelo, marca..."
              className="pl-10 bg-gray-50/50 focus:bg-white transition-colors"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex gap-2 min-w-[120px]">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros Avançados</SheetTitle>
                  <SheetDescription>
                    Refine sua busca por características específicas.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  {/* Brand & Category */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Select
                        value={filters.brand}
                        onValueChange={(val) => setFilters({ brand: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {brands.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={filters.category}
                        onValueChange={(val) => setFilters({ category: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Model */}
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Select
                      value={filters.model}
                      onValueChange={(val) => setFilters({ model: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {models.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specs: Memory, Color, Condition */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Memória</Label>
                      <Select
                        value={filters.memory}
                        onValueChange={(val) => setFilters({ memory: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {memories.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Cor</Label>
                      <Select
                        value={filters.color}
                        onValueChange={(val) => setFilters({ color: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {colors.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Condição</Label>
                    <Select
                      value={filters.condition}
                      onValueChange={(val) => setFilters({ condition: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {conditions.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fornecedor</Label>
                    <Select
                      value={filters.supplierId}
                      onValueChange={(val) => setFilters({ supplierId: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStockOnly}
                      onCheckedChange={(checked) =>
                        setFilters({ inStockOnly: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="inStock"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Apenas em estoque
                    </Label>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={resetFilters}
                  >
                    <FilterX className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={resetFilters}
                title="Limpar todos filtros"
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <FilterX className="w-4 h-4" />
              </Button>
            )}
          </div>
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
          <Button variant="link" className="mt-4" onClick={resetFilters}>
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
