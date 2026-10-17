import type { UserRole } from "@/lib/roles";

export type AdminLocale = "ru" | "ro";
export type AdminSection = "overview" | "learning" | "quests" | "users" | "security";
export type ModuleStatus = "not_started" | "in_progress" | "completed";
export type ModuleBreakdown = { module_id: string; status: ModuleStatus; score: number; xp: number; completed_stages: number };
export type AdminUser = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  user_role: UserRole;
  created_at: string;
  last_sign_in_at: string | null;
  completed_modules: number;
  in_progress_modules: number;
  completed_stages: number;
  total_stages: number;
  total_xp: number;
  module_breakdown: ModuleBreakdown[];
};
export type AiBudgetStatus = { daily_used: number; daily_limit: number; monthly_used: number; monthly_limit: number; warning_percent: number };
export type AdminAccessStatus = { user_id: string; last_ip_seen_at: string | null; ip_blocked: boolean };
