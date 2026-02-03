import { create } from 'zustand'
import {
  BasePriceConfig,
  PeripheralDiscountConfig,
  Evaluation,
  ChecklistItem,
  ChecklistCategory,
} from '@/types'
import { supabase } from '@/lib/supabase/client'

interface EvaluationStore {
  basePrices: BasePriceConfig[]
  peripheralDiscounts: PeripheralDiscountConfig[]
  categories: ChecklistCategory[]
  checklistItems: ChecklistItem[]
  evaluations: Evaluation[]
  isLoading: boolean

  fetchConfigs: () => Promise<void>
  addBasePrice: (
    modelo: string,
    preco: number,
  ) => Promise<{ success: boolean; error?: any }>
  updateBasePrice: (
    id: string,
    modelo: string,
    preco: number,
  ) => Promise<{ success: boolean; error?: any }>
  deleteBasePrice: (id: string) => Promise<{ success: boolean; error?: any }>
  addCategory: (name: string) => Promise<{ success: boolean; error?: any }>
  updateCategory: (
    id: string,
    name: string,
  ) => Promise<{ success: boolean; error?: any }>
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: any }>
  addChecklistItem: (
    categoryId: string,
    nome: string,
  ) => Promise<{ success: boolean; error?: any }>
  deleteChecklistItem: (
    id: string,
  ) => Promise<{ success: boolean; error?: any }>
  addDiscount: (
    nome: string,
    valor: number,
    modeloId?: string,
    checklistItemId?: string,
  ) => Promise<{ success: boolean; error?: any }>
  updateDiscount: (
    id: string,
    valor: number,
  ) => Promise<{ success: boolean; error?: any }>
  deleteDiscount: (id: string) => Promise<{ success: boolean; error?: any }>
  saveEvaluation: (data: any) => Promise<{ success: boolean; error?: any }>
  fetchEvaluations: () => Promise<void>
  uploadEvidence: (file: File) => Promise<{ url: string | null; error: any }>
}

export const useEvaluationStore = create<EvaluationStore>((set, get) => ({
  basePrices: [],
  peripheralDiscounts: [],
  categories: [],
  checklistItems: [],
  evaluations: [],
  isLoading: false,

  fetchConfigs: async () => {
    set({ isLoading: true })
    const { data: prices } = await supabase
      .from('config_precos_base')
      .select('*')
      .order('modelo')

    const { data: discounts } = await supabase
      .from('config_descontos_perifericos')
      .select('*')

    const { data: categories } = await supabase
      .from('config_checklist_categories')
      .select('*')
      .order('name')

    const { data: checklist } = await supabase
      .from('config_checklist_items')
      .select('*')
      .order('nome')

    set({
      basePrices: (prices as any) || [],
      peripheralDiscounts: (discounts as any) || [],
      categories: (categories as any) || [],
      checklistItems: (checklist as any) || [],
      isLoading: false,
    })
  },

  addBasePrice: async (modelo, preco) => {
    const { error } = await supabase
      .from('config_precos_base')
      .insert({ modelo, preco_base: preco })
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  updateBasePrice: async (id, modelo, preco) => {
    const { error } = await supabase
      .from('config_precos_base')
      .update({ modelo, preco_base: preco })
      .eq('id', id)
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  deleteBasePrice: async (id) => {
    const { error } = await supabase
      .from('config_precos_base')
      .delete()
      .eq('id', id)
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  addCategory: async (name) => {
    const { error } = await supabase
      .from('config_checklist_categories')
      .insert({ name })
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  updateCategory: async (id, name) => {
    const { error } = await supabase
      .from('config_checklist_categories')
      .update({ name })
      .eq('id', id)
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  deleteCategory: async (id) => {
    const { error } = await supabase
      .from('config_checklist_categories')
      .delete()
      .eq('id', id)
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  addChecklistItem: async (categoryId, nome) => {
    const { error } = await supabase
      .from('config_checklist_items')
      .insert({ category_id: categoryId, nome })
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  deleteChecklistItem: async (id) => {
    const { error } = await supabase
      .from('config_checklist_items')
      .delete()
      .eq('id', id)
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  addDiscount: async (nome, valor, modeloId, checklistItemId) => {
    const { error } = await supabase
      .from('config_descontos_perifericos')
      .insert({
        nome,
        valor_desconto: valor,
        modelo_id: modeloId,
        checklist_item_id: checklistItemId,
      })
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  updateDiscount: async (id, valor) => {
    const { error } = await supabase
      .from('config_descontos_perifericos')
      .update({ valor_desconto: valor })
      .eq('id', id)
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  deleteDiscount: async (id) => {
    const { error } = await supabase
      .from('config_descontos_perifericos')
      .delete()
      .eq('id', id)
    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  saveEvaluation: async (data) => {
    // Extract research files to specific columns
    const files = data.consultationFiles || []
    const url_pesquisa_1 = files[0]?.url || null
    const url_pesquisa_2 = files[1]?.url || null
    const url_pesquisa_3 = files[2]?.url || null
    const url_pesquisa_4 = files[3]?.url || null

    const { error } = await supabase.from('avaliacoes_iphone').insert({
      modelo: data.modelo,
      serial_number: data.serialNumber,
      checklist_data: data.checklistData,
      valor_final: data.valorFinal,
      descontos_aplicados: data.descontos as any,
      user_id: data.userId,
      nome_cliente: data.nomeCliente,
      telefone_cliente: data.telefoneCliente,
      cpf_cliente: data.cpf_cliente,
      cliente_id: data.clienteId,
      url_print_seguranca: data.urlPrint || null,
      url_foto_documento: data.urlDoc || null,
      arquivos_consulta: data.consultationFiles || [],
      // Save specific columns
      url_pesquisa_1,
      url_pesquisa_2,
      url_pesquisa_3,
      url_pesquisa_4,
    })

    if (!error) await get().fetchEvaluations()
    return { success: !error, error }
  },

  fetchEvaluations: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('avaliacoes_iphone')
      .select('*, empresas(nome_fantasia), clientes(*)')
      .order('created_at', { ascending: false })
      .limit(100)

    const mappedData = data?.map((d) => ({
      ...d,
      client: d.clientes,
    }))

    if (!error && data) {
      set({ evaluations: mappedData as any, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  uploadEvidence: async (file) => {
    try {
      if (!file) return { url: null, error: 'Arquivo inválido' }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'unknown'
      const nameWithoutExt =
        file.name.substring(0, file.name.lastIndexOf('.')) || file.name

      const sanitizedBaseName = nameWithoutExt
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s\-_]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()

      const fileName = `${Date.now()}-${sanitizedBaseName}.${fileExt}`

      // CRITICAL FIX: Convert to ArrayBuffer to prevent "FormData object could not be cloned" error
      const fileBuffer = await file.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('evaluation-evidence')
        .upload(fileName, fileBuffer, {
          upsert: false,
          contentType: file.type || 'application/octet-stream',
          cacheControl: '3600',
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        return { url: null, error: uploadError }
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('evaluation-evidence').getPublicUrl(fileName)

      return { url: publicUrl, error: null }
    } catch (error) {
      console.error('Upload exception:', error)
      return { url: null, error }
    }
  },
}))
