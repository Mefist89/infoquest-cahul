import { NextResponse } from "next/server";

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

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_REQUESTS = 8;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

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

function errorText(locale: Locale, code: "key" | "input" | "audio" | "service" | "rate") {
  const messages = {
    ro: {
      key: "Serviciul AI nu este configurat încă. Adaugă AI_API_KEY în variabilele de mediu.",
      input: "Scrie o întrebare sau atașează un fișier audio.",
      audio: "Fișierul audio trebuie să aibă maximum 4 MB și un format acceptat.",
      service: "Chrono nu poate analiza mesajul acum. Încearcă din nou peste puțin timp.",
      rate: "Ai trimis prea multe solicitări. Încearcă din nou peste câteva minute.",
    },
    ru: {
      key: "AI-сервис пока не настроен. Добавьте AI_API_KEY в переменные окружения.",
      input: "Напишите вопрос или прикрепите аудиофайл.",
      audio: "Аудиофайл должен быть не больше 4 МБ и иметь поддерживаемый формат.",
      service: "Chrono сейчас не может выполнить анализ. Попробуйте ещё раз немного позже.",
      rate: "Отправлено слишком много запросов. Попробуйте снова через несколько минут.",
    },
  } as const;
  return messages[locale][code];
}

function isRateLimited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || request.headers.get("x-real-ip") || "local";
  const now = Date.now();
  const current = requestCounts.get(key);
  if (!current || current.resetAt <= now) {
    requestCounts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_REQUESTS;
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

async function transcribeAudio(file: File, config: AiConfig, locale: Locale) {
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
  });
  const payload = await response.json() as { text?: string; error?: { message?: string } };
  if (!response.ok || typeof payload.text !== "string") throw new Error(payload.error?.message || "Audio transcription failed");
  return payload.text.trim();
}

async function analyzeContent(input: string, config: AiConfig, locale: Locale) {
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
  });

  const payload = await response.json() as ChatCompletionResponse;
  if (!response.ok) throw new Error(payload.error?.message || "Chat Completions request failed");
  const parsed = JSON.parse(extractChatText(payload)) as unknown;
  if (!isFraudAnalysis(parsed)) throw new Error("Invalid structured analysis");
  return parsed;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const locale: Locale = form.get("locale") === "ro" ? "ro" : "ru";
  if (isRateLimited(request)) return NextResponse.json({ error: errorText(locale, "rate") }, { status: 429 });
  const config = getAiConfig();
  if (!config) return NextResponse.json({ error: errorText(locale, "key"), code: "not_configured" }, { status: 503 });

  const messageValue = form.get("message");
  const message = typeof messageValue === "string" ? messageValue.trim().slice(0, 4000) : "";
  const audioValue = form.get("audio");
  const audio = audioValue instanceof File && audioValue.size > 0 ? audioValue : null;

  if (!message && !audio) return NextResponse.json({ error: errorText(locale, "input") }, { status: 400 });
  if (audio && (audio.size > MAX_AUDIO_BYTES || !ALLOWED_AUDIO_TYPES.has(audio.type))) {
    return NextResponse.json({ error: errorText(locale, "audio") }, { status: 400 });
  }

  try {
    const transcript = audio ? await transcribeAudio(audio, config, locale) : "";
    const combinedInput = [
      message ? `User question:\n${message}` : "",
      transcript ? `Audio transcript:\n${transcript}` : "",
    ].filter(Boolean).join("\n\n");
    const analysis = await analyzeContent(combinedInput, config, locale);
    return NextResponse.json({ analysis, transcript });
  } catch (error) {
    console.error("Chrono AI analysis failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: errorText(locale, "service") }, { status: 502 });
  }
}
