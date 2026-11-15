"use client";

import { KeyRound, Loader2, Mail, RotateCcw } from "lucide-react";
import Script from "next/script";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { type AuthLocale, getOtpErrorMessage } from "./otp-errors";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "dark" | "light" | "auto";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

const RESEND_COOLDOWN_SECONDS = 60;

const copy = {
  ru: {
    emailLabel: "Ваш email",
    emailPlaceholder: "name@example.com",
    sendCode: "Получить код",
    sendingCode: "Отправляем код…",
    codeSentTo: "Мы отправили 6-значный код на",
    codeLabel: "Код из письма (6 цифр)",
    codePlaceholder: "000000",
    verifyCode: "Войти по коду",
    verifyingCode: "Проверяем код…",
    resendCode: "Отправить код ещё раз",
    resendIn: (seconds: number) => `Отправить код ещё раз (${seconds} с)`,
    changeEmail: "Изменить email",
    securityWarning: "InfoQuest никогда не попросит этот код по телефону или в сообщении.",
  },
  ro: {
    emailLabel: "Adresa ta de e-mail",
    emailPlaceholder: "nume@exemplu.md",
    sendCode: "Primește codul",
    sendingCode: "Trimitem codul…",
    codeSentTo: "Am trimis un cod din 6 cifre la",
    codeLabel: "Codul din e-mail (6 cifre)",
    codePlaceholder: "000000",
    verifyCode: "Autentificare cu codul",
    verifyingCode: "Verificăm codul…",
    resendCode: "Trimite codul din nou",
    resendIn: (seconds: number) => `Trimite codul din nou (${seconds} s)`,
    changeEmail: "Schimbă adresa de e-mail",
    securityWarning: "InfoQuest nu îți va cere niciodată acest cod la telefon sau prin mesaj.",
  },
} as const;

export function EmailOtpSignIn({
  locale,
  nextPath,
}: {
  locale: AuthLocale;
  nextPath?: string;
}) {
  const t = copy[locale];
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const safeNext = nextPath?.startsWith(`/${locale}/`) ? nextPath : `/${locale}/profile`;

  const renderTurnstile = useCallback(() => {
    if (!turnstileSiteKey || typeof window === "undefined" || !window.turnstile || !turnstileContainerRef.current) {
      return;
    }
    if (widgetIdRef.current !== null) {
      return;
    }
    widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: turnstileSiteKey,
      theme: "dark",
      callback: (token: string) => {
        setCaptchaToken(token);
      },
      "expired-callback": () => {
        setCaptchaToken("");
      },
      "error-callback": () => {
        setCaptchaToken("");
      },
    });
  }, [turnstileSiteKey]);

  const resetTurnstile = useCallback(() => {
    setCaptchaToken("");
    if (typeof window !== "undefined" && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current ?? undefined);
    }
  }, []);

  useEffect(() => {
    renderTurnstile();
    return () => {
      if (typeof window !== "undefined" && window.turnstile?.remove && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderTurnstile]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function requestOtp(event?: FormEvent) {
    event?.preventDefault();
    if (pending) return;

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError(getOtpErrorMessage(locale, "email_address_invalid"));
      return;
    }

    if (turnstileSiteKey && !captchaToken) {
      setError(getOtpErrorMessage(locale, "captcha_failed"));
      return;
    }

    setPending(true);
    setError("");

    try {
      const { error: authError } = await createClient().auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          ...(turnstileSiteKey ? { captchaToken } : {}),
        },
      });

      if (authError) {
        setError(getOtpErrorMessage(locale, authError.code));
        return;
      }

      setEmail(normalizedEmail);
      setCode("");
      setStep("code");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError(getOtpErrorMessage(locale));
    } finally {
      setPending(false);
      resetTurnstile();
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    if (pending) return;

    const cleanCode = code.replace(/\D/g, "").slice(0, 6);
    if (cleanCode.length !== 6) {
      setError(getOtpErrorMessage(locale, "otp_expired"));
      return;
    }

    setPending(true);
    setError("");

    try {
      const { error: authError } = await createClient().auth.verifyOtp({
        email: email.trim(),
        token: cleanCode,
        type: "email",
      });

      if (authError) {
        setError(getOtpErrorMessage(locale, authError.code ?? "otp_expired"));
        setPending(false);
        return;
      }

      window.location.assign(safeNext);
    } catch {
      setPending(false);
      setError(getOtpErrorMessage(locale));
    }
  }

  return (
    <div className="space-y-4">
      {turnstileSiteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          onReady={renderTurnstile}
        />
      )}

      {step === "email" ? (
        <form onSubmit={requestOtp} className="space-y-3.5" noValidate>
          <div>
            <label htmlFor="otp-email-input" className="block text-sm font-semibold text-foreground">
              {t.emailLabel}
            </label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="otp-email-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.emailPlaceholder}
                disabled={pending}
                className="focus-ring min-h-12 w-full rounded-2xl border border-border bg-background/70 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-neon/50 bg-neon/15 px-5 font-bold text-neon transition hover:border-neon hover:bg-neon/25 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Mail className="size-4" aria-hidden="true" />}
            {pending ? t.sendingCode : t.sendCode}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-3.5" noValidate>
          <div className="rounded-2xl border border-border/70 bg-background/40 px-3.5 py-2.5 text-sm">
            <p className="text-muted-foreground">
              {t.codeSentTo}{" "}
              <span className=" break-all font-semibold text-foreground">{email}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
              }}
              disabled={pending}
              className="focus-ring mt-1 text-sm font-semibold text-neon hover:underline"
            >
              {t.changeEmail}
            </button>
          </div>

          <div>
            <label htmlFor="otp-code-input" className="block text-sm font-semibold text-foreground">
              {t.codeLabel}
            </label>
            <input
              id="otp-code-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={t.codePlaceholder}
              disabled={pending}
              className="focus-ring mt-1.5 min-h-14 w-full rounded-2xl border border-neon/40 bg-background/80 px-4 text-center font-mono text-2xl font-black tracking-[0.35em] text-foreground placeholder:text-muted-foreground/40 disabled:opacity-60"
            />
            <p className="mt-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-sm leading-relaxed text-foreground/90">
              {t.securityWarning}
            </p>
          </div>

          <button
            type="submit"
            disabled={pending || code.length !== 6}
            className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neon px-5 font-black text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <KeyRound className="size-4" aria-hidden="true" />}
            {pending ? t.verifyingCode : t.verifyCode}
          </button>

          <button
            type="button"
            onClick={() => void requestOtp()}
            disabled={pending || cooldown > 0}
            className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/50 px-4 text-sm font-semibold text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {cooldown > 0 ? t.resendIn(cooldown) : t.resendCode}
          </button>
        </form>
      )}

      {turnstileSiteKey && (
        <div className="flex justify-center overflow-x-auto pt-1">
          <div ref={turnstileContainerRef} />
        </div>
      )}

      {error && (
        <p role="alert" className="text-center text-sm leading-relaxed text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
