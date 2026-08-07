"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ locale, label }: { locale: "ru" | "ro"; label: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    setPending(true);
    await createClient().auth.signOut();
    router.replace(`/${locale}`);
    router.refresh();
  };

  return (
    <button type="button" onClick={signOut} disabled={pending} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card/70 px-3 text-sm font-semibold text-muted-foreground transition hover:border-danger/60 hover:text-foreground disabled:cursor-wait disabled:opacity-60">
      <LogOut className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
