import "server-only";

export type AiLocale = "ro" | "ru";
export type FraudVerdict = "likely_scam" | "suspicious" | "unclear" | "likely_safe";

export type FraudAnalysis = {
  verdict: FraudVerdict;
  risk: number;
  summary: string;
  signals: string[];
  actions: string[];
  reply: string;
  disclaimer: string;
};

export type AiChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export interface AiProvider {
  transcribeAudio(file: File, locale: AiLocale, signal: AbortSignal): Promise<string>;
  analyzeContent(input: string, locale: AiLocale, signal: AbortSignal): Promise<FraudAnalysis>;
  chat(messages: AiChatMessage[], locale: AiLocale, signal: AbortSignal): Promise<string>;
}

type ProviderConfig = {
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

function getProviderConfig(): ProviderConfig | null {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const baseUrl = (process.env.AI_API_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/u, "");
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

class OpenAiCompatibleProvider implements AiProvider {
  constructor(private readonly config: ProviderConfig) {}

  async transcribeAudio(file: File, locale: AiLocale, signal: AbortSignal) {
    const body = new FormData();
    const isWeba = file.name.toLowerCase().endsWith(".weba") || file.type === "audio/weba";
    const uploadFile = isWeba
      ? new File([file], file.name.replace(/\.weba$/iu, ".webm"), { type: "audio/webm" })
      : file;
    body.append("file", uploadFile, uploadFile.name || "recording.webm");
    body.append("model", this.config.transcriptionModel);
    body.append("language", locale);
    body.append("prompt", "InfoQuest, Chrono, operator, cod SMS, parolă, card bancar, мошенничество, оператор, SMS-код, пароль, банковская карта");

    const response = await fetch(`${this.config.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.config.apiKey}` },
      body,
      signal,
    });
    const payload = await response.json() as { text?: string; error?: { message?: string } };
    if (!response.ok || typeof payload.text !== "string") throw new Error(payload.error?.message || "Audio transcription failed");
    return payload.text.trim();
  }

  async analyzeContent(input: string, locale: AiLocale, signal: AbortSignal) {
    const language = locale === "ro" ? "Romanian" : "Russian";
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.analysisModel,
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
          json_schema: { name: "fraud_analysis", strict: true, schema: fraudAnalysisSchema },
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

  async chat(messages: AiChatMessage[], locale: AiLocale, signal: AbortSignal) {
    const language = locale === "ro" ? "Romanian" : "Russian";
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.analysisModel,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `You are Chrono, the friendly InfoQuest digital-safety tutor for students, teachers, and families. Continue the conversation using the supplied recent context and reply in ${language}. Give clear, age-appropriate, practical guidance about scams, privacy, accounts, misinformation, cyberbullying, and safe online behavior. Be concise and calm. Do not request passwords, SMS codes, banking details, identity documents, or other sensitive data. If a user appears to be in immediate danger or has lost money, advise them to contact a trusted adult, their bank, or local authorities through official channels. Do not present guesses as facts.`,
          },
          ...messages,
        ],
      }),
      signal,
    });

    const payload = await response.json() as ChatCompletionResponse;
    if (!response.ok) throw new Error(payload.error?.message || "Chat Completions request failed");
    return extractChatText(payload).trim();
  }
}

export function createAiProvider(): AiProvider | null {
  const config = getProviderConfig();
  return config ? new OpenAiCompatibleProvider(config) : null;
}
