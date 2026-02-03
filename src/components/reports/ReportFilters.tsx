import { useReportStore } from '@/stores/useReportStore'
import { useEvaluationStore } from '@/stores/useEvaluationStore'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarIcon, RefreshCw, Filter } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export function ReportFilters() {
  const {
    dateRange,
    setDateRange,
    fetchReportData,
    isLoading,
    filters,
    setFilters,
  } = useReportStore()
  const { basePrices, fetchConfigs } = useEvaluationStore()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const handleQuickSelect = (type: 'today' | 'week' | 'month') => {
    const today = new Date()
    let from = today
    let to = today

    if (type === 'today') {
      from = today
      to = today
    } else if (type === 'week') {
      from = subDays(today, 7)
    } else if (type === 'month') {
      from = startOfMonth(today)
      to = endOfMonth(today)
    }

    setDateRange({ from, to })
    setIsOpen(false)
  }

  const handleModelChange = (val: string) => {
    setFilters({ model: val })
  }

  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 mb-2 border-b pb-2 text-sm font-medium text-gray-500">
        <Filter className="w-4 h-4" /> Filtros
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <Label>Período</Label>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                      {format(dateRange.to, 'dd/MM/yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Selecione o período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 border-b flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickSelect('today')}
                >
                  Hoje
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickSelect('week')}
                >
                  7 Dias
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickSelect('month')}
                >
                  Este Mês
                </Button>
              </div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange as any}
                onSelect={(range) =>
                  range?.from &&
                  setDateRange({ from: range.from, to: range.to || range.from })
                }
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Modelo</Label>
          <Select value={filters.model} onValueChange={handleModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os modelos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os modelos</SelectItem>
              {basePrices.map((model) => (
                <SelectItem key={model.id} value={model.modelo}>
                  {model.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Min (R$)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={filters.minValue || ''}
              onChange={(e) =>
                setFilters({ minValue: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Max (R$)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.maxValue || ''}
              onChange={(e) =>
                setFilters({ maxValue: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => fetchReportData()}
          disabled={isLoading}
          className="w-full"
        >
          <RefreshCw
            className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')}
          />
          Atualizar Relatório
        </Button>
      </div>
    </div>
  )
}
