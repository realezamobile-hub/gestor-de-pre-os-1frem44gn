import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserStatus } from '@/types'
import { INITIAL_ADMIN } from '@/lib/data'
import { v4 as uuidv4 } from 'uuid'

interface AuthState {
  currentUser: User | null
  users: User[]
  currentSessionId: string | null

  login: (email: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  register: (name: string, email: string, phone: string) => Promise<void>
  checkSession: () => void
  updateActivity: () => void

  // Admin actions
  getUsers: () => User[]
  updateUserStatus: (userId: string, status: UserStatus) => void
  toggleUserPermission: (userId: string, permission: keyof User) => void
  killSession: (userId: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [INITIAL_ADMIN],
      currentSessionId: null,

      login: async (email) => {
        // Mock delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const userIndex = get().users.findIndex((u) => u.email === email)
        const user = get().users[userIndex]

        if (!user) {
          return { success: false, message: 'Usuário não encontrado.' }
        }

        if (user.status === 'blocked') {
          return { success: false, message: 'Conta bloqueada.' }
        }

        if (user.status === 'pending') {
          return {
            success: false,
            message: 'Sua conta ainda está em análise.',
          }
        }

        // Generate new session ID to invalidate previous sessions (Single Session Logic)
        const newSessionId = uuidv4()

        const updatedUser = {
          ...user,
          lastActive: new Date().toISOString(),
          currentSessionId: newSessionId,
        }

        const updatedUsers = [...get().users]
        updatedUsers[userIndex] = updatedUser

        set({
          users: updatedUsers,
          currentUser: updatedUser,
          currentSessionId: newSessionId,
        })

        return { success: true }
      },

      logout: () => {
        const { currentUser, users } = get()
        if (currentUser) {
          const userIndex = users.findIndex((u) => u.id === currentUser.id)
          if (userIndex !== -1) {
            const updatedUsers = [...users]
            updatedUsers[userIndex] = { ...currentUser, currentSessionId: null }
            set({ users: updatedUsers })
          }
        }
        set({ currentUser: null, currentSessionId: null })
      },

      register: async (name, email, phone) => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const newUser: User = {
          id: uuidv4(),
          name,
          email,
          phone,
          role: 'user',
          status: 'pending',
          lastActive: new Date().toISOString(),
          currentSessionId: null,
          createdAt: new Date().toISOString(),
          canCreateList: false, // Default to false
        }
        set((state) => ({ users: [...state.users, newUser] }))
      },

      checkSession: () => {
        const { currentUser, currentSessionId, users } = get()
        if (!currentUser || !currentSessionId) return

        // Fetch fresh user data from "DB" (persisted state)
        const freshUser = users.find((u) => u.id === currentUser.id)

        if (!freshUser) {
          get().logout()
          return
        }

        // Check simultaneous access (Session Security)
        if (freshUser.currentSessionId !== currentSessionId) {
          get().logout()
          return
        }

        // Check timeout (double check alongside hook)
        const lastActiveTime = new Date(freshUser.lastActive).getTime()
        const now = new Date().getTime()
        if (now - lastActiveTime > 60 * 60 * 1000) {
          // 1 hour
          get().logout()
        }
      },

      updateActivity: () => {
        const { currentUser, users } = get()
        if (!currentUser) return

        const now = new Date().toISOString()
        const userIndex = users.findIndex((u) => u.id === currentUser.id)

        if (userIndex !== -1) {
          const updatedUsers = [...users]
          updatedUsers[userIndex] = {
            ...updatedUsers[userIndex],
            lastActive: now,
          }
          set({
            users: updatedUsers,
            currentUser: { ...currentUser, lastActive: now },
          })
        }
      },

      getUsers: () => get().users,

      updateUserStatus: (userId, status) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, status } : u,
          ),
        }))
      },

      toggleUserPermission: (userId, permission) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, [permission]: !u[permission as keyof User] }
              : u,
          ),
        }))
      },

      killSession: (userId) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, currentSessionId: null } : u,
          ),
        }))
      },
    }),
    {
      name: 'app-auth-storage',
    },
  ),
)
