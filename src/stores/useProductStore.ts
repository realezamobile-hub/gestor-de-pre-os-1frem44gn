import { create } from 'zustand'
import { Product, FilterState } from '@/types'
import { supabase } from '@/lib/supabase/client'

interface ProductStore {
  products: Product[]
  isLoading: boolean
  filters: FilterState
  selectedProductIds: Set<number>

  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  fetchProducts: () => Promise<void>
  toggleProductSelection: (productId: number) => void
  clearSelection: () => void
  getSelectedProducts: () => Product[]
}

const INITIAL_FILTERS: FilterState = {
  search: '',
  category: 'all',
  memory: 'all',
  color: 'all',
  condition: 'all',
  supplier: 'all',
  battery: 'all',
  inStockOnly: false,
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: false,
  filters: INITIAL_FILTERS,
  selectedProductIds: new Set(),

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }))
    get().fetchProducts()
  },

  resetFilters: () => {
    set({ filters: INITIAL_FILTERS })
    get().fetchProducts()
  },

  fetchProducts: async () => {
    set({ isLoading: true })
    const { filters } = get()

    let query = supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.search) {
      query = query.or(
        `modelo.ilike.%${filters.search}%,obs.ilike.%${filters.search}%`,
      )
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('categoria', filters.category)
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
      // Basic text match for now as battery is string
      query = query.eq('bateria', filters.battery)
    }

    if (filters.inStockOnly) {
      query = query.eq('em_estoque', true)
    }

    const { data, error } = await query

    if (!error && data) {
      set({ products: data, isLoading: false })
    } else {
      console.error('Error fetching products:', error)
      set({ products: [], isLoading: false })
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
}))
