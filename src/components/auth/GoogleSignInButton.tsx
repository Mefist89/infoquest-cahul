"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type AuthLocale = "ru" | "ro";

const copy = {
  ru: {
    button: "Продолжить с Google",
    loading: "Открываем Google…",
    error: "Не удалось открыть вход через Google. Попробуйте ещё раз.",
  },
  ro: {
    button: "Continuă cu Google",
    loading: "Deschidem Google…",
    error: "Autentificarea Google nu a putut fi deschisă. Încearcă din nou.",
  },
} satisfies Record<AuthLocale, Record<string, string>>;

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.07 12c0-.67.11-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.55l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  );
}

export function GoogleSignInButton({ locale, initialError = false }: { locale: AuthLocale; initialError?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError ? copy[locale].error : "");

  const signIn = async () => {
    setPending(true);
    setError("");

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", `/${locale}#missions`);

      const { error: authError } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          scopes: "openid email profile",
        },
      });

      if (authError) throw authError;
    } catch {
      setPending(false);
      setError(copy[locale].error);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="focus-ring flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 font-bold text-slate-900 shadow-[0_12px_35px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <GoogleMark />}
        {pending ? copy[locale].loading : copy[locale].button}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-center text-sm leading-relaxed text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
