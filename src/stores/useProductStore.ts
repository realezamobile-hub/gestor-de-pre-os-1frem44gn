import { create } from 'zustand'
import { Product, FilterState } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { startOfToday, startOfDay, subDays, endOfDay } from 'date-fns'
import { toast } from 'sonner'

interface ProductStore {
  products: Product[]
  isLoading: boolean
  filters: FilterState
  selectedProductIds: Set<number>
  categories: string[]

  // Pagination
  page: number
  pageSize: number
  total: number

  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  setPage: (page: number) => void
  fetchProducts: () => Promise<void>
  fetchCategories: () => Promise<void>
  generateList: (date: Date | null, categories: string[]) => Promise<void>
  toggleProductSelection: (productId: number) => void
  clearSelection: () => void
  getSelectedProducts: () => Product[]
  subscribeToProducts: () => () => void
}

const INITIAL_FILTERS: FilterState = {
  search: '',
  category: [],
  memory: 'all',
  color: 'all',
  condition: 'all',
  supplier: 'all',
  battery: 'all',
  inStockOnly: false,
  dateRange: 'all',
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: false,
  filters: INITIAL_FILTERS,
  selectedProductIds: new Set(),
  categories: [],
  page: 0,
  pageSize: 50, // Updated to 50 as per requirements
  total: 0,

  setFilters: (newFilters) => {
    // Reset page to 0 when filters change
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 0,
    }))
    get().fetchProducts()
  },

  resetFilters: () => {
    set({ filters: INITIAL_FILTERS, page: 0 })
    get().fetchProducts()
  },

  setPage: (page) => {
    set({ page })
    get().fetchProducts()
  },

  fetchProducts: async () => {
    set({ isLoading: true })
    const { filters, page, pageSize } = get()

    let query = supabase
      .from('produtos')
      .select('*', { count: 'exact' })
      .order('valor', { ascending: true })

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.trim()
      if (searchTerm) {
        query = query.or(
          `modelo.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,fornecedor.ilike.%${searchTerm}%`,
        )
      }
    }

    if (filters.category && filters.category.length > 0) {
      query = query.in('categoria', filters.category)
    }

    if (filters.memory && filters.memory !== 'all') {
      query = query.eq('memoria', filters.memory)
    }

    if (filters.color && filters.color !== 'all') {
      query = query.eq('cor', filters.color)
    }

    if (filters.condition && filters.condition !== 'all') {
      query = query.eq('estado', filters.condition)
    }

    if (filters.supplier && filters.supplier !== 'all') {
      query = query.eq('fornecedor', filters.supplier)
    }

    if (filters.battery && filters.battery !== 'all') {
      query = query.eq('bateria', filters.battery)
    }

    if (filters.inStockOnly) {
      query = query.eq('em_estoque', true)
    }

    // Date Range Logic
    if (filters.dateRange === 'today') {
      const today = startOfToday().toISOString()
      query = query.gte('criado_em', today)
    } else if (filters.dateRange === 'last_2_days') {
      const twoDaysAgo = startOfDay(subDays(new Date(), 1)).toISOString()
      query = query.gte('criado_em', twoDaysAgo)
    }

    // Pagination
    const from = page * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (!error && data) {
      set({ products: data, total: count || 0, isLoading: false })
    } else {
      console.error('Error fetching products:', error)
      set({ products: [], total: 0, isLoading: false })
    }
  },

  fetchCategories: async () => {
    const { data } = await supabase
      .from('produtos')
      .select('categoria')
      .not('categoria', 'is', null)

    if (data) {
      const uniqueCategories = Array.from(
        new Set(data.map((item) => item.categoria).filter(Boolean) as string[]),
      ).sort()
      set({ categories: uniqueCategories })
    }
  },

  generateList: async (date, categories) => {
    set({ isLoading: true })

    try {
      let query = supabase
        .from('produtos')
        .select('*')
        .order('valor', { ascending: true })

      if (date) {
        // Filter by specific date (entire day)
        const start = startOfDay(date).toISOString()
        const end = endOfDay(date).toISOString()
        query = query.gte('criado_em', start).lte('criado_em', end)
      }

      if (categories && categories.length > 0) {
        query = query.in('categoria', categories)
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        if (data.length === 0) {
          toast.info('Nenhum produto encontrado com os filtros selecionados.')
        } else {
          set((state) => {
            // Merge new products into existing products to ensure they are available
            const existingIds = new Set(state.products.map((p) => p.id))
            const newProducts = [...state.products]
            data.forEach((p) => {
              if (!existingIds.has(p.id)) {
                newProducts.push(p)
              }
            })

            // Set selection to ONLY the generated items
            const newSelection = new Set(data.map((p) => p.id))

            toast.success(`${data.length} produtos adicionados à lista!`)

            return {
              products: newProducts,
              selectedProductIds: newSelection,
            }
          })
        }
      }
    } catch (error) {
      console.error('Error generating list:', error)
      toast.error('Erro ao gerar a lista. Tente novamente.')
    } finally {
      set({ isLoading: false })
    }
  },

  toggleProductSelection: (productId) =>
    set((state) => {
      const newSelection = new Set(state.selectedProductIds)
      if (newSelection.has(productId)) {
        newSelection.delete(productId)
      } else {
        newSelection.add(productId)
      }
      return { selectedProductIds: newSelection }
    }),

  clearSelection: () => set({ selectedProductIds: new Set() }),

  getSelectedProducts: () => {
    const { products, selectedProductIds } = get()
    // Returns products that are currently in the store and selected
    return products.filter((p) => selectedProductIds.has(p.id))
  },

  subscribeToProducts: () => {
    const channel = supabase
      .channel('public:produtos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produtos' },
        () => {
          get().fetchProducts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
