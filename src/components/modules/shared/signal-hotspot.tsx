"use client";

import { Check } from "lucide-react";

export function SignalHotspot({ zone, found, disabled, onToggle }: {
  zone: string; found: boolean; disabled: boolean; onToggle: () => void;
}) {
  return <button type="button" disabled={disabled} onClick={onToggle} aria-pressed={found} aria-label={zone}
    className={`focus-ring absolute inset-0 min-h-11 min-w-11 rounded-lg transition ${found ? "bg-neon/15 outline outline-2 outline-neon" : "hover:bg-neon/10"}`}>
    {found && <span aria-hidden="true" className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-neon text-primary-foreground">
      <Check className="size-4" />
    </span>}
  </button>;
}
