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
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function ProductFilters() {
  const { filters, setFilters, resetFilters } = useProductStore()

  // Local state for options
  const [options, setOptions] = useState({
    memories: [] as string[],
    rams: [] as string[],
    colors: [] as string[],
  })

  useEffect(() => {
    // Fetch distinct values for the refined filters
    const fetchOptions = async () => {
      const { data } = await supabase
        .from('produtos')
        .select('memoria, cor, ram')

      if (data) {
        const unique = (key: keyof (typeof data)[0]) =>
          Array.from(
            new Set(data.map((item) => item[key]).filter(Boolean) as string[]),
          ).sort()

        setOptions({
          memories: unique('memoria'),
          rams: unique('ram'),
          colors: unique('cor'),
        })
      }
    }
    fetchOptions()
  }, [])

  const handleReset = () => {
    resetFilters()
  }

  const hasFilters =
    filters.ram !== 'all' || filters.memory !== 'all' || filters.color !== 'all'

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full">
        <Select
          value={filters.ram}
          onValueChange={(val) => setFilters({ ram: val })}
        >
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue placeholder="RAM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas RAM</SelectItem>
            {options.rams.map((r) => (
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
          <SelectTrigger className="w-full sm:w-[130px]">
            <SelectValue placeholder="Memória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda Memória</SelectItem>
            {options.memories.map((m) => (
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
          <SelectTrigger className="w-full sm:w-[130px] col-span-2 sm:col-span-1">
            <SelectValue placeholder="Cor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Cores</SelectItem>
            {options.colors.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="shrink-0 text-muted-foreground hover:text-foreground hidden sm:flex"
            title="Limpar filtros"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {hasFilters && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          className="w-full sm:hidden"
        >
          <X className="w-4 h-4 mr-2" />
          Limpar Filtros
        </Button>
      )}
    </div>
  )
}
