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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      access_blocks: {
        Row: {
          active: boolean
          block_type: string
          block_value: string
          created_at: string
          created_by: string
          id: number
          reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          target_user_id: string | null
        }
        Insert: {
          active?: boolean
          block_type: string
          block_value: string
          created_at?: string
          created_by: string
          id?: never
          reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          target_user_id?: string | null
        }
        Update: {
          active?: boolean
          block_type?: string
          block_value?: string
          created_at?: string
          created_by?: string
          id?: never
          reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      ai_project_usage: {
        Row: {
          period_kind: string
          period_start: string
          total_requests: number
          updated_at: string
        }
        Insert: {
          period_kind: string
          period_start: string
          total_requests?: number
          updated_at?: string
        }
        Update: {
          period_kind?: string
          period_start?: string
          total_requests?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_daily: {
        Row: {
          active_request_id: string | null
          active_until: string | null
          audio_requests: number
          total_requests: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          active_request_id?: string | null
          active_until?: string | null
          audio_requests?: number
          total_requests?: number
          updated_at?: string
          usage_date: string
          user_id: string
        }
        Update: {
          active_request_id?: string | null
          active_until?: string | null
          audio_requests?: number
          total_requests?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_limits: {
        Row: {
          audio_daily_limit: number
          project_daily_limit: number
          project_monthly_limit: number
          singleton: boolean
          updated_at: string
          user_daily_limit: number
          user_monthly_limit: number
          warning_percent: number
        }
        Insert: {
          audio_daily_limit?: number
          project_daily_limit?: number
          project_monthly_limit?: number
          singleton?: boolean
          updated_at?: string
          user_daily_limit?: number
          user_monthly_limit?: number
          warning_percent?: number
        }
        Update: {
          audio_daily_limit?: number
          project_daily_limit?: number
          project_monthly_limit?: number
          singleton?: boolean
          updated_at?: string
          user_daily_limit?: number
          user_monthly_limit?: number
          warning_percent?: number
        }
        Relationships: []
      }
      ai_usage_monthly: {
        Row: {
          month_start: string
          total_requests: number
          updated_at: string
          user_id: string
        }
        Insert: {
          month_start: string
          total_requests?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          month_start?: string
          total_requests?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      module_catalog: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          max_xp: number
          position: number
          route: string | null
          title_ro: string
          title_ru: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_available?: boolean
          max_xp?: number
          position: number
          route?: string | null
          title_ro: string
          title_ru: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          max_xp?: number
          position?: number
          route?: string | null
          title_ro?: string
          title_ru?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_progress: {
        Row: {
          attempts: number
          completed_at: string | null
          module_id: string
          score: number
          status: string
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          module_id: string
          score?: number
          status?: string
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          module_id?: string
          score?: number
          status?: string
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      module_stage_catalog: {
        Row: {
          max_xp: number
          stage_index: number
          stage_kind: string
          title_ro: string
          title_ru: string
        }
        Insert: {
          max_xp: number
          stage_index: number
          stage_kind: string
          title_ro: string
          title_ru: string
        }
        Update: {
          max_xp?: number
          stage_index?: number
          stage_kind?: string
          title_ro?: string
          title_ru?: string
        }
        Relationships: []
      }
      module_stage_progress: {
        Row: {
          completed_at: string | null
          module_id: string
          score: number
          stage_index: number
          stage_kind: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          module_id: string
          score?: number
          stage_index: number
          stage_kind: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          module_id?: string
          score?: number
          stage_index?: number
          stage_kind?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_stage_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_stage_progress_stage_fkey"
            columns: ["stage_index", "stage_kind"]
            isOneToOne: false
            referencedRelation: "module_stage_catalog"
            referencedColumns: ["stage_index", "stage_kind"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          last_ip_hash: string | null
          last_ip_seen_at: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          last_ip_hash?: string | null
          last_ip_seen_at?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_ip_hash?: string | null
          last_ip_seen_at?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      quests: {
        Row: {
          config: Json
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          game_type: string
          id: string
          is_featured: boolean
          published_at: string | null
          route: string | null
          slug: string
          sort_order: number
          status: string
          summary_ro: string | null
          summary_ru: string | null
          title_ro: string
          title_ru: string
          updated_at: string
        }
        Insert: {
          config?: Json
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          game_type?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          route?: string | null
          slug: string
          sort_order?: number
          status?: string
          summary_ro?: string | null
          summary_ru?: string | null
          title_ro: string
          title_ru: string
          updated_at?: string
        }
        Update: {
          config?: Json
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          game_type?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          route?: string | null
          slug?: string
          sort_order?: number
          status?: string
          summary_ro?: string | null
          summary_ru?: string | null
          title_ro?: string
          title_ru?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_role_audit: {
        Row: {
          changed_at: string
          changed_by: string
          id: number
          new_role: string
          previous_role: string
          target_user_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: never
          new_role: string
          previous_role: string
          target_user_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: never
          new_role?: string
          previous_role?: string
          target_user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_ai_request: {
        Args: { p_has_audio: boolean; p_request_id: string }
        Returns: {
          audio_limit: number
          audio_used: number
          decision: string
          project_daily_limit: number
          project_daily_used: number
          project_monthly_limit: number
          project_monthly_used: number
          user_daily_limit: number
          user_daily_used: number
          user_monthly_limit: number
          user_monthly_used: number
        }[]
      }
      check_access_status: {
        Args: { p_ip_hash?: string }
        Returns: {
          block_source: string
          is_blocked: boolean
        }[]
      }
      complete_module_stage: {
        Args: {
          p_correct?: number
          p_module_id: string
          p_stage_index: number
          p_total?: number
        }
        Returns: {
          completed_stages: number
          module_score: number
          module_status: string
          module_xp: number
        }[]
      }
      get_admin_access_status: {
        Args: never
        Returns: {
          ip_blocked: boolean
          last_ip_seen_at: string
          user_id: string
        }[]
      }
      get_admin_dashboard: {
        Args: never
        Returns: {
          avatar_url: string
          completed_modules: number
          completed_stages: number
          created_at: string
          display_name: string
          email: string
          in_progress_modules: number
          last_sign_in_at: string
          module_breakdown: Json
          total_stages: number
          total_xp: number
          user_id: string
          user_role: string
        }[]
      }
      get_ai_budget_status: {
        Args: never
        Returns: {
          daily_limit: number
          daily_used: number
          monthly_limit: number
          monthly_used: number
          warning_percent: number
        }[]
      }
      get_ai_user_quota_status: {
        Args: never
        Returns: {
          audio_limit: number
          audio_used: number
          user_daily_limit: number
          user_daily_used: number
        }[]
      }
      release_ai_request: { Args: { p_request_id: string }; Returns: undefined }
      set_user_ip_block: {
        Args: { p_blocked: boolean; p_reason?: string; p_user_id: string }
        Returns: undefined
      }
      set_user_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
