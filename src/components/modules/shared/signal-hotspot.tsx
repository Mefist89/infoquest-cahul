"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function SignalHotspot({
  zone,
  found,
  disabled,
  onToggle,
}: {
  zone: string;
  found: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      aria-pressed={found}
      aria-label={zone}
      className={`focus-ring absolute inset-0 min-h-11 min-w-11 rounded-xl transition ${
        found
          ? "bg-neon/20 ring-2 ring-neon shadow-[0_0_20px_rgba(0,217,255,0.45)]"
          : "hover:bg-neon/10 hover:ring-2 hover:ring-neon/40"
      }`}
    >
      {found && (
        <motion.span
          aria-hidden="true"
          initial={reducedMotion ? false : { scale: 0, rotate: -90 }}
          animate={{ scale: [0, 1.3, 1], rotate: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="absolute -right-2 -top-2 z-20 grid size-7 place-items-center rounded-full border-2 border-slate-950 bg-neon text-slate-950 shadow-[0_0_14px_rgba(0,217,255,0.75)]"
        >
          <Check className="size-4 stroke-[3]" />
        </motion.span>
      )}
    </button>
  );
}
