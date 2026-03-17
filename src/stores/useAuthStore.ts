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
  syncUser: (session: Session | null) => Promise<void>
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: any }>
  register: (data: {
    name: string
    email: string
    password: string
    phone: string
    address: string
    rg: string
    cpf: string
    emergencyContactName: string
    emergencyContactPhone: string
    avatarUrl?: string
    avatarFile?: File | null
  }) => Promise<{ success: boolean; error?: any }>
  logout: () => Promise<void>
  resetPasswordForEmail: (
    email: string,
  ) => Promise<{ success: boolean; error?: any }>
  updatePassword: (
    password: string,
  ) => Promise<{ success: boolean; error?: any }>
  updateProfile: (
    data: Partial<User>,
  ) => Promise<{ success: boolean; error?: any }>
  uploadAvatar: (
    file: File,
  ) => Promise<{ success: boolean; url?: string; error?: any }>
  adminUploadAvatar: (
    userId: string,
    file: File,
  ) => Promise<{ success: boolean; url?: string; error?: any }>
  users: User[]
  fetchUsers: () => Promise<void>
  adminUpdateUser: (
    userId: string,
    data: Partial<User>,
  ) => Promise<{ success: boolean; error?: any }>
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>
  updateUserRole: (userId: string, role: Role) => Promise<void>
  updateUserCompany: (userId: string, companyId: string) => Promise<void>
  toggleUserPermission: (
    userId: string,
    permission: keyof User,
  ) => Promise<void>
}

