// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      avaliacoes_iphone: {
        Row: {
          checklist_data: Json | null
          company_id: string | null
          created_at: string
          descontos_aplicados: Json | null
          id: string
          modelo: string
          serial_number: string | null
          user_id: string
          valor_final: number | null
        }
        Insert: {
          checklist_data?: Json | null
          company_id?: string | null
          created_at?: string
          descontos_aplicados?: Json | null
          id?: string
          modelo: string
          serial_number?: string | null
          user_id: string
          valor_final?: number | null
        }
        Update: {
          checklist_data?: Json | null
          company_id?: string | null
          created_at?: string
          descontos_aplicados?: Json | null
          id?: string
          modelo?: string
          serial_number?: string | null
          user_id?: string
          valor_final?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_iphone_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_iphone_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      config_descontos_perifericos: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          nome: string
          valor_desconto: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          nome: string
          valor_desconto?: number
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          nome?: string
          valor_desconto?: number
        }
        Relationships: [
          {
            foreignKeyName: "config_descontos_perifericos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      config_precos_base: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          modelo: string
          preco_base: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          modelo: string
          preco_base?: number
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          modelo?: string
          preco_base?: number
        }
        Relationships: [
          {
            foreignKeyName: "config_precos_base_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          configuracoes: Json | null
          created_at: string | null
          id: string
          modulos_ativos: Json | null
          nome_fantasia: string
          razao_social: string | null
          updated_at: string | null
        }
        Insert: {
          cnpj?: string | null
          configuracoes?: Json | null
          created_at?: string | null
          id?: string
          modulos_ativos?: Json | null
          nome_fantasia: string
          razao_social?: string | null
          updated_at?: string | null
        }
        Update: {
          cnpj?: string | null
          configuracoes?: Json | null
          created_at?: string | null
          id?: string
          modulos_ativos?: Json | null
          nome_fantasia?: string
          razao_social?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fornecedores_excluidos: {
        Row: {
          company_id: string | null
          criado_em: string | null
          id: string
          nome: string | null
          telefone: string | null
        }
        Insert: {
          company_id?: string | null
          criado_em?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
        }
        Update: {
          company_id?: string | null
          criado_em?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_excluidos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_lists: {
        Row: {
          company_id: string | null
          content: string | null
          created_at: string
          header_footer_data: Json | null
          id: string
          items_snapshot: Json | null
          title: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          content?: string | null
          created_at?: string
          header_footer_data?: Json | null
          id?: string
          items_snapshot?: Json | null
          title?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          content?: string | null
          created_at?: string
          header_footer_data?: Json | null
          id?: string
          items_snapshot?: Json | null
          title?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_lists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_lists_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_processadas: {
        Row: {
          created_at: string | null
          data_processamento: string | null
          data_recebimento: string | null
          hash_mensagem: string
          id: number
          participantphone: string | null
          quantidade_produtos: number | null
          sendername: string | null
          status: string | null
          texto_resumo: string | null
        }
        Insert: {
          created_at?: string | null
          data_processamento?: string | null
          data_recebimento?: string | null
          hash_mensagem: string
          id?: number
          participantphone?: string | null
          quantidade_produtos?: number | null
          sendername?: string | null
          status?: string | null
          texto_resumo?: string | null
        }
        Update: {
          created_at?: string | null
          data_processamento?: string | null
          data_recebimento?: string | null
          hash_mensagem?: string
          id?: number
          participantphone?: string | null
          quantidade_produtos?: number | null
          sendername?: string | null
          status?: string | null
          texto_resumo?: string | null
        }
        Relationships: []
      }
      produtos: {
        Row: {
          bateria: string | null
          categoria: string | null
          company_id: string | null
          cor: string | null
          criado_em: string
          data_venda: string | null
          em_estoque: boolean | null
          estado: string | null
          fornecedor: string | null
          id: number
          link_whatsapp: string | null
          memoria: string | null
          modelo: string | null
          modo: string | null
          obs: string | null
          ram: string | null
          telefone: string | null
          valor: number | null
        }
        Insert: {
          bateria?: string | null
          categoria?: string | null
          company_id?: string | null
          cor?: string | null
          criado_em?: string
          data_venda?: string | null
          em_estoque?: boolean | null
          estado?: string | null
          fornecedor?: string | null
          id?: number
          link_whatsapp?: string | null
          memoria?: string | null
          modelo?: string | null
          modo?: string | null
          obs?: string | null
          ram?: string | null
          telefone?: string | null
          valor?: number | null
        }
        Update: {
          bateria?: string | null
          categoria?: string | null
          company_id?: string | null
          cor?: string | null
          criado_em?: string
          data_venda?: string | null
          em_estoque?: boolean | null
          estado?: string | null
          fornecedor?: string | null
          id?: number
          link_whatsapp?: string | null
          memoria?: string | null
          modelo?: string | null
          modo?: string | null
          obs?: string | null
          ram?: string | null
          telefone?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos_menor_preco: {
        Row: {
          ativo: boolean | null
          categoria: string
          cores: string | null
          data_atualizacao: string | null
          id: number
          modelo: string
          preco_com_margem: number
          preco_original: number
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          cores?: string | null
          data_atualizacao?: string | null
          id?: number
          modelo: string
          preco_com_margem: number
          preco_original: number
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          cores?: string | null
          data_atualizacao?: string | null
          id?: number
          modelo?: string
          preco_com_margem?: number
          preco_original?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          can_access_evaluation: boolean | null
          can_create_list: boolean | null
          can_delete_records: boolean | null
          can_view_all_lists: boolean | null
          company_id: string | null
          created_at: string | null
          email: string | null
          id: string
          is_super_admin: boolean | null
          last_active: string | null
          name: string | null
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          can_access_evaluation?: boolean | null
          can_create_list?: boolean | null
          can_delete_records?: boolean | null
          can_view_all_lists?: boolean | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          is_super_admin?: boolean | null
          last_active?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          can_access_evaluation?: boolean | null
          can_create_list?: boolean | null
          can_delete_records?: boolean | null
          can_view_all_lists?: boolean | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_super_admin?: boolean | null
          last_active?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      ram_variacoes: {
        Row: {
          criado_em: string | null
          descricao: string | null
          gb: number
          id: number
        }
        Insert: {
          criado_em?: string | null
          descricao?: string | null
          gb: number
          id?: number
        }
        Update: {
          criado_em?: string | null
          descricao?: string | null
          gb?: number
          id?: number
        }
        Relationships: []
      }
      whatsapp_draft_items: {
        Row: {
          company_id: string | null
          created_at: string
          custom_details: string | null
          custom_model: string | null
          custom_price: number | null
          group_name: string | null
          id: string
          product_id: number | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          custom_details?: string | null
          custom_model?: string | null
          custom_price?: number | null
          group_name?: string | null
          id?: string
          product_id?: number | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          custom_details?: string | null
          custom_model?: string | null
          custom_price?: number | null
          group_name?: string | null
          id?: string
          product_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_draft_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_draft_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_draft_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_monitor_precos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_draft_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_produtos_visiveis"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_monitor_precos: {
        Row: {
          categoria: string | null
          criado_em: string | null
          fornecedor: string | null
          id: number | null
          modelo: string | null
          telefone: string | null
          valor: number | null
        }
        Relationships: []
      }
      v_produtos_menor_preco: {
        Row: {
          categoria: string | null
          cores: string | null
          data_atualizacao: string | null
          id: number | null
          margem_lucro: number | null
          modelo: string | null
          preco_com_margem: number | null
          preco_original: number | null
        }
        Insert: {
          categoria?: string | null
          cores?: string | null
          data_atualizacao?: string | null
          id?: number | null
          margem_lucro?: never
          modelo?: string | null
          preco_com_margem?: number | null
          preco_original?: number | null
        }
        Update: {
          categoria?: string | null
          cores?: string | null
          data_atualizacao?: string | null
          id?: number | null
          margem_lucro?: never
          modelo?: string | null
          preco_com_margem?: number | null
          preco_original?: number | null
        }
        Relationships: []
      }
      v_produtos_visiveis: {
        Row: {
          bateria: string | null
          categoria: string | null
          cor: string | null
          criado_em: string | null
          data_venda: string | null
          em_estoque: boolean | null
          estado: string | null
          fornecedor: string | null
          id: number | null
          link_whatsapp: string | null
          memoria: string | null
          modelo: string | null
          modo: string | null
          obs: string | null
          ram: string | null
          telefone: string | null
          valor: number | null
        }
        Insert: {
          bateria?: string | null
          categoria?: string | null
          cor?: string | null
          criado_em?: string | null
          data_venda?: string | null
          em_estoque?: boolean | null
          estado?: string | null
          fornecedor?: string | null
          id?: number | null
          link_whatsapp?: string | null
          memoria?: string | null
          modelo?: string | null
          modo?: string | null
          obs?: string | null
          ram?: string | null
          telefone?: string | null
          valor?: number | null
        }
        Update: {
          bateria?: string | null
          categoria?: string | null
          cor?: string | null
          criado_em?: string | null
          data_venda?: string | null
          em_estoque?: boolean | null
          estado?: string | null
          fornecedor?: string | null
          id?: number | null
          link_whatsapp?: string | null
          memoria?: string | null
          modelo?: string | null
          modo?: string | null
          obs?: string | null
          ram?: string | null
          telefone?: string | null
          valor?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_by_date: { Args: { target_date: string }; Returns: Json }
      cleanup_old_records: { Args: { p_target_date: string }; Returns: Json }
      delete_sold_items: { Args: never; Returns: number }
      delete_zero_value_products:
        | { Args: never; Returns: number }
        | { Args: { p_company_id: string }; Returns: number }
      get_my_claims: { Args: never; Returns: Json }
      get_product_filters:
        | {
            Args: { p_min_date: string; p_search_query: string }
            Returns: Json
          }
        | {
            Args: {
              p_min_date: string
              p_search_query: string
              p_supplier_filter?: string
            }
            Returns: Json
          }
      limpar_produtos_sem_valor: { Args: never; Returns: undefined }
      perform_daily_cleanup: { Args: { target_date: string }; Returns: Json }
      search_products: {
        Args: {
          battery_filter: string
          category_filters: string[]
          color_filter: string
          condition_filter: string
          in_stock_only: boolean
          memory_filter: string
          min_date: string
          ram_filter?: string
          search_query: string
          supplier_filter: string
        }
        Returns: {
          bateria: string | null
          categoria: string | null
          cor: string | null
          criado_em: string | null
          data_venda: string | null
          em_estoque: boolean | null
          estado: string | null
          fornecedor: string | null
          id: number | null
          link_whatsapp: string | null
          memoria: string | null
          modelo: string | null
          modo: string | null
          obs: string | null
          ram: string | null
          telefone: string | null
          valor: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "v_produtos_visiveis"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

