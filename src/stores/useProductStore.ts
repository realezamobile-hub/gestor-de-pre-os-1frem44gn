import { create } from 'zustand'
import {
  Product,
  FilterState,
  ExcludedSupplier,
  PriceMonitorItem,
  DraftItem,
} from '@/types'
import { supabase } from '@/lib/supabase/client'
import { startOfToday, startOfDay, subDays, endOfDay } from 'date-fns'
import { toast } from 'sonner'

interface ProductStore {
  products: Product[]
  monitorItems: PriceMonitorItem[]
  excludedSuppliers: ExcludedSupplier[]
  draftItems: DraftItem[]
  isLoading: boolean
  filters: FilterState
  categories: string[]

  // Derived state helper
  selectedProductIds: Set<number>

  // Pagination
  page: number
  pageSize: number
  total: number

  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  setPage: (page: number) => void
  fetchProducts: () => Promise<void>
  fetchCategories: () => Promise<void>

  // Draft Actions
  fetchDraftItems: () => Promise<void>
  toggleDraftItem: (product: Product) => Promise<void>
  addToDraft: (products: Product[]) => Promise<void>
  removeFromDraft: (draftId: string) => Promise<void>
  updateDraftItem: (id: string, updates: Partial<DraftItem>) => Promise<void>
  clearDraft: () => Promise<void>

  // Legacy/Auto-Generator using Draft
  generateListFromFilters: (
    date: Date | null,
    categories: string[],
  ) => Promise<void>

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
  draftItems: [],
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
      let minDate: string | null = null
      if (filters.dateRange === 'today') {
        minDate = startOfToday().toISOString()
      } else if (filters.dateRange === 'last_2_days') {
        minDate = startOfDay(subDays(new Date(), 1)).toISOString()
      }

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

  fetchDraftItems: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('whatsapp_draft_items')
      .select('*, product:produtos(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      const selectedIds = new Set(data.map((i) => i.product_id))
      set({ draftItems: data as any, selectedProductIds: selectedIds })
    }
  },

  toggleDraftItem: async (product) => {
    const { draftItems } = get()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Você precisa estar logado.')
      return
    }

    const existing = draftItems.find((i) => i.product_id === product.id)

    // Optimistic update
    const prevDraftItems = [...draftItems]
    const prevSelectedIds = new Set(get().selectedProductIds)

    if (existing) {
      // Remove
      const newItems = draftItems.filter((i) => i.product_id !== product.id)
      const newIds = new Set(prevSelectedIds)
      newIds.delete(product.id)
      set({ draftItems: newItems, selectedProductIds: newIds })

      const { error } = await supabase
        .from('whatsapp_draft_items')
        .delete()
        .eq('id', existing.id)

      if (error) {
        toast.error('Erro ao remover item')
        set({ draftItems: prevDraftItems, selectedProductIds: prevSelectedIds })
      }
    } else {
      // Add
      // Create temp item for UI
      const tempId = crypto.randomUUID()
      const tempItem: DraftItem = {
        id: tempId,
        user_id: user.id,
        product_id: product.id,
        created_at: new Date().toISOString(),
        product: product,
      }

      const newItems = [...draftItems, tempItem]
      const newIds = new Set(prevSelectedIds)
      newIds.add(product.id)
      set({ draftItems: newItems, selectedProductIds: newIds })

      const { data, error } = await supabase
        .from('whatsapp_draft_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
        })
        .select('*, product:produtos(*)')
        .single()

      if (error) {
        toast.error('Erro ao adicionar item')
        set({ draftItems: prevDraftItems, selectedProductIds: prevSelectedIds })
      } else if (data) {
        // Replace temp item with real one
        const realItems = get().draftItems.map((i) =>
          i.id === tempId ? (data as any) : i,
        )
        set({ draftItems: realItems })
      }
    }
  },

  addToDraft: async (products) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || products.length === 0) return

    set({ isLoading: true })
    const itemsToInsert = products.map((p) => ({
      user_id: user.id,
      product_id: p.id,
    }))

    const { error } = await supabase
      .from('whatsapp_draft_items')
      .upsert(itemsToInsert, { onConflict: 'user_id, product_id' })

    if (error) {
      toast.error('Erro ao adicionar produtos')
    } else {
      await get().fetchDraftItems()
      toast.success(`${products.length} produtos adicionados ao rascunho`)
    }
    set({ isLoading: false })
  },

  removeFromDraft: async (draftId) => {
    const { error } = await supabase
      .from('whatsapp_draft_items')
      .delete()
      .eq('id', draftId)

    if (!error) {
      const newItems = get().draftItems.filter((i) => i.id !== draftId)
      const newIds = new Set(newItems.map((i) => i.product_id))
      set({ draftItems: newItems, selectedProductIds: newIds })
    } else {
      toast.error('Erro ao remover item')
    }
  },

  updateDraftItem: async (id, updates) => {
    const { error } = await supabase
      .from('whatsapp_draft_items')
      .update({
        custom_model: updates.custom_model,
        custom_details: updates.custom_details,
        custom_price: updates.custom_price,
      })
      .eq('id', id)

    if (!error) {
      const newItems = get().draftItems.map((i) =>
        i.id === id ? { ...i, ...updates } : i,
      )
      set({ draftItems: newItems })
      toast.success('Item atualizado')
    } else {
      toast.error('Erro ao atualizar item')
    }
  },

  clearDraft: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('whatsapp_draft_items')
      .delete()
      .eq('user_id', user.id)

    if (!error) {
      set({ draftItems: [], selectedProductIds: new Set() })
      toast.success('Lista limpa com sucesso')
    }
  },

  generateListFromFilters: async (date, categories) => {
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
          await get().addToDraft(data as any)
        }
      }
    } catch (error) {
      console.error('Error generating list:', error)
      toast.error('Erro ao gerar a lista. Tente novamente.')
    } finally {
      set({ isLoading: false })
    }
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
    const { error } = await supabase.from('produtos').delete().neq('id', 0)

    if (error) return { success: false, error }

    set({ products: [], total: 0, monitorItems: [] })
    return { success: true }
  },
}))
