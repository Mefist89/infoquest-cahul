"use client";

import { useLargeText } from "@/features/accessibility/use-large-text";

export function TextSizeButton({ locale }: { locale: "ru" | "ro" }) {
  const [largeText, toggle] = useLargeText();
  const label = locale === "ru" ? "Крупный текст" : "Text mare";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={largeText}
      aria-label={label}
      title={label}
      className={`focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-full border text-sm font-black transition ${
        largeText
          ? "border-neon bg-neon text-primary-foreground shadow-[0_0_14px_rgba(0,217,255,0.35)]"
          : "border-border bg-card/70 text-neon hover:border-neon"
      }`}
    >
      A+
    </button>
  );
}
