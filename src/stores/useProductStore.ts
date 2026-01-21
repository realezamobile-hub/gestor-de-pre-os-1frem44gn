import { create } from 'zustand'
import {
  Product,
  FilterState,
  ExcludedSupplier,
  PriceMonitorItem,
  DraftItem,
  GeneratorConfigData,
  FilterOptions,
  GeneratedList,
} from '@/types'
import { supabase } from '@/lib/supabase/client'
import { startOfDay, endOfDay, subDays } from 'date-fns'
import { toast } from 'sonner'

interface ProductStore {
  products: Product[]
  monitorItems: PriceMonitorItem[]
  excludedSuppliers: ExcludedSupplier[]
  draftItems: DraftItem[]
  generatedLists: GeneratedList[]
  isLoading: boolean
  filters: FilterState
  categories: string[]

  // Dynamic options based on search
  filterOptions: FilterOptions
  fetchFilterOptions: () => Promise<void>

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
  applyMarkupToAll: (markup: number) => Promise<void>

  // Generated Lists
  fetchGeneratedLists: () => Promise<void>
  deleteGeneratedList: (id: string) => Promise<void>
  saveGeneratedList: (
    title: string,
    content: string,
    type: 'supplier' | 'posting',
    config: GeneratorConfigData,
    itemsSnapshot: DraftItem[],
  ) => Promise<{ success: boolean; error?: any }>

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

  // New Maintenance Features
  deleteZeroValueProducts: () => Promise<{
    success: boolean
    count?: number
    error?: any
  }>
  cleanupByDate: (
    date: string,
  ) => Promise<{ success: boolean; data?: any; error?: any }>
  deleteSoldItems: () => Promise<{
    success: boolean
    count?: number
    error?: any
  }>

  // Helper
  getBestPrice: (
    product: Product,
  ) => { price: number; supplierId: string } | null
  selectedProducts: Product[] // Helper to get full objects
  toggleProductSelection: (product: Product | number) => void
}

const INITIAL_FILTERS: FilterState = {
  search: '',
  memory: 'all',
  ram: 'all',
  color: 'all',
  dateRange: 'all',
}

const INITIAL_FILTER_OPTIONS: FilterOptions = {
  memories: [],
  rams: [],
  colors: [],
}

// Helper to cast table name for views since they are not in Database types
const VIEW_PRODUCTS = 'v_produtos_visiveis' as any
const VIEW_MONITOR = 'v_monitor_precos' as any

