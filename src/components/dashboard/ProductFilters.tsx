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

export function ProductFilters() {
  const { filters, setFilters, resetFilters } = useProductStore()

  // Local state for dropdown options
  const [options, setOptions] = useState({
    categories: [] as string[],
    memories: [] as string[],
    colors: [] as string[],
    conditions: [] as string[],
    suppliers: [] as string[],
  })

  useEffect(() => {
    // Fetch distinct values for filters
    const fetchOptions = async () => {
      const { data } = await supabase
        .from('produtos')
        .select('categoria, memoria, cor, estado, fornecedor')

      if (data) {
        const unique = (key: keyof (typeof data)[0]) =>
          Array.from(
            new Set(data.map((item) => item[key]).filter(Boolean) as string[]),
          ).sort()

        setOptions({
          categories: unique('categoria'),
          memories: unique('memoria'),
          colors: unique('cor'),
          conditions: unique('estado'),
          suppliers: unique('fornecedor'),
        })
      }
    }
    fetchOptions()
  }, [])

  const activeFiltersCount = Object.entries(filters).filter(
    ([k, v]) => v !== 'all' && v !== '' && v !== false,
  ).length

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
            <Label>Buscar Modelo</Label>
            <Input
              placeholder="Ex: iPhone 15"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
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
                {options.categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            onClick={resetFilters}
          >
            <FilterX className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
