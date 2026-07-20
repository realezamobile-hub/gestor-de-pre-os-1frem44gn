import { create } from 'zustand'
import {
  User,
  UserStatus,
  Role,
  Company,
  SubscriptionStatus,
  SubscriptionType,
  PaymentLog,
} from '@/types'
import {
  createUser,
  adminChangePassword,
  deleteUserPermanently,
  releaseUserAccess,
  renewUserAccess,
} from '@/services/manage-user-access'
import { supabase } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

let _skipSessionCheck = false
let _adminActionInProgress = false
let _adminActionTimeout: ReturnType<typeof setTimeout> | null = null

function setAdminActionInProgress(value: boolean) {
  _adminActionInProgress = value
  if (_adminActionTimeout) {
    clearTimeout(_adminActionTimeout)
  }
  if (value) {
    _adminActionTimeout = setTimeout(() => {
      _adminActionInProgress = false
    }, 30000)
  }
}

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
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: any }>
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>
  updateUserRole: (userId: string, role: Role) => Promise<void>
  updateUserCompany: (userId: string, companyId: string) => Promise<void>
  toggleUserPermission: (
    userId: string,
    permission: keyof User,
  ) => Promise<void>
  inviteUser: (data: {
    email: string
    name: string
    password: string
    role: Role
    companyId?: string
    subscriptionType: SubscriptionType
    monthlyFee?: number
    activeModules: string[]
  }) => Promise<{ success: boolean; error?: any }>
  changeUserPassword: (
    userId: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: any }>
  releaseUser: (
    userId: string,
    accessAllowed: boolean,
    subscriptionStatus: SubscriptionStatus,
  ) => Promise<{ success: boolean; error?: any }>
  grantTrial: (userId: string) => Promise<{ success: boolean; error?: any }>
  renewUser: (userId: string) => Promise<{ success: boolean; error?: any }>
  fetchOnlineUsers: () => Promise<void>
  onlineUsers: User[]
  paymentLogs: PaymentLog[]
  fetchPayments: () => Promise<void>
  checkSessionValidity: () => Promise<void>
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
    role,
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
    isSuperAdmin,
    canCreateList: profile.can_create_list || isSuperAdmin || false,
    canAccessEvaluation: profile.can_access_evaluation || isSuperAdmin || false,
    canDeleteRecords: profile.can_delete_records || isSuperAdmin || false,
    canViewAllLists: profile.can_view_all_lists || isSuperAdmin || false,
    subscriptionStatus:
      (profile.subscription_status as SubscriptionStatus) ||
      (isSuperAdmin || role === 'ADMIN' ? 'active' : 'pending'),
    accessAllowed: profile.access_allowed ?? (isSuperAdmin || role === 'ADMIN'),
    accessExpiresAt: profile.access_expires_at,
    currentSessionId: profile.current_session_id,
    lastLoginAt: profile.last_login_at,
    subscriptionType:
      (profile.subscription_type as SubscriptionType) || 'trial',
    monthlyFee: profile.monthly_fee ?? null,
    nextBillingDate: profile.next_billing_date ?? null,
    activeModules:
      profile.active_modules ||
      (isSuperAdmin || role === 'ADMIN'
        ? [
            'melhor_preco',
            'leads',
            'generator',
            'evaluation',
            'cadastro',
            'reports',
            'admin',
          ]
        : ['melhor_preco']),
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  currentCompany: null,
  session: null,
  isLoading: true,
  initialized: false,
  users: [],
  paymentLogs: [],
  onlineUsers: [],

  syncUser: async (session: Session | null) => {
    if (session?.user) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile && !error) {
          if (!_skipSessionCheck && !_adminActionInProgress) {
            const localSessionId = localStorage.getItem('app_session_id')
            const dbSessionId = profile.current_session_id
            if (
              localSessionId &&
              dbSessionId &&
              localSessionId !== dbSessionId
            ) {
              sessionStorage.setItem(
                'session_invalidated_message',
                'Este usuário já está conectado em outro dispositivo.',
              )
              await supabase.auth.signOut()
              localStorage.removeItem('app_session_id')
              set({
                currentUser: null,
                currentCompany: null,
                session: null,
                isLoading: false,
              })
              return
            }
          }

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
          const isAuthError =
            error &&
            (error.message?.includes('JWT') ||
              error.message?.includes('Invalid token') ||
              error.message?.includes('Session expired') ||
              error.message?.includes('invalid claim'))
          if (isAuthError) {
            await supabase.auth.signOut()
            set({
              currentUser: null,
              currentCompany: null,
              session: null,
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        }
      } catch (e) {
        console.error('Exception fetching profile', e)
        if (!_adminActionInProgress) {
          const isAuthError =
            e?.message?.includes('JWT') ||
            e?.message?.includes('Invalid token') ||
            e?.message?.includes('Session expired')
          if (isAuthError) {
            await supabase.auth.signOut()
            set({
              currentUser: null,
              currentCompany: null,
              session: null,
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        }
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
        if (_adminActionInProgress) {
          set({ session })
          return
        }
        const currentId = get().currentUser?.id
        if (currentId !== session?.user.id) {
          set({ isLoading: true })
          await syncUser(session)
        }
      } else if (event === 'SIGNED_OUT') {
        if (_adminActionInProgress) return
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

    setInterval(async () => {
      await get().checkSessionValidity()
    }, 30000)
  },

  login: async (email, password) => {
    set({ isLoading: true })
    _skipSessionCheck = true
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      _skipSessionCheck = false
      set({ isLoading: false })
      return { success: false, error }
    }
    if (data.session) {
      const sessionId = crypto.randomUUID()
      localStorage.setItem('app_session_id', sessionId)
      await supabase
        .from('profiles')
        .update({
          current_session_id: sessionId,
          last_login_at: new Date().toISOString(),
        })
        .eq('id', data.user.id)
      _skipSessionCheck = false
      await get().syncUser(data.session)
    } else {
      _skipSessionCheck = false
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
    localStorage.removeItem('app_session_id')
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

  deleteUser: async (userId) => {
    setAdminActionInProgress(true)
    try {
      const { error } = await deleteUserPermanently(userId)
      if (error) {
        await supabase.from('profiles').delete().eq('id', userId)
      }
      set((state) => ({ users: state.users.filter((u) => u.id !== userId) }))
      return { success: true }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, error }
    } finally {
      setAdminActionInProgress(false)
    }
  },

  inviteUser: async (data) => {
    setAdminActionInProgress(true)
    try {
      const result = await createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        companyId: data.companyId,
        subscriptionType: data.subscriptionType,
        monthlyFee: data.monthlyFee ?? 0,
        activeModules: data.activeModules,
      })

      if (result.error) {
        return { success: false, error: result.error }
      }

      await get().fetchUsers()
      return { success: true }
    } catch (error) {
      console.error('Invite user error:', error)
      return {
        success: false,
        error: { message: (error as Error)?.message || 'Erro inesperado' },
      }
    } finally {
      setAdminActionInProgress(false)
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
    if (data.subscriptionStatus !== undefined)
      dbUpdates.subscription_status = data.subscriptionStatus
    if (data.accessAllowed !== undefined)
      dbUpdates.access_allowed = data.accessAllowed
    if (data.accessExpiresAt !== undefined)
      dbUpdates.access_expires_at = data.accessExpiresAt
    if (data.subscriptionType !== undefined)
      dbUpdates.subscription_type = data.subscriptionType
    if (data.monthlyFee !== undefined) dbUpdates.monthly_fee = data.monthlyFee
    if (data.nextBillingDate !== undefined)
      dbUpdates.next_billing_date = data.nextBillingDate
    if (data.activeModules !== undefined)
      dbUpdates.active_modules = data.activeModules
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

  releaseUser: async (userId, accessAllowed, subscriptionStatus) => {
    try {
      const { error } = await releaseUserAccess(
        userId,
        accessAllowed,
        subscriptionStatus,
      )
      if (error) return { success: false, error }
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, accessAllowed, subscriptionStatus } : u,
        ),
      }))
      return { success: true }
    } catch (error) {
      console.error('Release user error:', error)
      return { success: false, error }
    }
  },

  grantTrial: async (userId) => {
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 10)
    const trialEndIso = trialEnd.toISOString()
    const { error } = await supabase
      .from('profiles')
      .update({
        access_expires_at: trialEndIso,
        access_allowed: true,
        subscription_status: 'active',
        subscription_type: 'trial',
        next_billing_date: trialEndIso,
      })
      .eq('id', userId)
    if (error) return { success: false, error }
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              accessExpiresAt: trialEndIso,
              accessAllowed: true,
              subscriptionType: 'trial',
              nextBillingDate: trialEndIso,
            }
          : u,
      ),
    }))
    return { success: true }
  },

  renewUser: async (userId) => {
    setAdminActionInProgress(true)
    try {
      const { error } = await renewUserAccess(userId)
      if (error) return { success: false, error }
      await get().fetchUsers()
      await get().fetchPayments()
      return { success: true }
    } catch (error) {
      console.error('Renew user error:', error)
      return { success: false, error }
    } finally {
      setAdminActionInProgress(false)
    }
  },

  changeUserPassword: async (userId, newPassword) => {
    setAdminActionInProgress(true)
    try {
      const { error } = await adminChangePassword(userId, newPassword)
      if (error) return { success: false, error }
      return { success: true }
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, error }
    } finally {
      setAdminActionInProgress(false)
    }
  },

  fetchPayments: async () => {
    const { data, error } = await supabase
      .from('payment_logs')
      .select('*')
      .order('payment_date', { ascending: false })
    if (!error && data) {
      set({ paymentLogs: data as PaymentLog[] })
    }
  },

  fetchOnlineUsers: async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .gte('last_active', fiveMinutesAgo)
      .order('last_active', { ascending: false })
    if (!error && data) {
      set({ onlineUsers: data.map(mapProfileToUser) })
    }
  },

  checkSessionValidity: async () => {
    const { currentUser } = get()
    if (!currentUser) return
    if (_adminActionInProgress) return

    const localSessionId = localStorage.getItem('app_session_id')
    if (!localSessionId) return

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(
          'current_session_id, access_allowed, subscription_status, status, access_expires_at, next_billing_date, subscription_type',
        )
        .eq('id', currentUser.id)
        .single()

      if (error || !profile) {
        return
      }

      if (
        profile.current_session_id &&
        profile.current_session_id !== localSessionId
      ) {
        sessionStorage.setItem(
          'session_invalidated_message',
          'Este usuário já está conectado em outro dispositivo.',
        )
        await supabase.auth.signOut()
        localStorage.removeItem('app_session_id')
        set({
          currentUser: null,
          currentCompany: null,
          session: null,
          isLoading: false,
        })
        return
      }

      const isAdmin = currentUser.isSuperAdmin || currentUser.role === 'ADMIN'
      if (!isAdmin) {
        if (profile.status === 'blocked') {
          await supabase.auth.signOut()
          localStorage.removeItem('app_session_id')
          set({
            currentUser: null,
            currentCompany: null,
            session: null,
            isLoading: false,
          })
          return
        }

        if (
          profile.next_billing_date &&
          new Date(profile.next_billing_date) < new Date()
        ) {
          await supabase
            .from('profiles')
            .update({ access_allowed: false, subscription_status: 'expired' })
            .eq('id', currentUser.id)
          sessionStorage.setItem(
            'session_invalidated_message',
            'Sua assinatura expirou. Entre em contato com o administrador para renovar.',
          )
          await supabase.auth.signOut()
          localStorage.removeItem('app_session_id')
          set({
            currentUser: null,
            currentCompany: null,
            session: null,
            isLoading: false,
          })
          return
        }

        if (
          profile.access_expires_at &&
          new Date(profile.access_expires_at) < new Date()
        ) {
          sessionStorage.setItem(
            'session_invalidated_message',
            'Seu período de acesso expirou. Entre em contato com o administrador.',
          )
          await supabase.auth.signOut()
          localStorage.removeItem('app_session_id')
          set({
            currentUser: null,
            currentCompany: null,
            session: null,
            isLoading: false,
          })
          return
        }

        if (profile.access_allowed === false) {
          sessionStorage.setItem(
            'session_invalidated_message',
            'Seu acesso foi revogado. Entre em contato com o administrador.',
          )
          await supabase.auth.signOut()
          localStorage.removeItem('app_session_id')
          set({
            currentUser: null,
            currentCompany: null,
            session: null,
            isLoading: false,
          })
          return
        }
      }

      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', currentUser.id)
    } catch {
      // Silent fail for polling
    }
  },
}))
