import { create } from 'zustand'
import {
  Product,
  FilterState,
  ExcludedSupplier,
  PriceMonitorItem,
} from '@/types'
import { supabase } from '@/lib/supabase/client'
import { startOfToday, startOfDay, subDays, endOfDay } from 'date-fns'
import { toast } from 'sonner'

interface ProductStore {
  products: Product[]
  monitorItems: PriceMonitorItem[]
  excludedSuppliers: ExcludedSupplier[]
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

  // Admin Features
  fetchExcludedSuppliers: () => Promise<void>
  addExcludedSupplier: (
    name: string | null,
    phone: string | null,
  ) => Promise<{ success: boolean; error?: any }>
  removeExcludedSupplier: (
    id: string,
  ) => Promise<{ success: boolean; error?: any }>
  fetchPriceMonitor: () => Promise<void>
  clearAllProducts: () => Promise<{ success: boolean; error?: any }>
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

// Helper to cast table name for views since they are not in Database types
const VIEW_PRODUCTS = 'v_produtos_visiveis' as any
const VIEW_MONITOR = 'v_monitor_precos' as any

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  monitorItems: [],
  excludedSuppliers: [],
  isLoading: false,
  filters: INITIAL_FILTERS,
  selectedProductIds: new Set(),
  categories: [],
  page: 0,
  pageSize: 50,
  total: 0,

  setFilters: (newFilters) => {
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

    try {
      // Calculate date filter for RPC
      let minDate: string | null = null
      if (filters.dateRange === 'today') {
        minDate = startOfToday().toISOString()
      } else if (filters.dateRange === 'last_2_days') {
        minDate = startOfDay(subDays(new Date(), 1)).toISOString()
      }

      // Use the RPC for enhanced search and filtering
      // This allows multi-column search and relevance sorting (Model matches first)
      const { data, error, count } = await supabase
        .rpc(
          'search_products',
          {
            search_query: filters.search.trim() || null,
            category_filters:
              filters.category.length > 0 ? filters.category : null,
            memory_filter: filters.memory !== 'all' ? filters.memory : null,
            color_filter: filters.color !== 'all' ? filters.color : null,
            condition_filter:
              filters.condition !== 'all' ? filters.condition : null,
            supplier_filter:
              filters.supplier !== 'all' ? filters.supplier : null,
            battery_filter: filters.battery !== 'all' ? filters.battery : null,
            in_stock_only: filters.inStockOnly || null,
            min_date: minDate,
          },
          { count: 'exact' },
        )
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (!error && data) {
        set({ products: data, total: count || 0, isLoading: false })
      } else {
        console.error('Error fetching products:', error)
        set({ products: [], total: 0, isLoading: false })
      }
    } catch (e) {
      console.error('Unexpected error fetching products', e)
      set({ products: [], total: 0, isLoading: false })
    }
  },

  fetchCategories: async () => {
    const { data } = await supabase
      .from(VIEW_PRODUCTS)
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
        .from(VIEW_PRODUCTS)
        .select('*')
        .order('valor', { ascending: true })

      if (date) {
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
            const existingIds = new Set(state.products.map((p) => p.id))
            const newProducts = [...state.products]
            data.forEach((p) => {
              if (!existingIds.has(p.id)) {
                newProducts.push(p)
              }
            })
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
    return products.filter((p) => selectedProductIds.has(p.id))
  },

  subscribeToProducts: () => {
    // Listen to changes in the 'produtos' table, but fetch from the view
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

  // Admin Features Implementation

  fetchExcludedSuppliers: async () => {
    const { data, error } = await supabase
      .from('fornecedores_excluidos')
      .select('*')
      .order('criado_em', { ascending: false })

    if (!error && data) {
      set({ excludedSuppliers: data })
    }
  },

  addExcludedSupplier: async (name, phone) => {
    if (!name && !phone)
      return { success: false, error: { message: 'Dados inválidos' } }

    const { error } = await supabase
      .from('fornecedores_excluidos')
      .insert({ nome: name || null, telefone: phone || null })

    if (error) return { success: false, error }
    await get().fetchExcludedSuppliers()
    // Refresh products as they might be filtered now
    get().fetchProducts()
    return { success: true }
  },

  removeExcludedSupplier: async (id) => {
    const { error } = await supabase
      .from('fornecedores_excluidos')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error }
    await get().fetchExcludedSuppliers()
    // Refresh products as they might reappear
    get().fetchProducts()
    return { success: true }
  },

  fetchPriceMonitor: async () => {
    const { data, error } = await supabase
      .from(VIEW_MONITOR)
      .select('*')
      .order('modelo', { ascending: true })

    if (!error && data) {
      set({ monitorItems: data })
    }
  },

  clearAllProducts: async () => {
    const { error } = await supabase.from('produtos').delete().neq('id', 0) // Delete all

    if (error) return { success: false, error }

    set({ products: [], total: 0, monitorItems: [] })
    return { success: true }
  },
}))
