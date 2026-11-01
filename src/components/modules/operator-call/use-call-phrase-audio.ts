"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSoundEnabled, subscribe } from "@/features/sound/sound-settings";

/** Automatic voice delays the clock; manual listening remains available while muted. */
export function useCallPhraseAudio({ src, playbackKey, active, paused, enabled }: {
  src: string; playbackKey: string; active: boolean; paused: boolean; enabled: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const finishRef = useRef<(() => void) | null>(null);
  const [finishedKey, setFinishedKey] = useState<string | null>(null);

  const prepareAudio = useCallback(() => {
    cleanupRef.current?.();
    let audio: HTMLAudioElement;
    const finish = () => {
      if (audioRef.current !== audio) return;
      setFinishedKey(playbackKey);
      cleanupRef.current?.();
    };
    try { audio = new Audio(src); } catch {
      queueMicrotask(() => setFinishedKey(playbackKey));
      return;
    }
    audio.volume = 0.4;
    audioRef.current = audio;
    finishRef.current = finish;
    audio.addEventListener("ended", finish);
    audio.addEventListener("error", finish);
    cleanupRef.current = () => {
      audio.pause();
      audio.removeEventListener("ended", finish);
      audio.removeEventListener("error", finish);
      if (audioRef.current === audio) {
        audioRef.current = null;
        finishRef.current = null;
        cleanupRef.current = null;
      }
    };
  }, [playbackKey, src]);

  const resumeAudio = useCallback(() => {
    const audio = audioRef.current;
    const finish = finishRef.current;
    if (!audio || audio.ended) return;
    try {
      void audio.play().catch(error => {
        if (audioRef.current !== audio || (error?.name === "AbortError" && audio.paused)) return;
        finish?.();
      });
    } catch { queueMicrotask(() => { if (audioRef.current === audio) finish?.(); }); }
  }, []);

  useEffect(() => {
    if (active && enabled) prepareAudio();
    return () => { cleanupRef.current?.(); };
  }, [active, enabled, prepareAudio]);

  useEffect(() => {
    if (!active) return;
    if (paused) audioRef.current?.pause();
    else resumeAudio();
  }, [active, enabled, paused, prepareAudio, resumeAudio]);

  useEffect(() => subscribe(() => {
    if (!getSoundEnabled()) cleanupRef.current?.();
  }), []);

  function playPhrase() {
    if (!active || paused) return;
    prepareAudio();
    resumeAudio();
  }

  return { audioFinished: !enabled || finishedKey === playbackKey, playPhrase };
}
