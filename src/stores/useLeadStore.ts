import { create } from 'zustand'
import { Lead } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { differenceInMinutes, parseISO } from 'date-fns'
import { toast } from 'sonner'

interface LeadStore {
  leads: Lead[]
  isLoading: boolean
  filterStatus: string
  searchTerm: string
  blacklist: string[]

  fetchLeads: () => Promise<void>
  fetchBlacklist: () => Promise<void>
  markAsHandled: (lead: Lead, attendantName: string) => Promise<void>
  addToBlacklist: (contactName: string) => Promise<void>
  setFilterStatus: (status: string) => void
  setSearchTerm: (term: string) => void

  getProcessedLeads: () => Lead[]
}

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  isLoading: false,
  filterStatus: 'Pendente',
  searchTerm: '',
  blacklist: [],

  fetchBlacklist: async () => {
    try {
      const { data, error } = await supabase
        .from('leads_blacklist' as any)
        .select('nome_contato')

      if (!error && data) {
        set({ blacklist: data.map((item: any) => item.nome_contato) })
      }
    } catch (e) {
      console.warn('Blacklist table might not exist')
    }
  },

  fetchLeads: async () => {
    set({ isLoading: true })
    try {
      await get().fetchBlacklist()

      const { data, error } = await supabase
        .from('leads_realeza' as any)
        .select('*')
        .order('data_recebimento', { ascending: false })
        .limit(500)

      if (error) throw error

      if (data) {
        set({ leads: data as Lead[] })
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast.error('Erro ao carregar leads')
    } finally {
      set({ isLoading: false })
    }
  },

  markAsHandled: async (lead, attendantName) => {
    try {
      // Optimistic update for immediate UI reflection
      const updatedLeads = get().leads.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              status_atendimento: 'Atendido',
              usuario_atendimento: attendantName,
            }
          : l,
      )
      set({ leads: updatedLeads })

      // Update existing record in database
      // Using 'usuario_atendimento' which maps to the attendant field in DB
      const { error } = await supabase
        .from('leads_realeza' as any)
        .update({
          status_atendimento: 'Atendido',
          usuario_atendimento: attendantName,
        })
        .eq('id', lead.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating lead status:', error)
      toast.error('Erro ao atualizar status do lead')
      // Revert optimistic update on failure
      get().fetchLeads()
    }
  },

  addToBlacklist: async (contactName) => {
    try {
      set((state) => ({ blacklist: [...state.blacklist, contactName] }))

      const { error } = await supabase
        .from('leads_blacklist' as any)
        .insert({ nome_contato: contactName })

      if (error) throw error

      toast.success(`${contactName} adicionado à lista de bloqueio`)
    } catch (error) {
      console.error('Error adding to blacklist:', error)
      toast.error('Erro ao bloquear contato')
    }
  },

  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchTerm: (term) => set({ searchTerm: term }),

  getProcessedLeads: () => {
    const { leads, filterStatus, searchTerm, blacklist } = get()

    // 1. Filter by Blacklist
    let processed = leads.filter(
      (lead) => !blacklist.includes(lead.nome_contato),
    )

    // 2. Filter by Status
    if (filterStatus && filterStatus !== 'all') {
      processed = processed.filter(
        (lead) =>
          lead.status_atendimento?.toLowerCase() === filterStatus.toLowerCase(),
      )
    }

    // 3. Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      processed = processed.filter(
        (lead) =>
          lead.nome_contato?.toLowerCase().includes(lowerTerm) ||
          lead.numero_contato?.includes(lowerTerm) ||
          lead.mensagem_cliente?.toLowerCase().includes(lowerTerm),
      )
    }

    // 4. Deduplication Logic (15 min window)
    // Sort by date ascending to process timeline correctly
    const sortedForDedup = [...processed].sort(
      (a, b) =>
        new Date(a.data_recebimento).getTime() -
        new Date(b.data_recebimento).getTime(),
    )

    const uniqueLeads: Lead[] = []
    const lastSeenMap: Record<string, Date> = {}

    sortedForDedup.forEach((lead) => {
      // Key includes contact name and message content to identify duplicates
      const key = `${lead.nome_contato}|${lead.mensagem_cliente}`.trim()
      const leadDate = parseISO(lead.data_recebimento)

      if (lastSeenMap[key]) {
        const lastDate = lastSeenMap[key]
        const diffMinutes = differenceInMinutes(leadDate, lastDate)

        // Hide duplicate messages if within 15 minutes of the last accepted one
        if (diffMinutes < 15) {
          return
        }
      }

      lastSeenMap[key] = leadDate
      uniqueLeads.push(lead)
    })

    // 5. Default Sorting (Pendente first, then date desc)
    return uniqueLeads.sort((a, b) => {
      const isAPending = a.status_atendimento === 'Pendente'
      const isBPending = b.status_atendimento === 'Pendente'

      // Prioritize "Pendente" at the top
      if (isAPending && !isBPending) return -1
      if (!isAPending && isBPending) return 1

      // Then sort by date descending (newest first)
      return (
        new Date(b.data_recebimento).getTime() -
        new Date(a.data_recebimento).getTime()
      )
    })
  },
}))
