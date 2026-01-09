import { create } from 'zustand'
import { Product, Supplier, FilterState } from '@/types'
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS } from '@/lib/data'

interface ProductStore {
  products: Product[]
  suppliers: Supplier[]
  selectedProducts: Product[]
  filters: FilterState

  setFilters: (filters: Partial<FilterState>) => void
  toggleProductSelection: (product: Product) => void
  clearSelection: () => void
  getBestPrice: (
    product: Product,
  ) => { price: number; supplierName: string } | null
  getFilteredProducts: () => Product[]
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: INITIAL_PRODUCTS,
  suppliers: INITIAL_SUPPLIERS,
  selectedProducts: [],
  filters: {
    search: '',
    brand: 'all',
    category: 'all',
  },

  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  toggleProductSelection: (product) =>
    set((state) => {
      const isSelected = state.selectedProducts.some((p) => p.id === product.id)
      if (isSelected) {
        return {
          selectedProducts: state.selectedProducts.filter(
            (p) => p.id !== product.id,
          ),
        }
      }
      return { selectedProducts: [...state.selectedProducts, product] }
    }),

  clearSelection: () => set({ selectedProducts: [] }),

  getBestPrice: (product) => {
    if (!product.prices.length) return null
    const sorted = [...product.prices].sort((a, b) => a.price - b.price)
    const bestPrice = sorted[0]
    const supplier = get().suppliers.find((s) => s.id === bestPrice.supplierId)
    return {
      price: bestPrice.price,
      supplierName: supplier?.name || 'Unknown',
    }
  },

  getFilteredProducts: () => {
    const { products, filters } = get()
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(filters.search.toLowerCase())
      const matchesBrand =
        filters.brand === 'all' || product.brand === filters.brand
      const matchesCategory =
        filters.category === 'all' || product.category === filters.category
      return matchesSearch && matchesBrand && matchesCategory
    })
  },
}))
