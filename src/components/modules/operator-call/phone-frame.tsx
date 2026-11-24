"use client";

import { BatteryFull, Signal, Wifi } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function PhoneFrame({
  children,
  shakeKey = 0,
  tone = "neutral",
  maxWidthClass = "max-w-md",
}: {
  children: ReactNode;
  shakeKey?: number;
  tone?: "neutral" | "success" | "danger";
  maxWidthClass?: string;
}) {
  const reducedMotion = useReducedMotion();
  const bezelTone =
    tone === "success"
      ? "border-success/75 shadow-[0_24px_70px_rgba(0,0,0,0.6),0_0_38px_rgba(34,197,94,0.28)]"
      : tone === "danger"
        ? "border-danger/75 shadow-[0_24px_70px_rgba(0,0,0,0.6),0_0_38px_rgba(244,63,94,0.3)]"
        : "border-slate-600/80 shadow-[0_24px_70px_rgba(0,0,0,0.6),0_0_34px_rgba(0,217,255,0.16)]";

  return (
    <motion.div
      key={shakeKey > 0 ? `shake-${shakeKey}` : "steady"}
      animate={
        !reducedMotion && shakeKey > 0
          ? { x: [0, -12, 12, -9, 9, -4, 4, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className={`mx-auto w-full ${maxWidthClass} rounded-[2.6rem] border-[5px] bg-slate-950 p-2.5 transition-colors duration-300 sm:p-3 ${bezelTone}`}
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-800/90 bg-[linear-gradient(180deg,#08152e_0%,#050d20_100%)]">
        <div
          aria-hidden="true"
          className="relative flex items-center justify-between border-b border-white/5 bg-slate-950/75 px-5 py-2.5 text-sm font-bold text-slate-300"
        >
          <span className="tabular-nums">12:45</span>
          <span className="h-5 w-24 rounded-full bg-black/90 ring-1 ring-white/10" />
          <span className="flex items-center gap-1.5 text-slate-300">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4 text-success" />
          </span>
        </div>

        <div className="relative">{children}</div>

        <div aria-hidden="true" className="flex justify-center bg-slate-950/70 py-2.5">
          <span className="h-1.5 w-28 rounded-full bg-slate-600/70" />
        </div>
      </div>
    </motion.div>
  );
}
