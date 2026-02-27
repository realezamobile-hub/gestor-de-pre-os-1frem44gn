import { Database } from '@/lib/supabase/types'

export type Role = 'ADMIN' | 'VENDEDOR' | 'TECNICO' | 'ADMINISTRATIVO'
export type UserStatus = 'pending' | 'active' | 'blocked'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  phone: string
  address?: string | null
  rg?: string | null
  cpf?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
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
  valor: number | null
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

export interface BasePriceConfig {
  id: string
  modelo: string
  preco_base: number
  company_id?: string | null
}

export interface ChecklistCategory {
  id: string
  name: string
  company_id?: string | null
}

export interface ChecklistItem {
  id: string
  category_id: string
  nome: string
  company_id?: string | null
}

export interface PeripheralDiscountConfig {
  id: string
  nome: string
  valor_desconto: number
  modelo_id?: string | null
  checklist_item_id?: string | null
  company_id?: string | null
}

export interface Client {
  id: string
  company_id: string
  nome: string
  cpf: string
  rg?: string | null
  telefone: string
  endereco?: string | null
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
  type: 'anatel' | 'blacklist' | 'mdm' | 'document' | 'other' | 'image'
}

export interface Evaluation {
  id: string
  modelo: string
  serial_number: string | null
  checklist_data: any
  valor_final: number
  descontos_aplicados: any[]
  user_id: string
  company_id?: string | null
  created_at: string
  empresas?: { nome_fantasia: string } | null
  profiles?: { name: string | null } | null
  nome_cliente?: string | null
  telefone_cliente?: string | null
  cpf_cliente?: string | null
  cliente_id?: string | null
  client?: Client | null
  url_print_seguranca?: string | null
  url_foto_documento?: string | null
  arquivos_consulta?: ConsultationFile[] | null
  url_pesquisa_1?: string | null
  url_pesquisa_2?: string | null
  url_pesquisa_3?: string | null
  url_pesquisa_4?: string | null
  url_comprovante_pagamento?: string | null
}

export interface FilterState {
  search: string
  memory: string
  ram: string
  color: string
  dateRange: string
  supplier: string
  categories: string[]
}

export interface FilterOptions {
  memories: string[]
  rams: string[]
  colors: string[]
  categories: string[]
}

export interface ExcludedSupplier {
  id: string
  nome: string | null
  telefone: string | null
  criado_em: string | null
  company_id?: string | null
}

export interface PriceMonitorItem {
  id: number
  modelo: string | null
  valor: number | null
  fornecedor: string | null
  telefone: string | null
  categoria: string | null
  criado_em: string | null
}

export interface GeneratedList {
  id: string
  title: string | null
  content: string | null
  type: string | null
  created_at: string
  user_id: string
  company_id?: string | null
  profiles?: { name: string | null } | null
  header_footer_data?: any
  items_snapshot?: any
}

/* Leads Module Types */
export interface Lead {
  id: number
  nome_contato: string
  numero_contato: string
  mensagem_cliente: string
  link_acao: string
  status_atendimento: string // 'pendente' | 'atendido'
  data_recebimento: string
  atendido_por?: string | null
}

export interface BlacklistedContact {
  id: string
  nome_contato: string
  created_at: string
}
