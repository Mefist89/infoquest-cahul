export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";

export type Profile = import("@/lib/supabase/database.types").Tables<"profiles">;
export type ModuleProgressRow = import("@/lib/supabase/database.types").Tables<"module_progress">;
export type ModuleStageProgressRow = import("@/lib/supabase/database.types").Tables<"module_stage_progress">;