const mapProfileToUser = (profile: any): User => {
  let role: Role = 'VENDEDOR'
  const rawRole = (profile.role || '').toUpperCase()
  if (rawRole === 'ADMIN') role = 'ADMIN'
  else if (rawRole === 'TECNICO') role = 'TECNICO'
  else if (rawRole === 'ADMINISTRATIVO') role = 'ADMINISTRATIVO'
  else if (rawRole === 'USER') role = 'VENDEDOR'

  const isSuperAdmin =
    profile.is_super_admin || profile.email === 'realezamobile@gmail.com'

  return {
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    role: role,
    status: (profile.status as UserStatus) || 'pending',
    phone: profile.phone || '',
    address: profile.address,
    rg: profile.rg,
    cpf: profile.cpf,
    emergencyContactName: profile.emergency_contact_name,
    emergencyContactPhone: profile.emergency_contact_phone,
    avatarUrl: profile.avatar_url,
    lastActive:
      profile.last_active || profile.created_at || new Date(0).toISOString(),
    createdAt: profile.created_at || new Date().toISOString(),
    companyId: profile.company_id,
    isSuperAdmin: isSuperAdmin,
    canCreateList: profile.can_create_list || isSuperAdmin || false,
    canAccessEvaluation: profile.can_access_evaluation || isSuperAdmin || false,
    canDeleteRecords: profile.can_delete_records || isSuperAdmin || false,
    canViewAllLists: profile.can_view_all_lists || isSuperAdmin || false,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  currentCompany: null,
  session: null,
  isLoading: true,
  initialized: false,
  users: [],

  syncUser: async (session: Session | null) => {
    if (session?.user) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile && !error) {
          const profileWithEmail = { ...profile, email: session.user.email }
          const user = mapProfileToUser(profileWithEmail)
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
            session,
            isLoading: false,
          })
          await supabase
            .from('profiles')
            .update({ last_active: new Date().toISOString() })
            .eq('id', profile.id)
        } else {
          // If no profile exists for the user, sign out to prevent invalid states
          await supabase.auth.signOut()
          set({
            currentUser: null,
            currentCompany: null,
            session: null,
            isLoading: false,
          })
        }
      } catch (e) {
        console.error('Exception fetching profile', e)
        await supabase.auth.signOut()
        set({
          currentUser: null,
          currentCompany: null,
          session: null,
          isLoading: false,
        })
      }
    } else {
      set({
        currentUser: null,
        currentCompany: null,
        session: null,
        isLoading: false,
      })
    }
  },

  initialize: async () => {
    if (get().initialized) return
    set({ initialized: true, isLoading: true })
    const { syncUser } = get()
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        await syncUser(session)
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ isLoading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        const currentId = get().currentUser?.id
        if (currentId !== session?.user.id) {
          set({ isLoading: true })
          await syncUser(session)
        }
      } else if (event === 'SIGNED_OUT') {
        set({
          session: null,
          currentUser: null,
          currentCompany: null,
          isLoading: false,
        })
      } else if (event === 'TOKEN_REFRESHED') {
        set({ session })
      }
    })
  },

  login: async (email, password) => {
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      set({ isLoading: false })
      return { success: false, error }
    }
    if (data.session) {
      await get().syncUser(data.session)
    } else {
      set({ isLoading: false })
    }
    return { success: true }
  },

  register: async (data) => {
    const {
      name,
      email,
      password,
      phone,
      address,
      rg,
      cpf,
      emergencyContactName,
      emergencyContactPhone,
      avatarUrl,
      avatarFile,
    } = data
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          address,
          rg,
          cpf,
          emergency_contact_name: emergencyContactName,
          emergency_contact_phone: emergencyContactPhone,
          avatar_url: avatarUrl,
        },
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) return { success: false, error }
    if (authData.user) {
      await supabase
        .from('profiles')
        .update({
          name,
          phone,
          address,
          rg,
          cpf,
          emergency_contact_name: emergencyContactName,
          emergency_contact_phone: emergencyContactPhone,
          avatar_url: avatarUrl,
        })
        .eq('id', authData.user.id)
      if (avatarFile) {
        try {
          const fileExt = avatarFile.name.split('.').pop()
          const fileName = `${authData.user.id}/${Date.now()}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile, { upsert: true })
          if (!uploadError) {
            const {
              data: { publicUrl },
            } = supabase.storage.from('avatars').getPublicUrl(fileName)
            await supabase
              .from('profiles')
              .update({ avatar_url: publicUrl })
              .eq('id', authData.user.id)
          }
        } catch (e) {
          console.error('Avatar upload failed during registration', e)
        }
      }
    }
    return { success: true }
  },

  logout: async () => {
    set({ isLoading: true })
    await supabase.auth.signOut()
    set({
      currentUser: null,
      currentCompany: null,
      session: null,
      isLoading: false,
    })
  },

  resetPasswordForEmail: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) return { success: false, error }
    return { success: true }
  },

  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { success: false, error }
    return { success: true }
  },

  updateProfile: async (data) => {
    const { currentUser, syncUser, session } = get()
    if (!currentUser) return { success: false, error: 'User not found' }
    const dbUpdates: any = {}
    if (data.name !== undefined) dbUpdates.name = data.name
    if (data.phone !== undefined) dbUpdates.phone = data.phone
    if (data.address !== undefined) dbUpdates.address = data.address
    if (data.rg !== undefined) dbUpdates.rg = data.rg
    if (data.cpf !== undefined) dbUpdates.cpf = data.cpf
    if (data.emergencyContactName !== undefined)
      dbUpdates.emergency_contact_name = data.emergencyContactName
    if (data.emergencyContactPhone !== undefined)
      dbUpdates.emergency_contact_phone = data.emergencyContactPhone
    if (data.avatarUrl !== undefined) dbUpdates.avatar_url = data.avatarUrl
    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', currentUser.id)
    if (error) return { success: false, error }
    await syncUser(session)
    return { success: true }
  },

  uploadAvatar: async (file) => {
    const { currentUser, syncUser, session } = get()
    if (!currentUser) return { success: false, error: 'User not found' }
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser.id)
      if (updateError) throw updateError
      await syncUser(session)
      return { success: true, url: publicUrl }
    } catch (error) {
      console.error('Avatar upload error:', error)
      return { success: false, error }
    }
  },

  adminUploadAvatar: async (userId, file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
      if (updateError) throw updateError
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, avatarUrl: publicUrl } : u,
        ),
        currentUser:
          state.currentUser?.id === userId
            ? { ...state.currentUser, avatarUrl: publicUrl }
            : state.currentUser,
      }))
      return { success: true, url: publicUrl }
    } catch (error) {
      console.error('Admin avatar upload error:', error)
      return { success: false, error }
    }
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

  adminUpdateUser: async (userId, data) => {
    const dbUpdates: any = {}
    if (data.name !== undefined) dbUpdates.name = data.name
    if (data.phone !== undefined) dbUpdates.phone = data.phone
    if (data.role !== undefined) dbUpdates.role = data.role
    if (data.status !== undefined) dbUpdates.status = data.status
    if (data.companyId !== undefined) dbUpdates.company_id = data.companyId
    if (data.canCreateList !== undefined)
      dbUpdates.can_create_list = data.canCreateList
    if (data.canAccessEvaluation !== undefined)
      dbUpdates.can_access_evaluation = data.canAccessEvaluation
    if (data.canDeleteRecords !== undefined)
      dbUpdates.can_delete_records = data.canDeleteRecords
    if (data.canViewAllLists !== undefined)
      dbUpdates.can_view_all_lists = data.canViewAllLists
    if (data.address !== undefined) dbUpdates.address = data.address
    if (data.rg !== undefined) dbUpdates.rg = data.rg
    if (data.cpf !== undefined) dbUpdates.cpf = data.cpf
    if (data.emergencyContactName !== undefined)
      dbUpdates.emergency_contact_name = data.emergencyContactName
    if (data.emergencyContactPhone !== undefined)
      dbUpdates.emergency_contact_phone = data.emergencyContactPhone
    if (data.avatarUrl !== undefined) dbUpdates.avatar_url = data.avatarUrl
    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
    if (error) return { success: false, error }
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, ...data } : u)),
    }))
    return { success: true }
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
    if (permission === 'canViewAllLists') dbColumn = 'can_view_all_lists'
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
