import { create } from 'zustand'
import { BasePriceConfig, PeripheralDiscountConfig, Evaluation } from '@/types'
import { supabase } from '@/lib/supabase/client'

interface EvaluationStore {
  basePrices: BasePriceConfig[]
  peripheralDiscounts: PeripheralDiscountConfig[]
  evaluations: Evaluation[]
  isLoading: boolean

  fetchConfigs: () => Promise<void>
  addBasePrice: (
    modelo: string,
    preco: number,
  ) => Promise<{ success: boolean; error?: any }>
  deleteBasePrice: (id: string) => Promise<{ success: boolean; error?: any }>
  addDiscount: (
    nome: string,
    valor: number,
  ) => Promise<{ success: boolean; error?: any }>
  deleteDiscount: (id: string) => Promise<{ success: boolean; error?: any }>

  saveEvaluation: (
    modelo: string,
    serialNumber: string,
    checklistData: any,
    valorFinal: number,
    descontos: PeripheralDiscountConfig[],
    userId: string,
  ) => Promise<{ success: boolean; error?: any }>

  fetchEvaluations: () => Promise<void>
}

export const useEvaluationStore = create<EvaluationStore>((set, get) => ({
  basePrices: [],
  peripheralDiscounts: [],
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
      .order('nome')

    set({
      basePrices: (prices as any) || [],
      peripheralDiscounts: (discounts as any) || [],
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

  deleteBasePrice: async (id) => {
    const { error } = await supabase
      .from('config_precos_base')
      .delete()
      .eq('id', id)

    if (!error) await get().fetchConfigs()
    return { success: !error, error }
  },

  addDiscount: async (nome, valor) => {
    const { error } = await supabase
      .from('config_descontos_perifericos')
      .insert({ nome, valor_desconto: valor })

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

  saveEvaluation: async (
    modelo,
    serialNumber,
    checklistData,
    valorFinal,
    descontos,
    userId,
  ) => {
    const { error } = await supabase.from('avaliacoes_iphone').insert({
      modelo,
      serial_number: serialNumber,
      checklist_data: checklistData,
      valor_final: valorFinal,
      descontos_aplicados: descontos as any,
      user_id: userId,
    })

    if (!error) await get().fetchEvaluations()
    return { success: !error, error }
  },

  fetchEvaluations: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('avaliacoes_iphone')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      set({ evaluations: data as any, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },
}))
