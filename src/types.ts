export type Role = 'ADMIN' | 'VENDEDOR' | 'TECNICO' | 'ADMINISTRATIVO'
export type UserStatus = 'pending' | 'active' | 'blocked'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  phone: string
  lastActive: string
  createdAt: string
  companyId?: string | null
  avatarUrl?: string | null
  isSuperAdmin: boolean
  canCreateList: boolean
  canAccessEvaluation: boolean
  canDeleteRecords: boolean
  canViewAllLists: boolean
}

export interface Company {
  id: string
  nome_fantasia: string
  razao_social: string | null
  cnpj: string | null
  modulos_ativos: string[]
  configuracoes?: any
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  modelo: string
  categoria: string
  memoria: string | null
  cor: string | null
  valor: number
  fornecedor: string | null
  em_estoque: boolean
  estado: string | null
  bateria: string | null
  ram: string | null
  obs: string | null
  telefone: string | null
  link_whatsapp: string | null
  criado_em: string
  data_venda?: string | null
  company_id?: string | null
  modo?: string | null
}

export interface DraftItem {
  id: string
  product_id?: number | null
  product?: Product | null
  custom_model?: string | null
  custom_price?: number | null
  custom_details?: string | null
  group_name?: string | null
  user_id: string
  company_id?: string | null
  created_at: string
}

export interface GeneratorConfigData {
  header: string
  footer: string
  communityLink: string
  contactNumber: string
  markup: number
}
