"use client";

import { LoaderCircle } from "lucide-react";
import { usePathname } from "next/navigation";

import { RouteBoundaryCard } from "@/components/layout/RouteBoundaryCard";

const copy = {
  ru: { eyebrow: "InfoQuest", title: "Загружаем данные", description: "Подождите немного — страница уже готовится." },
  ro: { eyebrow: "InfoQuest", title: "Încărcăm datele", description: "Așteaptă puțin — pagina este în curs de pregătire." },
} as const;

export default function Loading() {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/ro") ? "ro" : "ru";
  const text = copy[locale];

  return (
    <div role="status" aria-live="polite">
      <RouteBoundaryCard
        busy
        icon={<LoaderCircle className="size-10 animate-spin" aria-hidden="true" />}
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
      />
    </div>
  );
}
