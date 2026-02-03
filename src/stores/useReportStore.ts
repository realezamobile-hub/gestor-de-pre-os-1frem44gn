import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export interface ReportStats {
  totalEvaluations: number
  totalValue: number
  averageValue: number
  conversionRate: number
  topModels: { model: string; count: number; value: number }[]
  evaluationsByDate: { date: string; count: number; value: number }[]
}

interface ReportStore {
  isLoading: boolean
  stats: ReportStats
  dateRange: { from: Date; to: Date }
  setDateRange: (range: { from: Date; to: Date }) => void
  fetchReportData: () => Promise<void>
}

export const useReportStore = create<ReportStore>((set, get) => ({
  isLoading: false,
  dateRange: {
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(new Date()),
  },
  stats: {
    totalEvaluations: 0,
    totalValue: 0,
    averageValue: 0,
    conversionRate: 0,
    topModels: [],
    evaluationsByDate: [],
  },

  setDateRange: (range) => {
    set({ dateRange: range })
    get().fetchReportData()
  },

  fetchReportData: async () => {
    set({ isLoading: true })
    const { dateRange } = get()
    const fromStr = dateRange.from.toISOString()
    const toStr = dateRange.to.toISOString()

    try {
      const { data, error } = await supabase
        .from('avaliacoes_iphone')
        .select('*')
        .gte('created_at', fromStr)
        .lte('created_at', toStr)

      if (error) throw error

      if (!data || data.length === 0) {
        set({
          stats: {
            totalEvaluations: 0,
            totalValue: 0,
            averageValue: 0,
            conversionRate: 0,
            topModels: [],
            evaluationsByDate: [],
          },
          isLoading: false,
        })
        return
      }

      const totalEvaluations = data.length
      const totalValue = data.reduce(
        (acc, curr) => acc + (curr.valor_final || 0),
        0,
      )
      const averageValue =
        totalEvaluations > 0 ? totalValue / totalEvaluations : 0

      const modelMap = new Map<string, { count: number; value: number }>()
      data.forEach((item) => {
        const current = modelMap.get(item.modelo) || { count: 0, value: 0 }
        modelMap.set(item.modelo, {
          count: current.count + 1,
          value: current.value + (item.valor_final || 0),
        })
      })

      const topModels = Array.from(modelMap.entries())
        .map(([model, metrics]) => ({ model, ...metrics }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      const dateMap = new Map<string, { count: number; value: number }>()
      data.forEach((item) => {
        const dateKey = item.created_at.split('T')[0]
        const current = dateMap.get(dateKey) || { count: 0, value: 0 }
        dateMap.set(dateKey, {
          count: current.count + 1,
          value: current.value + (item.valor_final || 0),
        })
      })

      const evaluationsByDate = Array.from(dateMap.entries())
        .map(([date, metrics]) => ({ date, ...metrics }))
        .sort((a, b) => a.date.localeCompare(b.date))

      set({
        stats: {
          totalEvaluations,
          totalValue,
          averageValue,
          conversionRate: 0,
          topModels,
          evaluationsByDate,
        },
        isLoading: false,
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
      set({ isLoading: false })
    }
  },
}))
