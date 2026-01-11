import { useProductStore } from '@/stores/useProductStore'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { FilterX, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { MultiSelect } from '@/components/MultiSelect'
import { useDebounce } from '@/hooks/use-debounce'

export function ProductFilters() {
  const { filters, setFilters, resetFilters, categories, fetchCategories } =
    useProductStore()

  // Local state for debouncing search
  const [localSearch, setLocalSearch] = useState(filters.search)
  const debouncedSearch = useDebounce(localSearch, 300)

  // Sync local state with global filter changes (e.g. clear filters)
  useEffect(() => {
    setLocalSearch(filters.search)
  }, [filters.search])

  // Update store when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch })
    }
  }, [debouncedSearch, setFilters, filters.search])

  // Local state for other dropdown options
  const [options, setOptions] = useState({
    memories: [] as string[],
    colors: [] as string[],
    conditions: [] as string[],
    suppliers: [] as string[],
    batteries: [] as string[],
  })

  useEffect(() => {
    fetchCategories()
    // Fetch distinct values for other filters
    const fetchOptions = async () => {
      const { data } = await supabase
        .from('produtos')
        .select('memoria, cor, estado, fornecedor, bateria')

      if (data) {
        const unique = (key: keyof (typeof data)[0]) =>
          Array.from(
            new Set(data.map((item) => item[key]).filter(Boolean) as string[]),
          ).sort()

        setOptions({
          memories: unique('memoria'),
          colors: unique('cor'),
          conditions: unique('estado'),
          suppliers: unique('fornecedor'),
          batteries: unique('bateria'),
        })
      }
    }
    fetchOptions()
  }, [])

  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => {
    if (Array.isArray(v)) return v.length > 0
    return v !== 'all' && v !== '' && v !== false
  }).length

  const handleReset = () => {
    setLocalSearch('')
    resetFilters()
  }

  return (
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
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
          <SheetDescription>
            Refine sua busca por características específicas.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label>Buscar Produto</Label>
            <Input
              placeholder="Ex: iPhone 15, Apple, Dourado..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">
              Busca em: modelo, categoria, cor, memória, ram, fornecedor, obs.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Categorias</Label>
            <MultiSelect
              options={categories}
              selected={filters.category}
              onChange={(selected) => setFilters({ category: selected })}
              placeholder="Selecione as categorias"
            />
          </div>

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
                  {options.memories.map((m) => (
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
                  {options.colors.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  {options.conditions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Saúde da Bateria</Label>
              <Select
                value={filters.battery}
                onValueChange={(val) => setFilters({ battery: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {options.batteries.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <Select
              value={filters.supplier}
              onValueChange={(val) => setFilters({ supplier: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {options.suppliers.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
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
            onClick={handleReset}
          >
            <FilterX className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
