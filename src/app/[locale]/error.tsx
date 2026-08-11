"use client";

import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { RouteBoundaryCard } from "@/components/layout/RouteBoundaryCard";

const copy = {
  ru: {
    eyebrow: "Ошибка загрузки",
    title: "Не удалось открыть страницу",
    description: "Возможно, это временная ошибка. Попробуйте загрузить страницу ещё раз или вернитесь на главную.",
    retry: "Попробовать снова",
    home: "На главную",
  },
  ro: {
    eyebrow: "Eroare de încărcare",
    title: "Pagina nu a putut fi deschisă",
    description: "Este posibil să fie o eroare temporară. Încearcă din nou sau revino la pagina principală.",
    retry: "Încearcă din nou",
    home: "Pagina principală",
  },
} as const;

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/ro") ? "ro" : "ru";
  const text = copy[locale];

  return (
    <RouteBoundaryCard
      icon={<TriangleAlert className="size-10" aria-hidden="true" />}
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      actions={
        <>
          <button className="focus-ring inline-flex items-center gap-2 rounded-xl bg-neon px-5 py-3 font-black text-primary-foreground transition hover:brightness-110" type="button" onClick={retry}>
            <RefreshCw className="size-4" aria-hidden="true" /> {text.retry}
          </button>
          <Link className="focus-ring inline-flex items-center gap-2 rounded-xl border border-border bg-background/45 px-5 py-3 font-bold text-foreground transition hover:border-neon/60" href={`/${locale}`}>
            <Home className="size-4" aria-hidden="true" /> {text.home}
          </Link>
        </>
      }
    />
  );
}
