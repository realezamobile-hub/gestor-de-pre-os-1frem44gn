import { useState, useEffect } from 'react'
import { useProductStore } from '@/stores/useProductStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MultiSelect } from '@/components/MultiSelect'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'

interface ProductFiltersProps {
  className?: string
}

export function ProductFilters({ className }: ProductFiltersProps) {
  const {
    filters,
    setFilters,
    resetFilters,
    filterOptions,
    categories,
    fetchCategories,
  } = useProductStore()
  const [supplierTerm, setSupplierTerm] = useState(filters.supplier || '')

  // Reduced debounce time for better responsiveness
  const debouncedSupplier = useDebounce(supplierTerm, 300)

  // Sync local state when filters are reset externally
  useEffect(() => {
    setSupplierTerm(filters.supplier || '')
  }, [filters.supplier])

  // Sync store when debounced value changes
  useEffect(() => {
    // Avoid triggering if it's the same (to prevent loop or double fetch)
    if (debouncedSupplier !== (filters.supplier || '')) {
      setFilters({ supplier: debouncedSupplier })
    }
  }, [debouncedSupplier, filters.supplier, setFilters])

  // Fetch categories on mount if not available
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [categories.length, fetchCategories])

  const handleReset = () => {
    resetFilters()
  }

  // Check if any filter is active, including search text
  const hasFilters =
    (filters.search && filters.search.trim() !== '') ||
    filters.ram !== 'all' ||
    filters.memory !== 'all' ||
    filters.color !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.categories.length > 0 ||
    !!filters.supplier

  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row gap-2 w-full items-start lg:items-center',
        className,
      )}
    >
      {/* Date Toggle Filters - Grouped for compactness */}
      <div className="flex items-center bg-muted/50 p-1 rounded-md shrink-0">
        <Button
          variant={filters.dateRange === 'today' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilters({ dateRange: 'today' })}
          className="h-7 px-3 text-xs"
        >
          Hoje
        </Button>
        <Button
          variant={filters.dateRange === 'yesterday' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilters({ dateRange: 'yesterday' })}
          className="h-7 px-3 text-xs"
        >
          Ontem
        </Button>
        <Button
          variant={filters.dateRange === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilters({ dateRange: 'all' })}
          className="h-7 px-3 text-xs"
        >
          Todos
        </Button>
      </div>

      <div className="w-px h-6 bg-border hidden lg:block mx-1" />

      {/* Selects Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2 w-full lg:w-auto flex-1 items-center">
        <Select
          value={filters.ram}
          onValueChange={(val) => setFilters({ ram: val })}
        >
          <SelectTrigger className="h-9 w-full lg:w-[100px] text-xs">
            <SelectValue placeholder="RAM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filterOptions.rams.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.memory}
          onValueChange={(val) => setFilters({ memory: val })}
        >
          <SelectTrigger className="h-9 w-full lg:w-[110px] text-xs">
            <SelectValue placeholder="Memória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filterOptions.memories.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.color}
          onValueChange={(val) => setFilters({ color: val })}
        >
          <SelectTrigger className="h-9 w-full lg:w-[110px] text-xs">
            <SelectValue placeholder="Cor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filterOptions.colors.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-full lg:w-[150px]">
          <MultiSelect
            options={categories}
            selected={filters.categories}
            onChange={(val) => setFilters({ categories: val })}
            placeholder="Categorias"
            className="h-9 text-xs"
          />
        </div>

        <Input
          placeholder="Pesquisar fornecedor..."
          value={supplierTerm}
          onChange={(e) => setSupplierTerm(e.target.value)}
          className="h-9 w-full lg:w-[150px] text-xs"
        />

        {hasFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            className="h-9 px-3 text-secondary-foreground hover:bg-secondary/80 shrink-0 col-span-2 sm:col-span-1 lg:col-span-auto font-normal"
            title="Limpar todos os filtros"
          >
            <X className="w-4 h-4 mr-1.5" />
            <span>Limpar Filtros</span>
          </Button>
        )}
      </div>
    </div>
  )
}
