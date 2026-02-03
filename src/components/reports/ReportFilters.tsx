import { useReportStore } from '@/stores/useReportStore'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, RefreshCw } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function ReportFilters() {
  const { dateRange, setDateRange, fetchReportData, isLoading } =
    useReportStore()
  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[280px] justify-start text-left font-normal',
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

      <Button
        variant="secondary"
        onClick={() => fetchReportData()}
        disabled={isLoading}
      >
        <RefreshCw
          className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')}
        />
        Atualizar
      </Button>
    </div>
  )
}
