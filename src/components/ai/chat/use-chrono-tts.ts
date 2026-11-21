"use client";

import { useCallback, useEffect, useRef } from "react";

import type { AiLocale } from "./types";

function fallbackBrowserSpeak(text: string, locale: AiLocale) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale === "ro" ? "ro-RO" : "ru-RU";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export function useChronoTts(locale: AiLocale) {
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
  }, []);

  useEffect(() => stop, [stop]);

  const speak = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      stop();

      const controller = new AbortController();
      abortRef.current = controller;

      void (async () => {
        try {
          const response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: clean, locale }),
            signal: controller.signal,
          });
          if (!response.ok) {
            if (!controller.signal.aborted) fallbackBrowserSpeak(clean, locale);
            return;
          }
          const blob = await response.blob();
          if (controller.signal.aborted) return;

          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          const audio = new Audio(url);
          audioRef.current = audio;

          const cleanup = () => {
            if (objectUrlRef.current === url) {
              URL.revokeObjectURL(url);
              objectUrlRef.current = null;
            }
            if (audioRef.current === audio) {
              audioRef.current = null;
            }
          };

          audio.addEventListener("ended", cleanup, { once: true });
          audio.addEventListener("error", () => {
            cleanup();
            if (!controller.signal.aborted) fallbackBrowserSpeak(clean, locale);
          }, { once: true });

          await audio.play();
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
          if (!controller.signal.aborted) fallbackBrowserSpeak(clean, locale);
        }
      })();
    },
    [locale, stop],
  );

  return { speak, stop };
}
