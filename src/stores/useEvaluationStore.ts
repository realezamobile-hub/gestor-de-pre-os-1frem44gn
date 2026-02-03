import { create } from 'zustand'
import {
  BasePriceConfig,
  PeripheralDiscountConfig,
  Evaluation,
  ChecklistItem,
} from '@/types'
import { supabase } from '@/lib/supabase/client'

interface EvaluationStore {
  basePrices: BasePriceConfig[]
  peripheralDiscounts: PeripheralDiscountConfig[]
  checklistItems: ChecklistItem[]
  evaluations: Evaluation[]
  isLoading: boolean

  fetchConfigs: () => Promise<void>

  // Base Prices
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

  // Checklist Items
  addChecklistItem: (
    categoria: string,
    nome: string,
  ) => Promise<{ success: boolean; error?: any }>
  deleteChecklistItem: (
    id: string,
  ) => Promise<{ success: boolean; error?: any }>

  // Discounts
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

  // Evaluation
  saveEvaluation: (data: {
    modelo: string
    serialNumber: string
    checklistData: any
    valorFinal: number
    descontos: PeripheralDiscountConfig[]
    userId: string
    nomeCliente: string
    telefoneCliente: string
    cpfCliente: string
    urlPrintSeguranca: string
    urlFotoDocumento: string
  }) => Promise<{ success: boolean; error?: any }>

  fetchEvaluations: () => Promise<void>
  uploadEvidence: (file: File) => Promise<{ url: string | null; error: any }>
}

export const useEvaluationStore = create<EvaluationStore>((set, get) => ({
  basePrices: [],
  peripheralDiscounts: [],
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

    const { data: checklist } = await supabase
      .from('config_checklist_items')
      .select('*')
      .order('categoria')

    set({
      basePrices: (prices as any) || [],
      peripheralDiscounts: (discounts as any) || [],
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

  addChecklistItem: async (categoria, nome) => {
    const { error } = await supabase
      .from('config_checklist_items')
      .insert({ categoria, nome })

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
    const {
      modelo,
      serialNumber,
      checklistData,
      valorFinal,
      descontos,
      userId,
      nomeCliente,
      telefoneCliente,
      cpfCliente,
      urlPrintSeguranca,
      urlFotoDocumento,
    } = data

    const { error } = await supabase.from('avaliacoes_iphone').insert({
      modelo,
      serial_number: serialNumber,
      checklist_data: checklistData,
      valor_final: valorFinal,
      descontos_aplicados: descontos as any,
      user_id: userId,
      nome_cliente: nomeCliente,
      telefone_cliente: telefoneCliente,
      cpf_cliente: cpfCliente,
      url_print_seguranca: urlPrintSeguranca,
      url_foto_documento: urlFotoDocumento,
    })

    if (!error) await get().fetchEvaluations()
    return { success: !error, error }
  },

  fetchEvaluations: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('avaliacoes_iphone')
      .select('*, empresas(nome_fantasia)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      set({ evaluations: data as any, isLoading: false })
    } else {
      console.error('Error fetching evaluations:', error)
      set({ isLoading: false })
    }
  },

  uploadEvidence: async (file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('evaluation-evidence')
        .upload(fileName, file)

      if (uploadError) return { url: null, error: uploadError }

      const {
        data: { publicUrl },
      } = supabase.storage.from('evaluation-evidence').getPublicUrl(fileName)

      return { url: publicUrl, error: null }
    } catch (error) {
      return { url: null, error }
    }
  },
}))
