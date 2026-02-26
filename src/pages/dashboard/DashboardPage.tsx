import { ProductList } from '@/components/dashboard/ProductList'
import { ProductFilters } from '@/components/dashboard/ProductFilters'
import { ProductPagination } from '@/components/dashboard/ProductPagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProductStore } from '@/stores/useProductStore'
import { useDebounce } from '@/hooks/use-debounce'
import { Search, ListChecks } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const {
    products,
    isLoading,
    fetchProducts,
    fetchFilterOptions,
    fetchDraftItems,
    subscribeToProducts,
    setFilters,
    filters,
    draftItems,
  } = useProductStore()
  const [searchTerm, setSearchTerm] = useState(filters.search)

  // Sync internal state with store state if it changes externally (e.g. Clear Filters)
  useEffect(() => {
    setSearchTerm(filters.search)
  }, [filters.search])

  const debouncedSearch = useDebounce(searchTerm, 300)

  // Sync store when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, setFilters])

  useEffect(() => {
    fetchProducts()
    fetchFilterOptions()
    fetchDraftItems()
    const unsubscribe = subscribeToProducts()

    return () => unsubscribe()
  }, [currentUser?.companyId])

  const canCreateList = currentUser?.canCreateList || false

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
      <div className="shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 border-b space-y-3 px-1 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <h2 className="text-xl font-bold tracking-tight hidden lg:block text-nowrap">
              Catálogo
            </h2>

            {/* Compact Search and Filter Bar Row */}
            <div className="flex flex-col md:flex-row gap-2 w-full items-center">
              <div className="relative w-full md:w-56 lg:w-64 shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar modelo..."
                  className="pl-8 h-9 text-sm bg-background w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="w-full md:w-auto flex-1 overflow-x-auto">
                <ProductFilters />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0">
            {canCreateList && (
              <Button
                size="sm"
                onClick={() => navigate('/generator')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-9"
              >
                <ListChecks className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Gerar Lista</span>
                {draftItems.length > 0 && (
                  <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded text-xs font-semibold">
                    {draftItems.length}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-1">
        <ProductList products={products} isLoading={isLoading} />
      </div>

      <div className="shrink-0 border-t bg-background p-2">
        <ProductPagination />
      </div>
    </div>
  )
}
