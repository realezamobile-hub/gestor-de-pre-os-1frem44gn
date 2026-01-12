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
  canAccessEvaluation: boolean
}

// Map directly to Supabase table row and extend with new columns
export type Product = Database['public']['Tables']['produtos']['Row'] & {
  ram?: string | null
}

export interface ExcludedSupplier {
  id: string
  nome: string | null
  telefone: string | null
  criado_em: string
}

export interface PriceMonitorItem {
  id: number
  modelo: string
  categoria: string | null
  valor: number
  fornecedor: string | null
  telefone: string | null
  criado_em: string
}

export interface FilterState {
  search: string
  category: string[]
  memory: string
  color: string
  condition: string
  supplier: string
  battery: string
  inStockOnly: boolean
  dateRange: 'today' | 'last_2_days' | 'all'
}

// Evaluation Module Types
export interface BasePriceConfig {
  id: string
  modelo: string
  preco_base: number
  created_at: string
}

export interface PeripheralDiscountConfig {
  id: string
  nome: string
  valor_desconto: number
  created_at: string
}

export interface Evaluation {
  id: string
  user_id: string
  modelo: string
  serial_number: string
  checklist_data: Record<string, any>
  valor_final: number
  descontos_aplicados: PeripheralDiscountConfig[]
  created_at: string
}
