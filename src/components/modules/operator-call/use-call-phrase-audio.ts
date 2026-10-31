"use client";

import { useEffect, useRef, useState } from "react";

/** A phrase's clock becomes ready after playback ends or cannot start. */
export function useCallPhraseAudio({ src, playbackKey, active, paused, enabled = true }: {
  src: string; playbackKey: string; active: boolean; paused: boolean; enabled?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [finishedKey, setFinishedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !enabled) return;
    let disposed = false;
    let audio: HTMLAudioElement;
    const finish = () => { if (!disposed) setFinishedKey(playbackKey); };
    try {
      audio = new Audio(src);
      audioRef.current = audio;
      audio.addEventListener("ended", finish);
      audio.addEventListener("error", finish);
    } catch {
      queueMicrotask(finish);
      return () => { disposed = true; };
    }
    return () => {
      disposed = true;
      audio.pause();
      audio.removeEventListener("ended", finish);
      audio.removeEventListener("error", finish);
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [active, enabled, playbackKey, src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!active || !enabled || !audio) return;
    if (paused) { audio.pause(); return; }
    if (audio.ended) return;
    try {
      void audio.play().catch(error => {
        if (audioRef.current !== audio || (error?.name === "AbortError" && audio.paused)) return;
        setFinishedKey(playbackKey);
      });
    } catch {
      queueMicrotask(() => { if (audioRef.current === audio) setFinishedKey(playbackKey); });
    }
  }, [active, enabled, paused, playbackKey, src]);

  return !enabled || finishedKey === playbackKey;
}
