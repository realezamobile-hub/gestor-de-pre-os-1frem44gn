import { Database } from '@/lib/supabase/types'

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
  address?: string | null
  rg?: string | null
  cpf?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  avatarUrl?: string | null
  lastActive: string
  createdAt: string
  canCreateList: boolean
  canAccessEvaluation: boolean
  canDeleteRecords: boolean
  canViewAllLists: boolean
}

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
  product?: Product
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
  profiles?: { name: string | null } | null
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
  categories: string[]
}

export interface FilterOptions {
  memories: string[]
  rams: string[]
  colors: string[]
  categories: string[]
}

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

export interface Client {
  id: string
  company_id: string
  nome: string
  cpf: string
  rg?: string | null
  telefone: string
  // Legacy
  endereco?: string | null
  // New Fields
  cep?: string | null
  rua?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  municipio?: string | null
  estado?: string | null

  data_nascimento?: string | null
  email?: string | null
  origem?: string | null
  genero?: string | null
  url_foto?: string | null
  observacoes?: string | null

  nome_contato_emergencia?: string | null
  telefone_contato_emergencia?: string | null
  created_at: string
  updated_at: string
}

export interface ConsultationFile {
  name: string
  url: string
  type: 'anatel' | 'blacklist' | 'mdm' | 'document' | 'other'
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
  // Legacy fields
  nome_cliente?: string | null
  telefone_cliente?: string | null
  cpf_cliente?: string | null
  url_print_seguranca?: string | null
  url_foto_documento?: string | null
  // New fields
  cliente_id?: string | null
  client?: Client | null
  arquivos_consulta?: ConsultationFile[] | null
}
