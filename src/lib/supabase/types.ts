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
        Relationships: []
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
          can_create_list: boolean | null
          created_at: string | null
          email: string | null
          id: string
          last_active: string | null
          name: string | null
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          can_create_list?: boolean | null
          created_at?: string | null
          email?: string | null
          id: string
          last_active?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          can_create_list?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_active?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
    }
    Views: {
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
    }
    Functions: {
      [_ in never]: never
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