// Helper to format full product description
const formatProductDescription = (p: Product) => {
  return [p.modelo, p.memoria, p.ram ? `${p.ram} RAM` : null, p.cor]
    .filter(Boolean)
    .join(' ')
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  monitorItems: [],
  excludedSuppliers: [],
  draftItems: [],
  generatedLists: [],
  isLoading: false,
  filters: INITIAL_FILTERS,
  filterOptions: INITIAL_FILTER_OPTIONS,
  selectedProductIds: new Set(),
  categories: [],
  page: 0,
  pageSize: 20,
  total: 0,
  selectedProducts: [], // Placeholder, derived actually

  getBestPrice: (product) => {
    if (product.valor) return { price: product.valor, supplierId: 'default' }
    return null
  },

  toggleProductSelection: (productOrId) => {
    const { selectedProductIds } = get()
    const id = typeof productOrId === 'number' ? productOrId : productOrId.id
    const newIds = new Set(selectedProductIds)
    if (newIds.has(id)) {
      newIds.delete(id)
    } else {
      newIds.add(id)
    }
    set({ selectedProductIds: newIds })
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 0,
    }))
    get().fetchProducts()
    if (newFilters.search !== undefined || newFilters.dateRange !== undefined) {
      get().fetchFilterOptions()
    }
  },

  resetFilters: () => {
    set({ filters: INITIAL_FILTERS, page: 0 })
    get().fetchProducts()
    get().fetchFilterOptions()
  },

  setPage: (page) => {
    set({ page })
    get().fetchProducts()
  },

  fetchFilterOptions: async () => {
    const { filters } = get()
    let minDate = null
    const today = startOfDay(new Date())

    if (filters.dateRange === 'today') {
      minDate = today.toISOString()
    } else if (filters.dateRange === 'yesterday') {
      minDate = subDays(today, 1).toISOString()
    }

    const { data, error } = await supabase.rpc('get_product_filters', {
      p_search_query: filters.search.trim() || null,
      p_min_date: minDate,
    })

    if (!error && data) {
      set({ filterOptions: data as unknown as FilterOptions })
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true })
    const { filters, page, pageSize } = get()

    try {
      let minDate = null
      const today = startOfDay(new Date())

      if (filters.dateRange === 'today') {
        minDate = today.toISOString()
      } else if (filters.dateRange === 'yesterday') {
        minDate = subDays(today, 1).toISOString()
      }

      const rpcArgs: any = {
        search_query: filters.search.trim() || null,
        category_filters: null,
        memory_filter: filters.memory !== 'all' ? filters.memory : null,
        ram_filter: filters.ram !== 'all' ? filters.ram : null,
        color_filter: filters.color !== 'all' ? filters.color : null,
        condition_filter: null,
        supplier_filter: null,
        battery_filter: null,
        in_stock_only: false,
        min_date: minDate,
      }

      const { data, error, count } = await supabase
        .rpc('search_products', rpcArgs, { count: 'exact' })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (!error && data) {
        set({ products: data as any, total: count || 0, isLoading: false })
      } else {
        set({ products: [], total: 0, isLoading: false })
      }
    } catch (e) {
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
    const prevDraftItems = [...draftItems]
    const prevSelectedIds = new Set(get().selectedProductIds)

    if (existing) {
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
      const tempId = crypto.randomUUID()
      const fullDescription = formatProductDescription(product)

      const tempItem: DraftItem = {
        id: tempId,
        user_id: user.id,
        product_id: product.id,
        created_at: new Date().toISOString(),
        product: product,
        group_name: product.categoria,
        custom_model: fullDescription,
        custom_price: product.valor,
        custom_details: '',
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
          group_name: product.categoria,
          custom_model: fullDescription,
          custom_price: product.valor,
          custom_details: '',
        })
        .select('*, product:produtos(*)')
        .single()

      if (error) {
        toast.error('Erro ao adicionar item')
        set({ draftItems: prevDraftItems, selectedProductIds: prevSelectedIds })
      } else if (data) {
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
      group_name: p.categoria,
      custom_model: formatProductDescription(p),
      custom_price: p.valor,
      custom_details: '',
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
    const { draftItems } = get()
    const originalItems = [...draftItems]

    const newItems = draftItems.map((i) =>
      i.id === id ? { ...i, ...updates } : i,
    )
    set({ draftItems: newItems })

    const { error } = await supabase
      .from('whatsapp_draft_items')
      .update({
        custom_model: updates.custom_model,
        custom_details: updates.custom_details,
        custom_price: updates.custom_price,
        group_name: updates.group_name,
      })
      .eq('id', id)

    if (error) {
      toast.error('Erro ao atualizar item')
      set({ draftItems: originalItems })
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

  applyMarkupToAll: async (markup) => {
    const { draftItems } = get()
    if (draftItems.length === 0) {
      toast.warning('A lista está vazia.')
      return
    }

    set({ isLoading: true })

    // Use current effective price to allow additive increases
    // If custom_price is null, we assume current price is product.valor
    const updates = draftItems.map((item) => {
      const currentPrice = item.custom_price ?? item.product?.valor ?? 0
      const newPrice = currentPrice + markup

      return {
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        custom_price: newPrice,
        custom_model: item.custom_model,
        custom_details: item.custom_details,
        group_name: item.group_name,
      }
    })

    // Optimistic Update
    const optimisticItems = draftItems.map((item) => {
      const currentPrice = item.custom_price ?? item.product?.valor ?? 0
      return {
        ...item,
        custom_price: currentPrice + markup,
      }
    })
    set({ draftItems: optimisticItems })

    // Bulk update via upsert to apply to all items in DB
    const { error } = await supabase
      .from('whatsapp_draft_items')
      .upsert(updates)

    if (error) {
      console.error('Error applying markup:', error)
      toast.error('Erro ao aplicar aumento global')
      await get().fetchDraftItems() // Revert
    } else {
      toast.success(`Adicionado R$${markup} ao preço de todos os itens`)
    }
    set({ isLoading: false })
  },

  fetchGeneratedLists: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('generated_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      set({ generatedLists: data as GeneratedList[] })
    }
  },

  deleteGeneratedList: async (id) => {
    const { error } = await supabase
      .from('generated_lists')
      .delete()
      .eq('id', id)

    if (!error) {
      set((state) => ({
        generatedLists: state.generatedLists.filter((l) => l.id !== id),
      }))
      toast.success('Lista removida do histórico')
    } else {
      toast.error('Erro ao remover lista')
    }
  },

  saveGeneratedList: async (title, content, type, config, itemsSnapshot) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'User not found' }

    const { error } = await supabase.from('generated_lists').insert({
      user_id: user.id,
      title,
      content,
      type,
      header_footer_data: config as any,
      items_snapshot: itemsSnapshot as any,
    })

    if (error) {
      return { success: false, error }
    }
    await get().fetchGeneratedLists()
    return { success: true }
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

  deleteZeroValueProducts: async () => {
    try {
      const { error } = await supabase.rpc('limpar_produtos_sem_valor')
      if (error) throw error
      get().fetchProducts()
      return { success: true }
    } catch (error) {
      console.error('Delete zero value error:', error)
      return { success: false, error }
    }
  },

  cleanupByDate: async (date) => {
    try {
      const { data, error } = await supabase.rpc('cleanup_by_date', {
        target_date: date,
      })
      if (error) throw error
      get().fetchProducts()
      return { success: true, data }
    } catch (error) {
      console.error('Cleanup by date error:', error)
      return { success: false, error }
    }
  },

  deleteSoldItems: async () => {
    try {
      const { data, error } = await supabase.rpc('delete_sold_items')
      if (error) throw error
      get().fetchProducts()
      return { success: true, count: data }
    } catch (error) {
      console.error('Delete sold items error:', error)
      return { success: false, error }
    }
  },
}))
