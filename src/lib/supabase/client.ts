import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qfmjjhitknwnbfblohvw.supabase.co";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_XGbrZYx2vxkck6Z-o2AMYA_ncucKEVD";

  return createBrowserClient(url, publishableKey);
}
