drop policy if exists "ai_usage_select_own" on public.ai_usage_daily;
revoke all on table public.ai_usage_daily from public, anon, authenticated;
