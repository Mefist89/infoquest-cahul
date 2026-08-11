import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";
import { supabaseConfig } from "@/lib/supabase/config";

export function createClient() {
  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey);
}
