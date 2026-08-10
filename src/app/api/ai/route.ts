import { NextResponse } from "next/server";

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

type Locale = "ro" | "ru";
type Verdict = "likely_scam" | "suspicious" | "unclear" | "likely_safe";
type FraudAnalysis = {
  verdict: Verdict;
  risk: number;
  summary: string;
  signals: string[];
  actions: string[];
  reply: string;
  disclaimer: string;
};

type AiConfig = {
  apiKey: string;
  baseUrl: string;
  analysisModel: string;
  transcriptionModel: string;
};

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

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
  error?: { message?: string };
};

const fraudAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string", enum: ["likely_scam", "suspicious", "unclear", "likely_safe"] },
    risk: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    signals: { type: "array", items: { type: "string" }, maxItems: 5 },
    actions: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
    reply: { type: "string" },
    disclaimer: { type: "string" },
  },
  required: ["verdict", "risk", "summary", "signals", "actions", "reply", "disclaimer"],
} as const;

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

function getAiConfig(): AiConfig | null {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const baseUrl = (process.env.AI_API_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const tokenRouter = new URL(baseUrl).hostname === "api.tokenrouter.com";
  return {
    apiKey,
    baseUrl,
    analysisModel: process.env.AI_ANALYSIS_MODEL || process.env.OPENAI_ANALYSIS_MODEL || (tokenRouter ? "openai/gpt-5.5" : "gpt-5-mini"),
    transcriptionModel: process.env.AI_TRANSCRIPTION_MODEL || (tokenRouter ? "openai/gpt-4o-mini-transcribe" : "gpt-4o-mini-transcribe"),
  };
}

function extractChatText(payload: ChatCompletionResponse) {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const text = content.map((item) => item.text || "").join("").trim();
    if (text) return text;
  }
  throw new Error("AI response did not contain output text");
}

function isFraudAnalysis(value: unknown): value is FraudAnalysis {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<FraudAnalysis>;
  return (
    ["likely_scam", "suspicious", "unclear", "likely_safe"].includes(item.verdict ?? "") &&
    typeof item.risk === "number" && item.risk >= 0 && item.risk <= 100 &&
    typeof item.summary === "string" &&
    Array.isArray(item.signals) && item.signals.every((signal) => typeof signal === "string") &&
    Array.isArray(item.actions) && item.actions.every((action) => typeof action === "string") &&
    typeof item.reply === "string" &&
    typeof item.disclaimer === "string"
  );
}

async function transcribeAudio(file: File, config: AiConfig, locale: Locale, signal: AbortSignal) {
  const body = new FormData();
  const isWeba = file.name.toLowerCase().endsWith(".weba") || file.type === "audio/weba";
  const uploadFile = isWeba
    ? new File([file], file.name.replace(/\.weba$/i, ".webm"), { type: "audio/webm" })
    : file;
  body.append("file", uploadFile, uploadFile.name || "recording.webm");
  body.append("model", config.transcriptionModel);
  body.append("language", locale);
  body.append("prompt", "InfoQuest, Chrono, operator, cod SMS, parolă, card bancar, мошенничество, оператор, SMS-код, пароль, банковская карта");

  const response = await fetch(`${config.baseUrl}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}` },
    body,
    signal,
  });
  const payload = await response.json() as { text?: string; error?: { message?: string } };
  if (!response.ok || typeof payload.text !== "string") throw new Error(payload.error?.message || "Audio transcription failed");
  return payload.text.trim();
}

async function analyzeContent(input: string, config: AiConfig, locale: Locale, signal: AbortSignal) {
  const language = locale === "ro" ? "Romanian" : "Russian";
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.analysisModel,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content: `You are Chrono, the InfoQuest digital-safety mentor for students, teachers, families, and community members. Analyze only the evidence contained in the user's text or audio transcript. Reply in ${language}. Never claim certainty, identify a real person, authenticate a voice, or say that an audio recording alone proves fraud. Explain concrete social-engineering signals such as urgency, secrecy, threats, requests for SMS codes, passwords, remote access, payments, crypto, or suspicious links. If evidence is insufficient, choose unclear. Keep the reply calm, educational, and concise. Never ask the user to publish passwords, banking data, SMS codes, or identity documents. Recommend verification through official channels.`,
        },
        { role: "user", content: input },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "fraud_analysis",
          strict: true,
          schema: fraudAnalysisSchema,
        },
      },
    }),
    signal,
  });

  const payload = await response.json() as ChatCompletionResponse;
  if (!response.ok) throw new Error(payload.error?.message || "Chat Completions request failed");
  const parsed = JSON.parse(extractChatText(payload)) as unknown;
  if (!isFraudAnalysis(parsed)) throw new Error("Invalid structured analysis");
  return parsed;
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

  const config = getAiConfig();
  if (!config) return jsonResponse({ error: errorText(locale, "key"), code: "not_configured" }, 503);

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
    const transcript = audio ? await transcribeAudio(audio, config, locale, controller.signal) : "";
    const combinedInput = [
      message ? `User question:\n${message}` : "",
      transcript ? `Audio transcript:\n${transcript}` : "",
    ].filter(Boolean).join("\n\n");
    const analysis = await analyzeContent(combinedInput, config, locale, controller.signal);
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
