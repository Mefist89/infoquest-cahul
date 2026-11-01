"use client";

import { Volume2, VolumeX } from "lucide-react";
import { setSoundEnabled } from "@/features/sound/sound-settings";
import { useSoundChoice, useSoundEnabled } from "@/features/sound/use-sound-enabled";

export function GameSoundToggle({ locale }: { locale: "ru" | "ro" }) {
  const enabled = useSoundEnabled();
  const Icon = enabled ? Volume2 : VolumeX;
  const label = locale === "ru"
    ? (enabled ? "Выключить звук" : "Включить звук")
    : (enabled ? "Oprește sunetul" : "Pornește sunetul");
  return (
    <button type="button" title={label} aria-label={label} aria-pressed={enabled} onClick={() => setSoundEnabled(!enabled)} className="focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/50 text-foreground">
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}

export function SoundChoiceBanner({ locale }: { locale: "ru" | "ro" }) {
  const chosen = useSoundChoice();
  if (chosen) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/70 p-4">
      <p className="mr-auto text-base text-foreground">{locale === "ru" ? "В этом модуле есть звуки и голос. Включить?" : "Acest modul are sunete și voce. Le pornim?"}</p>
      <button type="button" onClick={() => setSoundEnabled(true)} className="focus-ring min-h-11 rounded-xl bg-neon px-4 py-2 text-base font-bold text-primary-foreground">{locale === "ru" ? "Включить" : "Pornește"}</button>
      <button type="button" onClick={() => setSoundEnabled(false)} className="focus-ring min-h-11 rounded-xl border border-border px-4 py-2 text-base font-bold text-foreground">{locale === "ru" ? "Без звука" : "Fără sunet"}</button>
    </div>
  );
}
