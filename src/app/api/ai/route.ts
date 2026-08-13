import { NextResponse } from "next/server";

import {
  AudioValidationError,
  MAX_MULTIPART_BYTES,
  validateAudioFile,
  validateTranscript,
} from "@/features/ai-help/server/audio-validation";
import { createAiProvider, type AiChatMessage, type AiLocale as Locale } from "@/features/ai-help/server/openai-compatible-provider";
import { canUseAi, isUserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

function parseChatHistory(value: FormDataEntryValue | null): AiChatMessage[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is { role: "assistant" | "user"; content: string } => (
        Boolean(item) && typeof item === "object" &&
        ((item as { role?: unknown }).role === "assistant" || (item as { role?: unknown }).role === "user") &&
        typeof (item as { content?: unknown }).content === "string"
      ))
      .slice(-6)
      .map((item) => ({ role: item.role, content: item.content.trim().slice(0, 1200) }))
      .filter((item) => item.content.length > 0);
  } catch {
    return [];
  }
}

function errorText(locale: Locale, code: "key" | "input" | "audio" | "requestSize" | "audioFormat" | "audioDuration" | "audioSilent" | "transcriptSize" | "service" | "timeout" | "consent" | "auth" | "role" | "audioQuota" | "userDailyQuota" | "userMonthlyQuota" | "projectBudget" | "busy" | "quotaService") {
  const messages = {
    ro: {
      key: "Serviciul AI nu este configurat încă. Adaugă AI_API_KEY în variabilele de mediu.",
      input: "Scrie o întrebare sau atașează un fișier audio.",
      audio: "Fișierul audio trebuie să aibă maximum 4 MB și un format acceptat.",
      requestSize: "Solicitarea este prea mare. Fișierul audio poate avea maximum 4 MB.",
      audioFormat: "Conținutul fișierului nu corespunde unui format audio acceptat.",
      audioDuration: "Înregistrarea trebuie să aibă între 0,5 și 60 de secunde.",
      audioSilent: "Înregistrarea este goală sau prea silențioasă. Înregistrează din nou mai aproape de microfon.",
      transcriptSize: "Transcrierea audio este neobișnuit de mare și a fost oprită în siguranță.",
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
      requestSize: "Запрос слишком большой. Размер аудиофайла не должен превышать 4 МБ.",
      audioFormat: "Содержимое файла не соответствует поддерживаемому аудиоформату.",
      audioDuration: "Продолжительность записи должна быть от 0,5 до 60 секунд.",
      audioSilent: "Запись пустая или слишком тихая. Запишите её ещё раз ближе к микрофону.",
      transcriptSize: "Расшифровка аудио имеет необычно большой размер и была безопасно остановлена.",
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

export async function GET(request: Request) {
  const supabase = await createClient();
  const requestLocale: Locale = request.headers.get("x-infoquest-locale") === "ro" ? "ro" : "ru";
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonResponse({ error: errorText(requestLocale, "auth"), code: "authentication_required" }, 401);
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (profileError || !canUseAi(isUserRole(profile?.role) ? profile.role : null)) {
    return jsonResponse({ error: errorText(requestLocale, "role"), code: "role_required" }, 403);
  }

  const { data, error } = await supabase.rpc("get_ai_user_quota_status").single();
  if (error || !data) {
    console.error("Chrono quota status failed", error?.message || "Empty quota response");
    return jsonResponse({ error: errorText(requestLocale, "quotaService"), code: "quota_unavailable" }, 503);
  }

  return jsonResponse({
    audioRemaining: Math.max(0, data.audio_limit - data.audio_used),
    dailyRemaining: Math.max(0, data.user_daily_limit - data.user_daily_used),
  });
}

export async function POST(request: Request) {
  const requestLocale: Locale = request.headers.get("x-infoquest-locale") === "ro" ? "ro" : "ru";
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
      return jsonResponse({ error: errorText(requestLocale, "input"), code: "invalid_content_length" }, 400);
    }
    if (contentLength > MAX_MULTIPART_BYTES) {
      return jsonResponse({ error: errorText(requestLocale, "requestSize"), code: "request_too_large" }, 413);
    }
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonResponse({ error: errorText(requestLocale, "auth"), code: "authentication_required" }, 401);
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (profileError || !canUseAi(isUserRole(profile?.role) ? profile.role : null)) {
    return jsonResponse({ error: errorText(requestLocale, "role"), code: "role_required" }, 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonResponse({ error: errorText(requestLocale, "input"), code: "invalid_form_data" }, 400);
  }
  const locale: Locale = form.get("locale") === "ro" ? "ro" : "ru";
  if (form.get("dataConsent") !== "accepted") {
    return jsonResponse({ error: errorText(locale, "consent"), code: "consent_required" }, 400);
  }

  const provider = createAiProvider();
  if (!provider) return jsonResponse({ error: errorText(locale, "key"), code: "not_configured" }, 503);

  const mode = form.get("mode") === "chat" ? "chat" : "analyzer";
  const messageValue = form.get("message");
  const message = typeof messageValue === "string" ? messageValue.trim().slice(0, mode === "chat" ? 1200 : 4000) : "";
  const chatHistory = mode === "chat" ? parseChatHistory(form.get("history")) : [];
  const audioValue = form.get("audio");
  let audio: File | null = null;
  if (audioValue instanceof File && audioValue.size > 0) {
    try {
      audio = await validateAudioFile(audioValue);
    } catch (error) {
      if (error instanceof AudioValidationError) {
        const errorCode = error.code === "audio_format" ? "audioFormat" : error.code === "audio_duration" ? "audioDuration" : "audioSilent";
        return jsonResponse({ error: errorText(locale, errorCode), code: error.code }, error.code === "audio_format" ? 415 : 422);
      }
      return jsonResponse({ error: errorText(locale, "audio"), code: "invalid_audio" }, 400);
    }
  }

  if (!message && !audio) return jsonResponse({ error: errorText(locale, "input") }, 400);
  if (mode === "chat" && audio) return jsonResponse({ error: errorText(locale, "audio") }, 400);

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
    if (mode === "chat") {
      const reply = await provider.chat([...chatHistory, { role: "user", content: message }], locale, controller.signal);
      return jsonResponse({
        reply,
        dailyRemaining: Math.max(0, quota.user_daily_limit - quota.user_daily_used),
      });
    }

    let transcript = audio ? await provider.transcribeAudio(audio, locale, controller.signal) : "";
    if (audio) {
      try {
        transcript = validateTranscript(transcript);
      } catch (error) {
        if (error instanceof AudioValidationError) {
          const errorCode = error.code === "audio_silent" ? "audioSilent" : "transcriptSize";
          return jsonResponse({ error: errorText(locale, errorCode), code: error.code === "audio_silent" ? "audio_empty" : "transcript_too_large" }, 422);
        }
        throw error;
      }
    }
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
