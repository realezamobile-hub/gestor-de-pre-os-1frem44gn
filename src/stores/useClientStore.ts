import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { Client } from '@/types'

interface ClientStore {
  currentClient: Client | null
  isLoading: boolean

  fetchClientByCpf: (cpf: string) => Promise<Client | null>
  createClient: (
    data: Omit<Client, 'id' | 'created_at' | 'updated_at'>,
  ) => Promise<{ success: boolean; data?: Client; error?: any }>
  updateClient: (
    id: string,
    data: Partial<Client>,
  ) => Promise<{ success: boolean; error?: any }>
  clearCurrentClient: () => void
}

export const useClientStore = create<ClientStore>((set, get) => ({
  currentClient: null,
  isLoading: false,

  fetchClientByCpf: async (cpf) => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('cpf', cpf)
      .maybeSingle()

    set({ isLoading: false })

    if (data) {
      set({ currentClient: data as Client })
      return data as Client
    }

    set({ currentClient: null })
    return null
  },

  createClient: async (clientData) => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('clientes')
      .insert(clientData)
      .select()
      .single()

    set({ isLoading: false })

    if (error) {
      return { success: false, error }
    }

    if (data) {
      set({ currentClient: data as Client })
      return { success: true, data: data as Client }
    }

    return { success: false, error: 'Unknown error' }
  },

  updateClient: async (id, clientData) => {
    set({ isLoading: true })
    const { error } = await supabase
      .from('clientes')
      .update({ ...clientData, updated_at: new Date().toISOString() })
      .eq('id', id)

    set({ isLoading: false })

    if (error) {
      return { success: false, error }
    }

    // Refresh current client if it matches
    if (get().currentClient?.id === id) {
      set((state) => ({
        currentClient: state.currentClient
          ? { ...state.currentClient, ...clientData }
          : null,
      }))
    }

    return { success: true }
  },

  clearCurrentClient: () => set({ currentClient: null }),
}))
