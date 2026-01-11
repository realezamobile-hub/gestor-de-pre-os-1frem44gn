import { create } from 'zustand'
import { User, UserStatus, Role } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

interface AuthState {
  currentUser: User | null
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
  toggleUserPermission: (
    userId: string,
    permission: keyof User,
  ) => Promise<void>
}

const SUPER_ADMIN_EMAIL = 'realezamobile@gmail.com'

const mapProfileToUser = (profile: any): User => {
  const isSuperAdmin = profile.email === SUPER_ADMIN_EMAIL

  return {
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    role: isSuperAdmin ? 'admin' : (profile.role as 'admin' | 'user') || 'user',
    status: (profile.status as UserStatus) || 'pending',
    phone: profile.phone || '',
    lastActive: profile.last_active || new Date().toISOString(),
    createdAt: profile.created_at || new Date().toISOString(),
    canCreateList: isSuperAdmin ? true : profile.can_create_list || false,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
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
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile && !error) {
            const profileWithEmail = { ...profile, email: session.user.email }
            set({
              currentUser: mapProfileToUser(profileWithEmail),
              isLoading: false,
            })

            // Update last active silently
            await supabase
              .from('profiles')
              .update({ last_active: new Date().toISOString() })
              .eq('id', profile.id)
          } else {
            set({ currentUser: null, isLoading: false })
          }
        } catch (e) {
          console.error('Error fetching profile', e)
          set({ currentUser: null, isLoading: false })
        }
      } else {
        set({ currentUser: null, isLoading: false })
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
    set({ currentUser: null, session: null })
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

  toggleUserPermission: async (userId, permission) => {
    const user = get().users.find((u) => u.id === userId)
    if (!user) return

    const newValue = !user[permission]
    const dbColumn =
      permission === 'canCreateList' ? 'can_create_list' : permission

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
