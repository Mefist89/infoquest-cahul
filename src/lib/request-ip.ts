import "server-only";

export function requestIp(headers: Headers) {
  const forwarded = headers.get("x-vercel-forwarded-for")
    ?? headers.get("x-forwarded-for")
    ?? headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim().toLowerCase() || null;
}

export async function hashIp(ip: string | null) {
  const salt = process.env.BLOCKLIST_IP_SALT;
  if (!ip || !salt) return null;
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
