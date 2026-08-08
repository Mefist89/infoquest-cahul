"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`${wide ? "max-w-3xl" : "max-w-lg"} w-full rounded-3xl border border-neon/35 bg-popover p-6 shadow-[0_0_60px_rgba(0,214,255,0.14)]`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-bold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid size-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-neon/60 hover:text-neon"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}
