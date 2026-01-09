import { Database } from '@/lib/supabase/types'

export type Role = 'admin' | 'user'

export type UserStatus = 'pending' | 'active' | 'blocked'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  phone?: string
  lastActive: string
  createdAt: string
  canCreateList: boolean
}

// Map directly to Supabase table row
export type Product = Database['public']['Tables']['produtos']['Row']

export interface FilterState {
  search: string
  category: string
  memory: string
  color: string
  condition: string
  supplier: string
  battery: string
  inStockOnly: boolean
  dateRange: 'today' | 'last_2_days' | 'all'
}
