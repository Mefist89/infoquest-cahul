export function rememberLocale(locale: "ro" | "ru") {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Keep language navigation available if browser settings prevent cookies.
  }
}
