import { NextResponse } from "next/server";

import { createAiProvider, type AiLocale as Locale } from "@/features/ai-help/server/openai-compatible-provider";
import { canUseAi, isUserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
  "audio/flac",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/weba",
  "audio/ogg",
]);

type QuotaDecision = {
  decision: "acquired" | "audio_limit" | "user_daily_limit" | "user_monthly_limit" | "project_daily_limit" | "project_monthly_limit" | "busy";
  audio_used: number;
  audio_limit: number;
  user_daily_used: number;
  user_daily_limit: number;
  user_monthly_used: number;
  user_monthly_limit: number;
  project_daily_used: number;
  project_daily_limit: number;
  project_monthly_used: number;
  project_monthly_limit: number;
};

function errorText(locale: Locale, code: "key" | "input" | "audio" | "service" | "timeout" | "consent" | "auth" | "role" | "audioQuota" | "userDailyQuota" | "userMonthlyQuota" | "projectBudget" | "busy" | "quotaService") {
  const messages = {
    ro: {
      key: "Serviciul AI nu este configurat încă. Adaugă AI_API_KEY în variabilele de mediu.",
      input: "Scrie o întrebare sau atașează un fișier audio.",
      audio: "Fișierul audio trebuie să aibă maximum 4 MB și un format acceptat.",
      service: "Chrono nu poate analiza mesajul acum. Încearcă din nou peste puțin timp.",
      timeout: "Analiza a durat prea mult și a fost oprită în siguranță. Încearcă din nou.",
      consent: "Confirmă acordul privind prelucrarea datelor înainte de trimitere.",
      auth: "Autentifică-te în contul InfoQuest pentru a folosi Chrono.",
      role: "Chrono este disponibil elevilor, profesorilor și administratorilor.",
      audioQuota: "Ai folosit cele 3 analize audio disponibile astăzi. Limita se resetează la miezul nopții UTC.",
      userDailyQuota: "Ai atins limita zilnică de solicitări Chrono. Limita se resetează la miezul nopții UTC.",
      userMonthlyQuota: "Ai atins limita lunară de solicitări Chrono.",
      projectBudget: "Bugetul temporar Chrono al proiectului a fost atins. Serviciul va reveni după resetarea limitei.",
      busy: "Chrono analizează deja o altă solicitare a ta. Așteaptă finalizarea ei.",
      quotaService: "Chrono nu poate verifica limita de utilizare acum. Încearcă din nou peste puțin timp.",
    },
    ru: {
      key: "AI-сервис пока не настроен. Добавьте AI_API_KEY в переменные окружения.",
      input: "Напишите вопрос или прикрепите аудиофайл.",
      audio: "Аудиофайл должен быть не больше 4 МБ и иметь поддерживаемый формат.",
      service: "Chrono сейчас не может выполнить анализ. Попробуйте ещё раз немного позже.",
      timeout: "Анализ занял слишком много времени и был безопасно остановлен. Попробуйте ещё раз.",
      consent: "Подтвердите согласие на обработку данных перед отправкой.",
      auth: "Войдите в аккаунт InfoQuest, чтобы пользоваться Chrono.",
      role: "Chrono доступен ученикам, учителям и администраторам.",
      audioQuota: "Сегодня вы уже использовали 3 доступных аудиоанализа. Лимит обновится в полночь по UTC.",
      userDailyQuota: "Достигнут дневной лимит запросов Chrono. Лимит обновится в полночь по UTC.",
      userMonthlyQuota: "Достигнут месячный лимит запросов Chrono.",
      projectBudget: "Временный бюджет Chrono для всего проекта исчерпан. Сервис вернётся после обновления лимита.",
      busy: "Chrono уже обрабатывает другой ваш запрос. Дождитесь его завершения.",
      quotaService: "Сейчас Chrono не может проверить лимит использования. Попробуйте немного позже.",
    },
  } as const;
  return messages[locale][code];
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getRequestTimeoutMs() {
  const configured = Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 45_000);
  if (!Number.isFinite(configured)) return 45_000;
  return Math.max(10_000, Math.min(55_000, Math.round(configured)));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const requestLocale: Locale = request.headers.get("x-infoquest-locale") === "ro" ? "ro" : "ru";
  if (authError || !authData.user) {
    return jsonResponse({ error: errorText(requestLocale, "auth"), code: "authentication_required" }, 401);
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (profileError || !canUseAi(isUserRole(profile?.role) ? profile.role : null)) {
    return jsonResponse({ error: errorText(requestLocale, "role"), code: "role_required" }, 403);
  }

  const form = await request.formData();
  const locale: Locale = form.get("locale") === "ro" ? "ro" : "ru";
  if (form.get("dataConsent") !== "accepted") {
    return jsonResponse({ error: errorText(locale, "consent"), code: "consent_required" }, 400);
  }

  const provider = createAiProvider();
  if (!provider) return jsonResponse({ error: errorText(locale, "key"), code: "not_configured" }, 503);

  const messageValue = form.get("message");
  const message = typeof messageValue === "string" ? messageValue.trim().slice(0, 4000) : "";
  const audioValue = form.get("audio");
  const audio = audioValue instanceof File && audioValue.size > 0 ? audioValue : null;

  if (!message && !audio) return jsonResponse({ error: errorText(locale, "input") }, 400);
  if (audio && (audio.size > MAX_AUDIO_BYTES || !ALLOWED_AUDIO_TYPES.has(audio.type))) {
    return jsonResponse({ error: errorText(locale, "audio") }, 400);
  }

  const requestId = crypto.randomUUID();
  const { data: quotaData, error: quotaError } = await supabase
    .rpc("acquire_ai_request", { p_has_audio: Boolean(audio), p_request_id: requestId })
    .single();
  const quota = quotaData as QuotaDecision | null;

  if (quotaError || !quota || !["acquired", "audio_limit", "user_daily_limit", "user_monthly_limit", "project_daily_limit", "project_monthly_limit", "busy"].includes(quota.decision)) {
    console.error("Chrono quota acquisition failed", quotaError?.message || "Invalid quota response");
    return jsonResponse({ error: errorText(locale, "quotaService"), code: "quota_unavailable" }, 503);
  }
  if (quota.decision === "audio_limit") {
    return jsonResponse({ error: errorText(locale, "audioQuota"), code: "audio_daily_limit", limit: quota.audio_limit }, 429);
  }
  if (quota.decision === "user_daily_limit") {
    return jsonResponse({ error: errorText(locale, "userDailyQuota"), code: "user_daily_limit", limit: quota.user_daily_limit }, 429);
  }
  if (quota.decision === "user_monthly_limit") {
    return jsonResponse({ error: errorText(locale, "userMonthlyQuota"), code: "user_monthly_limit", limit: quota.user_monthly_limit }, 429);
  }
  if (quota.decision === "project_daily_limit" || quota.decision === "project_monthly_limit") {
    return jsonResponse({ error: errorText(locale, "projectBudget"), code: quota.decision }, 503);
  }
  if (quota.decision === "busy") {
    return jsonResponse({ error: errorText(locale, "busy"), code: "request_in_progress" }, 409);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getRequestTimeoutMs());

  try {
    const transcript = audio ? await provider.transcribeAudio(audio, locale, controller.signal) : "";
    const combinedInput = [
      message ? `User question:\n${message}` : "",
      transcript ? `Audio transcript:\n${transcript}` : "",
    ].filter(Boolean).join("\n\n");
    const analysis = await provider.analyzeContent(combinedInput, locale, controller.signal);
    return jsonResponse({
      analysis,
      transcript,
      audioRemaining: audio ? Math.max(0, quota.audio_limit - quota.audio_used) : undefined,
      dailyRemaining: Math.max(0, quota.user_daily_limit - quota.user_daily_used),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return jsonResponse({ error: errorText(locale, "timeout"), code: "provider_timeout" }, 504);
    }
    console.error("Chrono AI analysis failed", error instanceof Error ? error.message : error);
    return jsonResponse({ error: errorText(locale, "service") }, 502);
  } finally {
    clearTimeout(timeout);
    const { error: releaseError } = await supabase.rpc("release_ai_request", { p_request_id: requestId });
    if (releaseError) console.error("Chrono quota release failed", releaseError.message);
  }
}
