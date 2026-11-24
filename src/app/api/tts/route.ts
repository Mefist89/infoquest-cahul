import { NextResponse } from "next/server";

import { canUseAi, isUserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type TtsLocale = "ru" | "ro";

const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const DEFAULT_MODEL_ID = "eleven_flash_v2_5";
const MAX_TTS_CHARS = 1000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 20;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkUserRateLimit(userId: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(userId);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_MAX_REQUESTS) {
    return false;
  }
  bucket.count += 1;
  return true;
}

function jsonError(code: string, status: number) {
  return NextResponse.json({ error: code, code }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return jsonError("tts_not_configured", 503);
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("authentication_required", 401);
  }

  const [{ data: profile, error: profileError }, { data: demoStudent }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle(),
    supabase.from("demo_students").select("id").eq("user_id", authData.user.id).maybeSingle(),
  ]);

  if (demoStudent?.id || authData.user.is_anonymous) {
    return jsonError("demo_restricted", 403);
  }
  if (profileError || !canUseAi(isUserRole(profile?.role) ? profile.role : null)) {
    return jsonError("role_required", 403);
  }

  if (!checkUserRateLimit(authData.user.id)) {
    return jsonError("rate_limited", 429);
  }

  let body: Record<string, unknown>;
  try {
    const parsed = (await request.json()) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return jsonError("invalid_input", 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonError("invalid_input", 400);
  }

  const rawText = typeof body.text === "string" ? body.text.replace(/\s+/g, " ").trim() : "";
  if (!rawText) {
    return jsonError("invalid_input", 400);
  }
  const text = rawText.slice(0, MAX_TTS_CHARS);
  const locale: TtsLocale = body.locale === "ro" ? "ro" : "ru";

  const voiceId = (process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID).replace(/[^a-zA-Z0-9_-]/g, "");
  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL_ID;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          language_code: locale,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      console.error("ElevenLabs TTS HTTP error", response.status);
      return jsonError("tts_provider_error", 502);
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("ElevenLabs TTS request failed", error instanceof Error ? error.name : "unknown");
    return jsonError("tts_provider_error", 502);
  } finally {
    clearTimeout(timeout);
  }
}
