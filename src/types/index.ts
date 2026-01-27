import { Database } from '@/lib/supabase/types'

// Updated Roles based on User Story
export type Role = 'ADMIN' | 'VENDEDOR' | 'TECNICO' | 'ADMINISTRATIVO'

export type UserStatus = 'pending' | 'active' | 'blocked'

export interface Company {
  id: string
  nome_fantasia: string
  razao_social?: string
  cnpj?: string
  modulos_ativos: string[]
  configuracoes?: Record<string, any>
  created_at: string
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  companyId: string
  isSuperAdmin: boolean
  phone?: string
  lastActive: string
  createdAt: string
  // Legacy permissions (can be mapped to Roles later, but keeping for backward compat in UI logic)
  canCreateList: boolean
  canAccessEvaluation: boolean
  canDeleteRecords: boolean
}

// Map directly to Supabase table row and extend with new columns
export type Product = Database['public']['Tables']['produtos']['Row'] & {
  ram?: string | null
  company_id?: string
}

export interface DraftItem {
  id: string
  user_id: string
  product_id: number
  custom_model?: string | null
  custom_details?: string | null
  custom_price?: number | null
  group_name?: string | null
  created_at: string
  product?: Product // Joined product data
  company_id?: string
}

export interface GeneratorConfigData {
  header: string
  footer: string
  communityLink: string
  contactNumber: string
  markup: number
}

export interface GeneratedList {
  id: string
  user_id: string
  title: string | null
  content: string | null
  type: 'supplier' | 'posting' | null
  header_footer_data: GeneratorConfigData | null
  items_snapshot: DraftItem[] | null
  created_at: string
  company_id?: string
}

export interface ExcludedSupplier {
  id: string
  nome: string | null
  telefone: string | null
  criado_em: string
  company_id?: string
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

export type DateRangeFilter = 'today' | 'yesterday' | 'all'

export interface FilterState {
  search: string
  memory: string
  ram: string
  color: string
  dateRange: DateRangeFilter
  supplier: string
}

export interface FilterOptions {
  memories: string[]
  rams: string[]
  colors: string[]
}

// Evaluation Module Types
export interface BasePriceConfig {
  id: string
  modelo: string
  preco_base: number
  created_at: string
  company_id?: string
}

export interface PeripheralDiscountConfig {
  id: string
  nome: string
  valor_desconto: number
  created_at: string
  company_id?: string
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
  company_id?: string
  empresas?: {
    nome_fantasia: string
  } | null
}
