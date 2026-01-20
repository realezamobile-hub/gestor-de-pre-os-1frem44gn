import { useProductStore } from '@/stores/useProductStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductFiltersProps {
  className?: string
}

export function ProductFilters({ className }: ProductFiltersProps) {
  const { filters, setFilters, resetFilters, filterOptions } = useProductStore()

  const handleReset = () => {
    resetFilters()
  }

  const hasFilters =
    filters.ram !== 'all' ||
    filters.memory !== 'all' ||
    filters.color !== 'all' ||
    filters.dateRange !== 'all'

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
      <div className="grid grid-cols-3 lg:flex gap-2 w-full lg:w-auto flex-1">
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

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 px-2 text-muted-foreground hover:text-foreground shrink-0"
            title="Limpar filtros"
          >
            <X className="w-4 h-4" />
            <span className="lg:hidden ml-2">Limpar</span>
          </Button>
        )}
      </div>
    </div>
  )
}
