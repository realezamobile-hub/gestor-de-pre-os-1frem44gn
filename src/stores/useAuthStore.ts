import { create } from 'zustand'
import { User, UserStatus, Role, Company } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

interface AuthState {
  currentUser: User | null
  currentCompany: Company | null
  session: Session | null
  isLoading: boolean
  initialized: boolean

  initialize: () => Promise<void>
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: any }>
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
  ) => Promise<{ success: boolean; error?: any }>
  logout: () => Promise<void>

  // Admin actions
  users: User[]
  fetchUsers: () => Promise<void>
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>
  updateUserRole: (userId: string, role: Role) => Promise<void>
  updateUserCompany: (userId: string, companyId: string) => Promise<void>
  toggleUserPermission: (
    userId: string,
    permission: keyof User,
  ) => Promise<void>
}

const mapProfileToUser = (profile: any): User => {
  // Normalize Role (handling legacy 'admin'/'user' strings)
  let role: Role = 'VENDEDOR'
  const rawRole = (profile.role || '').toUpperCase()
  if (rawRole === 'ADMIN') role = 'ADMIN'
  else if (rawRole === 'TECNICO') role = 'TECNICO'
  else if (rawRole === 'ADMINISTRATIVO') role = 'ADMINISTRATIVO'
  else if (rawRole === 'USER') role = 'VENDEDOR' // Map legacy

  return {
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    role: role,
    status: (profile.status as UserStatus) || 'pending',
    phone: profile.phone || '',
    lastActive: profile.last_active || new Date().toISOString(),
    createdAt: profile.created_at || new Date().toISOString(),
    companyId: profile.company_id,
    isSuperAdmin: profile.is_super_admin || false,
    canCreateList: profile.can_create_list || false,
    canAccessEvaluation: profile.can_access_evaluation || false,
    canDeleteRecords: profile.can_delete_records || false,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  currentCompany: null,
  session: null,
  isLoading: true,
  initialized: false,
  users: [],

  initialize: async () => {
    if (get().initialized) return
    set({ initialized: true })

    const syncUser = async (session: Session | null) => {
      if (session?.user) {
        try {
          // Fetch Profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile && !error) {
            const profileWithEmail = { ...profile, email: session.user.email }
            const user = mapProfileToUser(profileWithEmail)

            // Fetch Company
            let company = null
            if (user.companyId) {
              const { data: companyData } = await supabase
                .from('empresas')
                .select('*')
                .eq('id', user.companyId)
                .single()
              company = companyData
            }

            set({
              currentUser: user,
              currentCompany: company,
              isLoading: false,
            })

            // Update last active silently
            await supabase
              .from('profiles')
              .update({ last_active: new Date().toISOString() })
              .eq('id', profile.id)
          } else {
            set({ currentUser: null, currentCompany: null, isLoading: false })
          }
        } catch (e) {
          console.error('Error fetching profile', e)
          set({ currentUser: null, currentCompany: null, isLoading: false })
        }
      } else {
        set({ currentUser: null, currentCompany: null, isLoading: false })
      }
    }

    // Set up auth state listener FIRST
    supabase.auth.onAuthStateChange((event, session) => {
      set({ session, isLoading: true })
      syncUser(session)
    })

    // THEN check for existing session
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      set({ session })
      await syncUser(session)
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ isLoading: false })
    }
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) return { success: false, error }
    return { success: true }
  },

  register: async (name, email, password, phone) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) return { success: false, error }
    return { success: true }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ currentUser: null, currentCompany: null, session: null })
  },

  fetchUsers: async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && profiles) {
      const mappedUsers: User[] = profiles.map(mapProfileToUser)
      set({ users: mappedUsers })
    }
  },

  updateUserStatus: async (userId, status) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId)

    if (!error) {
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? { ...u, status } : u)),
      }))
    }
  },

  updateUserRole: async (userId, role) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    if (!error) {
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? { ...u, role } : u)),
      }))
    }
  },

  updateUserCompany: async (userId, companyId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ company_id: companyId })
      .eq('id', userId)

    if (!error) {
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, companyId } : u,
        ),
      }))
    }
  },

  toggleUserPermission: async (userId, permission) => {
    const user = get().users.find((u) => u.id === userId)
    if (!user) return

    const newValue = !user[permission]
    let dbColumn = ''

    if (permission === 'canCreateList') dbColumn = 'can_create_list'
    if (permission === 'canAccessEvaluation') dbColumn = 'can_access_evaluation'
    if (permission === 'canDeleteRecords') dbColumn = 'can_delete_records'

    if (!dbColumn) return

    const { error } = await supabase
      .from('profiles')
      .update({ [dbColumn]: newValue })
      .eq('id', userId)

    if (!error) {
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, [permission]: newValue } : u,
        ),
      }))
    }
  },
}))
