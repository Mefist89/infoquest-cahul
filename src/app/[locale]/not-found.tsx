"use client";

import { Home, MapPinned } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { RouteBoundaryCard } from "@/components/layout/RouteBoundaryCard";

const copy = {
  ru: {
    eyebrow: "Ошибка 404",
    title: "Страница не найдена",
    description: "Такого адреса нет или страница была перемещена. Вернитесь на главную и выберите доступную миссию.",
    home: "На главную",
    missions: "К миссиям",
  },
  ro: {
    eyebrow: "Eroare 404",
    title: "Pagina nu a fost găsită",
    description: "Această adresă nu există sau pagina a fost mutată. Revino la pagina principală și alege o misiune disponibilă.",
    home: "Pagina principală",
    missions: "Vezi misiunile",
  },
} as const;

export default function NotFoundPage() {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/ro") ? "ro" : "ru";
  const text = copy[locale];

  return (
    <RouteBoundaryCard
      icon={<MapPinned className="size-10" aria-hidden="true" />}
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      actions={
        <>
          <Link className="focus-ring inline-flex items-center gap-2 rounded-xl bg-neon px-5 py-3 font-black text-primary-foreground transition hover:brightness-110" href={`/${locale}`}>
            <Home className="size-4" aria-hidden="true" /> {text.home}
          </Link>
          <Link className="focus-ring rounded-xl border border-border bg-background/45 px-5 py-3 font-bold text-foreground transition hover:border-neon/60" href={`/${locale}#missions`}>
            {text.missions}
          </Link>
        </>
      }
    />
  );
}
