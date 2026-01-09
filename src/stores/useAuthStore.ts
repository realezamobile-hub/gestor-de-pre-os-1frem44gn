import { create } from 'zustand'
import { User, UserStatus } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

interface AuthState {
  currentUser: User | null
  session: Session | null
  isLoading: boolean

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
  users: [],

  initialize: async () => {
    try {
      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      set({ session })

      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          // Add email from session if not in profile (it usually is synced but good to be safe for logic)
          const profileWithEmail = { ...profile, email: session.user.email }

          set({
            currentUser: mapProfileToUser(profileWithEmail),
          })

          // Update last active
          await supabase
            .from('profiles')
            .update({ last_active: new Date().toISOString() })
            .eq('id', profile.id)
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      set({ isLoading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session, isLoading: true })

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          const profileWithEmail = { ...profile, email: session.user.email }
          set({
            currentUser: mapProfileToUser(profileWithEmail),
            isLoading: false,
          })
        } else {
          set({ currentUser: null, isLoading: false })
        }
      } else {
        set({ currentUser: null, isLoading: false })
      }
    })
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

  toggleUserPermission: async (userId, permission) => {
    const user = get().users.find((u) => u.id === userId)
    if (!user) return

    // Don't allow toggling permissions for super admin via UI if logic prevents it, but here we just update DB
    // The mapProfileToUser will still enforce true for super admin on read

    const newValue = !user[permission]

    // Map TS property to DB column
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
