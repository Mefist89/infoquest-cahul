import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENAI_URL = "https://api.openai.com/v1";
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

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
  error?: { message?: string };
};

function errorText(locale: Locale, code: "key" | "input" | "audio" | "service" | "rate") {
  const messages = {
    ro: {
      key: "Serviciul AI nu este configurat încă. Adaugă OPENAI_API_KEY în variabilele de mediu.",
      input: "Scrie o întrebare sau atașează un fișier audio.",
      audio: "Fișierul audio trebuie să aibă maximum 4 MB și un format acceptat.",
      service: "Chrono nu poate analiza mesajul acum. Încearcă din nou peste puțin timp.",
      rate: "Ai trimis prea multe solicitări. Încearcă din nou peste câteva minute.",
    },
    ru: {
      key: "AI-сервис пока не настроен. Добавьте OPENAI_API_KEY в переменные окружения.",
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

function extractOutputText(payload: OpenAIResponse) {
  if (typeof payload.output_text === "string") return payload.output_text;
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
      if (content.type === "refusal" && typeof content.refusal === "string") throw new Error(content.refusal);
    }
  }
  throw new Error("OpenAI response did not contain output text");
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

async function transcribeAudio(file: File, apiKey: string, locale: Locale) {
  const body = new FormData();
  body.append("file", file, file.name || "recording.webm");
  body.append("model", "gpt-4o-mini-transcribe");
  body.append("language", locale);
  body.append("prompt", "InfoQuest, Chrono, operator, cod SMS, parolă, card bancar, мошенничество, оператор, SMS-код, пароль, банковская карта");

  const response = await fetch(`${OPENAI_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });
  const payload = await response.json() as { text?: string; error?: { message?: string } };
  if (!response.ok || typeof payload.text !== "string") throw new Error(payload.error?.message || "Audio transcription failed");
  return payload.text.trim();
}

async function analyzeContent(input: string, apiKey: string, locale: Locale) {
  const language = locale === "ro" ? "Romanian" : "Russian";
  const response = await fetch(`${OPENAI_URL}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_ANALYSIS_MODEL || "gpt-5.6-luna",
      store: false,
      reasoning: { effort: "low" },
      max_output_tokens: 700,
      input: [
        {
          role: "system",
          content: `You are Chrono, the InfoQuest digital-safety mentor for students, teachers, families, and community members. Analyze only the evidence contained in the user's text or audio transcript. Reply in ${language}. Never claim certainty, identify a real person, authenticate a voice, or say that an audio recording alone proves fraud. Explain concrete social-engineering signals such as urgency, secrecy, threats, requests for SMS codes, passwords, remote access, payments, crypto, or suspicious links. If evidence is insufficient, choose unclear. Keep the reply calm, educational, and concise. Never ask the user to publish passwords, banking data, SMS codes, or identity documents. Recommend verification through official channels.`,
        },
        { role: "user", content: input },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "fraud_analysis",
          strict: true,
          schema: {
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
          },
        },
      },
    }),
  });

  const payload = await response.json() as OpenAIResponse;
  if (!response.ok) throw new Error(payload.error?.message || "Responses API request failed");
  const parsed = JSON.parse(extractOutputText(payload)) as unknown;
  if (!isFraudAnalysis(parsed)) throw new Error("Invalid structured analysis");
  return parsed;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const locale: Locale = form.get("locale") === "ro" ? "ro" : "ru";
  if (isRateLimited(request)) return NextResponse.json({ error: errorText(locale, "rate") }, { status: 429 });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: errorText(locale, "key"), code: "not_configured" }, { status: 503 });

  const messageValue = form.get("message");
  const message = typeof messageValue === "string" ? messageValue.trim().slice(0, 4000) : "";
  const audioValue = form.get("audio");
  const audio = audioValue instanceof File && audioValue.size > 0 ? audioValue : null;

  if (!message && !audio) return NextResponse.json({ error: errorText(locale, "input") }, { status: 400 });
  if (audio && (audio.size > MAX_AUDIO_BYTES || !ALLOWED_AUDIO_TYPES.has(audio.type))) {
    return NextResponse.json({ error: errorText(locale, "audio") }, { status: 400 });
  }

  try {
    const transcript = audio ? await transcribeAudio(audio, apiKey, locale) : "";
    const combinedInput = [
      message ? `User question:\n${message}` : "",
      transcript ? `Audio transcript:\n${transcript}` : "",
    ].filter(Boolean).join("\n\n");
    const analysis = await analyzeContent(combinedInput, apiKey, locale);
    return NextResponse.json({ analysis, transcript });
  } catch (error) {
    console.error("Chrono AI analysis failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: errorText(locale, "service") }, { status: 502 });
  }
}
