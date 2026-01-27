import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { Company } from '@/types'
import { toast } from 'sonner'

interface CompanyStore {
  companies: Company[]
  isLoading: boolean
  fetchCompanies: () => Promise<void>
  createCompany: (
    data: Partial<Company>,
  ) => Promise<{ success: boolean; error?: any }>
  updateCompany: (
    id: string,
    data: Partial<Company>,
  ) => Promise<{ success: boolean; error?: any }>
  deleteCompany: (id: string) => Promise<{ success: boolean; error?: any }>
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: [],
  isLoading: false,

  fetchCompanies: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching companies:', error)
      toast.error('Erro ao buscar empresas')
    } else {
      set({ companies: data as Company[] })
    }
    set({ isLoading: false })
  },

  createCompany: async (companyData) => {
    const { error } = await supabase.from('empresas').insert(companyData)

    if (error) {
      return { success: false, error }
    }
    await get().fetchCompanies()
    return { success: true }
  },

  updateCompany: async (id, companyData) => {
    const { error } = await supabase
      .from('empresas')
      .update(companyData)
      .eq('id', id)

    if (error) {
      return { success: false, error }
    }
    await get().fetchCompanies()
    return { success: true }
  },

  deleteCompany: async (id) => {
    const { error } = await supabase.from('empresas').delete().eq('id', id)

    if (error) {
      return { success: false, error }
    }
    await get().fetchCompanies()
    return { success: true }
  },
}))
