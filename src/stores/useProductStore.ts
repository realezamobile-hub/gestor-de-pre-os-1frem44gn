import { create } from 'zustand'
import { Product, Supplier, FilterState } from '@/types'
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS } from '@/lib/data'

interface ProductStore {
  products: Product[]
  suppliers: Supplier[]
  selectedProducts: Product[]
  filters: FilterState

  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  toggleProductSelection: (product: Product) => void
  clearSelection: () => void
  getBestPrice: (
    product: Product,
  ) => { price: number; supplierName: string; inStock: boolean } | null
  getFilteredProducts: () => Product[]
}

const INITIAL_FILTERS: FilterState = {
  search: '',
  brand: 'all',
  category: 'all',
  model: 'all',
  memory: 'all',
  color: 'all',
  condition: 'all',
  supplierId: 'all',
  inStockOnly: false,
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: INITIAL_PRODUCTS,
  suppliers: INITIAL_SUPPLIERS,
  selectedProducts: [],
  filters: INITIAL_FILTERS,

  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  resetFilters: () => set({ filters: INITIAL_FILTERS }),

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

    // Filter by stock if needed, otherwise take all
    // Logic: Find lowest price among ALL available prices
    const sorted = [...product.prices].sort((a, b) => a.price - b.price)

    if (sorted.length === 0) return null

    const bestPrice = sorted[0]
    const supplier = get().suppliers.find((s) => s.id === bestPrice.supplierId)
    return {
      price: bestPrice.price,
      supplierName: supplier?.name || 'Unknown',
      inStock: bestPrice.inStock,
    }
  },

  getFilteredProducts: () => {
    const { products, filters } = get()
    return products.filter((product) => {
      // 1. Search (Name or Model)
      const matchesSearch =
        filters.search === '' ||
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.model.toLowerCase().includes(filters.search.toLowerCase())

      // 2. Brand
      const matchesBrand =
        filters.brand === 'all' || product.brand === filters.brand

      // 3. Category
      const matchesCategory =
        filters.category === 'all' || product.category === filters.category

      // 4. Model
      const matchesModel =
        filters.model === 'all' || product.model === filters.model

      // 5. Memory
      const matchesMemory =
        filters.memory === 'all' || product.memory === filters.memory

      // 6. Color
      const matchesColor =
        filters.color === 'all' || product.color === filters.color

      // 7. Condition
      const matchesCondition =
        filters.condition === 'all' || product.condition === filters.condition

      // 8. Supplier
      // Product must have a price from this supplier
      const matchesSupplier =
        filters.supplierId === 'all' ||
        product.prices.some((p) => p.supplierId === filters.supplierId)

      // 9. Stock (General)
      // If inStockOnly is true, product must have at least one offer in stock
      const matchesStock =
        !filters.inStockOnly || product.prices.some((p) => p.inStock)

      return (
        matchesSearch &&
        matchesBrand &&
        matchesCategory &&
        matchesModel &&
        matchesMemory &&
        matchesColor &&
        matchesCondition &&
        matchesSupplier &&
        matchesStock
      )
    })
  },
}))
