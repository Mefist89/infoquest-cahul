function requirePublicEnv(name: string, value: string | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return normalized;
}

function requireSupabaseUrl(value: string | undefined) {
  const url = requirePublicEnv("NEXT_PUBLIC_SUPABASE_URL", value);

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") {
      throw new Error("Supabase URL must use HTTPS outside local development");
    }
  } catch (error) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL", { cause: error });
  }

  return url;
}

export const supabaseConfig = Object.freeze({
  url: requireSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  publishableKey: requirePublicEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
});
