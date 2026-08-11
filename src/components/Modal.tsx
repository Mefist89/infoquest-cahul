"use client";

import { ReactNode, useRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
  wide = false,
  closeLabel = "Close",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  closeLabel?: string;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm" />
        <Dialog.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
          <Dialog.Popup
            initialFocus={closeButtonRef}
            className={`${wide ? "max-w-3xl" : "max-w-lg"} w-full rounded-3xl border border-neon/35 bg-popover p-6 shadow-[0_0_60px_rgba(0,214,255,0.14)]`}
          >
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="text-lg font-bold text-foreground">{title}</Dialog.Title>
              <Dialog.Close
                ref={closeButtonRef}
                className="focus-ring grid size-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-neon/60 hover:text-neon"
                aria-label={closeLabel}
              >
                <X className="size-5" aria-hidden="true" />
              </Dialog.Close>
            </div>
            <div className="mt-5">{children}</div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
