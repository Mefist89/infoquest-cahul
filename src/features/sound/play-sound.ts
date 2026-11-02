import { getSoundEnabled, subscribe } from "./sound-settings";

let stopCurrentEffect: (() => void) | undefined;

export function playSound(type: "correct" | "wrong" | "timeout") {
  if (!getSoundEnabled()) return;
  stopCurrentEffect?.();
  let audio: HTMLAudioElement;
  try { audio = new Audio(`/audio/${type}.mp3`); } catch { return; }
  const cleanup = () => {
    audio.pause();
    audio.removeEventListener("ended", cleanup);
    audio.removeEventListener("error", cleanup);
    unsubscribe();
    if (stopCurrentEffect === cleanup) stopCurrentEffect = undefined;
  };
  stopCurrentEffect = cleanup;
  audio.volume = type === "timeout" ? 0.2 : 0.4;
  audio.addEventListener("ended", cleanup);
  audio.addEventListener("error", cleanup);
  const unsubscribe = subscribe(() => { if (!getSoundEnabled()) cleanup(); });
  if (!getSoundEnabled()) { cleanup(); return; }
  try { void audio.play().catch(cleanup); } catch { cleanup(); }
}

