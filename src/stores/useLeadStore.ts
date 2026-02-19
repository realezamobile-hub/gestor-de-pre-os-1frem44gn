import { create } from 'zustand'
import { Lead, BlacklistedContact } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { differenceInMinutes, parseISO } from 'date-fns'
import { toast } from 'sonner'

interface LeadStore {
  leads: Lead[]
  isLoading: boolean
  filterStatus: string
  searchTerm: string
  blacklist: string[] // List of blocked names/groups

  fetchLeads: () => Promise<void>
  fetchBlacklist: () => Promise<void>
  markAsHandled: (lead: Lead, userId: string) => Promise<void>
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
        .from('leads_blacklist')
        .select('nome_contato')

      if (!error && data) {
        set({ blacklist: data.map((item) => item.nome_contato) })
      }
    } catch (e) {
      // Fail silently if table doesn't exist yet
      console.warn('Blacklist table might not exist')
    }
  },

  fetchLeads: async () => {
    set({ isLoading: true })
    try {
      // Fetch blacklist first
      await get().fetchBlacklist()

      const { data, error } = await supabase
        .from('leads_realeza')
        .select('*')
        .order('data_recebimento', { ascending: false })
        .limit(500) // Limit to recent leads for performance

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

  markAsHandled: async (lead, userId) => {
    try {
      // Optimistic update
      const updatedLeads = get().leads.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              status_atendimento: 'Atendido',
              usuario_atendimento: userId,
            }
          : l,
      )
      set({ leads: updatedLeads })

      const { error } = await supabase
        .from('leads_realeza')
        .update({
          status_atendimento: 'Atendido',
          usuario_atendimento: userId,
        })
        .eq('id', lead.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating lead status:', error)
      toast.error('Erro ao atualizar status do lead')
      // Revert optimistic update if needed, but for now we keep it simple
      get().fetchLeads()
    }
  },

  addToBlacklist: async (contactName) => {
    try {
      // Optimistic update
      set((state) => ({ blacklist: [...state.blacklist, contactName] }))

      const { error } = await supabase
        .from('leads_blacklist')
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

    // 2. Filter by Status (Optional, if we want to force filtering)
    // The requirement says "default view prioritizes Pendente", which implies sorting,
    // but usually "Search and Filtering" implies filtering out.
    // "Default Sorting and Filtering: Table must load with Pendente status appearing at the top"
    // "Search bar to filter records by status" -> This is ambiguous.
    // I will filter by status if filterStatus is set, but if it is 'all', I show all.
    // The requirement "default view that prioritizes Pendente" is usually a sort.
    // But "Search and filtering... filter out duplicate".

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

    // 4. Deduplication Logic
    // "Hide duplicate messages from the same contact with the same content if sent within a 15-minute window."
    // We need to process from oldest to newest to check the window correctly,
    // but the list is usually displayed newest first.
    // Let's sort by date asc temporarily to process, then reverse back.

    const sortedForDedup = [...processed].sort(
      (a, b) =>
        new Date(a.data_recebimento).getTime() -
        new Date(b.data_recebimento).getTime(),
    )

    const uniqueLeads: Lead[] = []
    const lastSeenMap: Record<string, Date> = {} // Key: `${nome_contato}|${mensagem}`

    sortedForDedup.forEach((lead) => {
      const key = `${lead.nome_contato}|${lead.mensagem_cliente}`.trim()
      const leadDate = parseISO(lead.data_recebimento)

      if (lastSeenMap[key]) {
        const lastDate = lastSeenMap[key]
        const diffMinutes = differenceInMinutes(leadDate, lastDate)

        if (diffMinutes < 15) {
          // It's a duplicate within 15 mins, skip it
          return
        }
      }

      // Not a duplicate or > 15 mins
      lastSeenMap[key] = leadDate
      uniqueLeads.push(lead)
    })

    // 5. Default Sorting
    // "Pendente" records appearing at the top by default.
    // Then by date descending.
    return uniqueLeads.sort((a, b) => {
      const isAPending = a.status_atendimento === 'Pendente'
      const isBPending = b.status_atendimento === 'Pendente'

      if (isAPending && !isBPending) return -1
      if (!isAPending && isBPending) return 1

      // If status is same, sort by date desc
      return (
        new Date(b.data_recebimento).getTime() -
        new Date(a.data_recebimento).getTime()
      )
    })
  },
}))
