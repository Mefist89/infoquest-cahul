import { NextResponse } from "next/server";

import { requestIp } from "@/lib/request-ip";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type DemoLocale = "ru" | "ro";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 40;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_MAX_REQUESTS) {
    return false;
  }
  bucket.count += 1;
  return true;
}

function errorMessage(
  locale: DemoLocale,
  code: "invalid" | "rateLimit" | "anonDisabled" | "failed",
) {
  const messages = {
    ru: {
      invalid: "Заполни имя, фамилию и класс.",
      rateLimit: "Слишком много попыток регистрации. Подожди немного и попробуй снова.",
      anonDisabled: "Демо-вход временно не активирован в настройках Supabase (включите Anonymous Sign-Ins).",
      failed: "Не удалось создать демо-профиль. Попробуй ещё раз.",
    },
    ro: {
      invalid: "Completează prenumele, numele și clasa.",
      rateLimit: "Prea multe încercări de înregistrare. Așteaptă puțin și încearcă din nou.",
      anonDisabled: "Autentificarea demo nu este activată în Supabase (activează Anonymous Sign-Ins).",
      failed: "Nu s-a putut crea profilul demo. Încearcă din nou.",
    },
  } as const;
  return messages[locale][code];
}

function normalizeField(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed = (await request.json()) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ error: errorMessage("ru", "invalid") }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: errorMessage("ru", "invalid") }, { status: 400 });
  }

  const locale: DemoLocale = body.locale === "ro" ? "ro" : "ru";
  const firstName = normalizeField(body.firstName, 60);
  const lastName = normalizeField(body.lastName, 60);
  const schoolClass = normalizeField(body.schoolClass, 24);

  if (!firstName || !lastName || !schoolClass) {
    return NextResponse.json(
      { error: errorMessage(locale, "invalid"), code: "invalid_input" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const ipKey = requestIp(request.headers) ?? "unknown";
  if (!checkRateLimit(ipKey)) {
    return NextResponse.json(
      { error: errorMessage(locale, "rateLimit"), code: "rate_limited" },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = await createClient();
  const { data: existingAuth } = await supabase.auth.getUser();
  let createdAnonymousSession = false;

  if (!existingAuth.user) {
    const { error: signInError } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          school_class: schoolClass,
          is_demo: true,
        },
      },
    });

    if (signInError) {
      const lower = signInError.message.toLowerCase();
      const isAnonDisabled = lower.includes("anonymous") && (lower.includes("disabled") || lower.includes("not allowed"));
      console.error("Demo anonymous sign-in failed", signInError.message);
      return NextResponse.json(
        {
          error: errorMessage(locale, isAnonDisabled ? "anonDisabled" : "failed"),
          code: isAnonDisabled ? "anonymous_disabled" : "auth_failed",
        },
        { status: isAnonDisabled ? 503 : 500, headers: { "Cache-Control": "no-store" } },
      );
    }
    createdAnonymousSession = true;
  }

  const { error: registerError } = await supabase.rpc("register_demo_student", {
    p_first_name: firstName,
    p_last_name: lastName,
    p_school_class: schoolClass,
    p_locale: locale,
  });

  if (registerError) {
    console.error("register_demo_student RPC failed", registerError.message);
    if (createdAnonymousSession) {
      await supabase.auth.signOut().catch(() => {});
    }
    return NextResponse.json(
      { error: errorMessage(locale, "failed"), code: "register_failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { ok: true, redirectTo: `/${locale}/profile` },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
