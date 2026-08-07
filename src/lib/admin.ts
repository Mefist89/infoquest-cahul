export const ADMIN_EMAILS = ["jeniabortnic@gmail.com", "pucalmaria@gmail.com"] as const;

export function isAdminEmail(email: string | null | undefined) {
  return typeof email === "string" && ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}
