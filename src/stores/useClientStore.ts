import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { Client } from '@/types'

interface ClientStore {
  currentClient: Client | null
  clients: Client[]
  isLoading: boolean

  fetchClientByCpf: (cpf: string) => Promise<Client | null>
  searchClients: (query: string) => Promise<void>
  createClient: (
    data: Omit<Client, 'id' | 'created_at' | 'updated_at'>,
  ) => Promise<{ success: boolean; data?: Client; error?: any }>
  updateClient: (
    id: string,
    data: Partial<Client>,
  ) => Promise<{ success: boolean; error?: any }>
  uploadClientPhoto: (
    file: File,
  ) => Promise<{ success: boolean; url?: string; error?: any }>
  clearCurrentClient: () => void
  fetchClientEvaluations: (clientId: string) => Promise<any[]>
}

export const useClientStore = create<ClientStore>((set, get) => ({
  currentClient: null,
  clients: [],
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

  searchClients: async (query) => {
    set({ isLoading: true })

    let queryBuilder = supabase.from('clientes').select('*').order('nome')

    if (query) {
      queryBuilder = queryBuilder.or(
        `nome.ilike.%${query}%,cpf.ilike.%${query}%`,
      )
    } else {
      queryBuilder = queryBuilder.limit(50)
    }

    const { data, error } = await queryBuilder

    if (!error && data) {
      set({ clients: data as Client[] })
    }

    set({ isLoading: false })
  },

  createClient: async (clientData) => {
    set({ isLoading: true })

    // Validation to prevent placeholder or missing company_id issues
    if (!clientData.company_id) {
      console.error('Missing company_id in createClient')
      set({ isLoading: false })
      return {
        success: false,
        error:
          'Erro interno: Identificação da empresa ausente. Tente recarregar a página.',
      }
    }

    let endereco = clientData.endereco
    if (!endereco && clientData.rua) {
      endereco = `${clientData.rua}, ${clientData.numero || 'S/N'}, ${clientData.bairro || ''}, ${clientData.municipio || ''} - ${clientData.estado || ''}`
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert({ ...clientData, endereco })
      .select()
      .single()

    set({ isLoading: false })

    if (error) {
      console.error('Error creating client:', error)
      return { success: false, error }
    }

    if (data) {
      set({ currentClient: data as Client })
      set((state) => ({ clients: [data as Client, ...state.clients] }))
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

    set((state) => ({
      currentClient:
        state.currentClient?.id === id
          ? { ...state.currentClient, ...clientData }
          : state.currentClient,
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, ...clientData } : c,
      ),
    }))

    return { success: true }
  },

  uploadClientPhoto: async (file) => {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '')
      const fileName = `${Date.now()}-${sanitizedName}.${fileExt}`

      // Fix for "FormData object could not be cloned" error
      const cleanFile = new File([file], fileName, { type: file.type })

      const { error: uploadError } = await supabase.storage
        .from('client-photos')
        .upload(fileName, cleanFile, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('client-photos').getPublicUrl(fileName)

      return { success: true, url: publicUrl }
    } catch (error) {
      console.error('Client photo upload error:', error)
      return { success: false, error }
    }
  },

  clearCurrentClient: () => set({ currentClient: null }),

  fetchClientEvaluations: async (clientId) => {
    const { data, error } = await supabase
      .from('avaliacoes_iphone')
      .select('*')
      .eq('cliente_id', clientId)
      .order('created_at', { ascending: false })

    if (error) return []
    return data
  },
}))
