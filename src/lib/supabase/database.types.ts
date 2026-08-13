// Generated-shape database contract. Refresh with `npm run supabase:types`
// after authenticating the Supabase CLI whenever the database schema changes.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      access_blocks: {
        Row: {
          active: boolean;
          block_type: string;
          block_value: string;
          created_at: string;
          created_by: string;
          id: number;
          reason: string | null;
          revoked_at: string | null;
          revoked_by: string | null;
          target_user_id: string | null;
        };
        Insert: {
          active?: boolean;
          block_type: string;
          block_value: string;
          created_at?: string;
          created_by: string;
          id?: never;
          reason?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
          target_user_id?: string | null;
        };
        Update: {
          active?: boolean;
          block_type?: string;
          block_value?: string;
          created_at?: string;
          created_by?: string;
          id?: never;
          reason?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
          target_user_id?: string | null;
        };
        Relationships: Relationship[];
      };
      ai_project_usage: {
        Row: { period_kind: string; period_start: string; total_requests: number; updated_at: string };
        Insert: { period_kind: string; period_start: string; total_requests?: number; updated_at?: string };
        Update: { period_kind?: string; period_start?: string; total_requests?: number; updated_at?: string };
        Relationships: Relationship[];
      };
      ai_usage_daily: {
        Row: {
          active_request_id: string | null;
          active_until: string | null;
          audio_requests: number;
          total_requests: number;
          updated_at: string;
          usage_date: string;
          user_id: string;
        };
        Insert: {
          active_request_id?: string | null;
          active_until?: string | null;
          audio_requests?: number;
          total_requests?: number;
          updated_at?: string;
          usage_date: string;
          user_id: string;
        };
        Update: {
          active_request_id?: string | null;
          active_until?: string | null;
          audio_requests?: number;
          total_requests?: number;
          updated_at?: string;
          usage_date?: string;
          user_id?: string;
        };
        Relationships: Relationship[];
      };
      ai_usage_limits: {
        Row: {
          audio_daily_limit: number;
          project_daily_limit: number;
          project_monthly_limit: number;
          singleton: boolean;
          updated_at: string;
          user_daily_limit: number;
          user_monthly_limit: number;
          warning_percent: number;
        };
        Insert: {
          audio_daily_limit?: number;
          project_daily_limit?: number;
          project_monthly_limit?: number;
          singleton?: boolean;
          updated_at?: string;
          user_daily_limit?: number;
          user_monthly_limit?: number;
          warning_percent?: number;
        };
        Update: {
          audio_daily_limit?: number;
          project_daily_limit?: number;
          project_monthly_limit?: number;
          singleton?: boolean;
          updated_at?: string;
          user_daily_limit?: number;
          user_monthly_limit?: number;
          warning_percent?: number;
        };
        Relationships: Relationship[];
      };
      ai_usage_monthly: {
        Row: { month_start: string; total_requests: number; updated_at: string; user_id: string };
        Insert: { month_start: string; total_requests?: number; updated_at?: string; user_id: string };
        Update: { month_start?: string; total_requests?: number; updated_at?: string; user_id?: string };
        Relationships: Relationship[];
      };
      module_catalog: {
        Row: {
          created_at: string;
          id: string;
          is_available: boolean;
          max_xp: number;
          position: number;
          route: string | null;
          title_ro: string;
          title_ru: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          is_available?: boolean;
          max_xp?: number;
          position: number;
          route?: string | null;
          title_ro: string;
          title_ru: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_available?: boolean;
          max_xp?: number;
          position?: number;
          route?: string | null;
          title_ro?: string;
          title_ru?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      module_progress: {
        Row: {
          attempts: number;
          completed_at: string | null;
          module_id: string;
          score: number;
          status: string;
          updated_at: string;
          user_id: string;
          xp: number;
        };
        Insert: {
          attempts?: number;
          completed_at?: string | null;
          module_id: string;
          score?: number;
          status?: string;
          updated_at?: string;
          user_id: string;
          xp?: number;
        };
        Update: {
          attempts?: number;
          completed_at?: string | null;
          module_id?: string;
          score?: number;
          status?: string;
          updated_at?: string;
          user_id?: string;
          xp?: number;
        };
        Relationships: Relationship[];
      };
      module_stage_catalog: {
        Row: { max_xp: number; stage_index: number; stage_kind: string; title_ro: string; title_ru: string };
        Insert: { max_xp: number; stage_index: number; stage_kind: string; title_ro: string; title_ru: string };
        Update: { max_xp?: number; stage_index?: number; stage_kind?: string; title_ro?: string; title_ru?: string };
        Relationships: Relationship[];
      };
      module_stage_progress: {
        Row: {
          completed_at: string | null;
          module_id: string;
          score: number;
          stage_index: number;
          stage_kind: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          module_id: string;
          score?: number;
          stage_index: number;
          stage_kind: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          module_id?: string;
          score?: number;
          stage_index?: number;
          stage_kind?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: Relationship[];
      };
      quests: {
        Row: {
          config: Json;
          cover_image_url: string | null;
          created_at: string;
          created_by: string | null;
          game_type: string;
          id: string;
          is_featured: boolean;
          published_at: string | null;
          route: string | null;
          slug: string;
          sort_order: number;
          status: string;
          summary_ro: string | null;
          summary_ru: string | null;
          title_ro: string;
          title_ru: string;
          updated_at: string;
        };
        Insert: {
          config?: Json;
          cover_image_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          game_type?: string;
          id?: string;
          is_featured?: boolean;
          published_at?: string | null;
          route?: string | null;
          slug: string;
          sort_order?: number;
          status?: string;
          summary_ro?: string | null;
          summary_ru?: string | null;
          title_ro: string;
          title_ru: string;
          updated_at?: string;
        };
        Update: {
          config?: Json;
          cover_image_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          game_type?: string;
          id?: string;
          is_featured?: boolean;
          published_at?: string | null;
          route?: string | null;
          slug?: string;
          sort_order?: number;
          status?: string;
          summary_ro?: string | null;
          summary_ru?: string | null;
          title_ro?: string;
          title_ru?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          last_ip_hash: string | null;
          last_ip_seen_at: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          last_ip_hash?: string | null;
          last_ip_seen_at?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          last_ip_hash?: string | null;
          last_ip_seen_at?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      user_role_audit: {
        Row: {
          changed_at: string;
          changed_by: string;
          id: number;
          new_role: string;
          previous_role: string;
          target_user_id: string;
        };
        Insert: {
          changed_at?: string;
          changed_by: string;
          id?: never;
          new_role: string;
          previous_role: string;
          target_user_id: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string;
          id?: never;
          new_role?: string;
          previous_role?: string;
          target_user_id?: string;
        };
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      acquire_ai_request: {
        Args: { p_has_audio: boolean; p_request_id: string };
        Returns: {
          audio_limit: number;
          audio_used: number;
          decision: string;
          project_daily_limit: number;
          project_daily_used: number;
          project_monthly_limit: number;
          project_monthly_used: number;
          user_daily_limit: number;
          user_daily_used: number;
          user_monthly_limit: number;
          user_monthly_used: number;
        }[];
      };
      check_access_status: {
        Args: { p_ip_hash?: string | null };
        Returns: { block_source: string | null; is_blocked: boolean }[];
      };
      complete_module_stage: {
        Args: { p_module_id: string; p_score?: number; p_stage_index: number };
        Returns: { completed_stages: number; module_score: number; module_status: string; module_xp: number }[];
      };
      get_admin_access_status: {
        Args: Record<PropertyKey, never>;
        Returns: { ip_blocked: boolean; last_ip_seen_at: string | null; user_id: string }[];
      };
      get_admin_dashboard: {
        Args: Record<PropertyKey, never>;
        Returns: {
          avatar_url: string | null;
          completed_modules: number;
          completed_stages: number;
          created_at: string;
          display_name: string | null;
          email: string;
          in_progress_modules: number;
          last_sign_in_at: string | null;
          module_breakdown: Json;
          total_stages: number;
          total_xp: number;
          user_id: string;
          user_role: string;
        }[];
      };
      get_ai_budget_status: {
        Args: Record<PropertyKey, never>;
        Returns: { daily_limit: number; daily_used: number; monthly_limit: number; monthly_used: number; warning_percent: number }[];
      };
      get_ai_user_quota_status: {
        Args: Record<PropertyKey, never>;
        Returns: { audio_limit: number; audio_used: number; user_daily_limit: number; user_daily_used: number }[];
      };
      release_ai_request: { Args: { p_request_id: string }; Returns: undefined };
      set_user_ip_block: {
        Args: { p_blocked: boolean; p_reason?: string | null; p_user_id: string };
        Returns: undefined;
      };
      set_user_role: { Args: { p_role: string; p_user_id: string }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<TableName extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][TableName]["Row"];
export type TablesInsert<TableName extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][TableName]["Insert"];
export type TablesUpdate<TableName extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][TableName]["Update"];
