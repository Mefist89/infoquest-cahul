"use client";

import { useLargeText } from "@/features/accessibility/use-large-text";

export function TextSizeButton({ locale }: { locale: "ru" | "ro" }) {
  const [largeText, toggle] = useLargeText();
  const label = locale === "ru" ? "Крупный текст" : "Text mare";
  return <button type="button" onClick={toggle} aria-pressed={largeText} aria-label={label} title={label} className="focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card/70 text-sm font-black text-neon transition hover:border-neon">A+</button>;
}
