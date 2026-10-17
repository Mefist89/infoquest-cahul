import { Compass } from "lucide-react";

import type { QuestRow } from "@/lib/types";
import type { Copy } from "./copy";
import type { AdminLocale } from "./types";

export function QuestCard({ quest, locale, t }: { quest: QuestRow; locale: AdminLocale; t: Copy }) {
  const title = locale === "ro" ? quest.title_ro : quest.title_ru;
  const summary = locale === "ro" ? quest.summary_ro : quest.summary_ru;
  const statusLabels: Record<string, { ru: string; ro: string }> = {
    planning: { ru: "Идея", ro: "Idee" },
    draft: { ru: "Черновик", ro: "Draft" },
    review: { ru: "Проверка", ro: "Verificare" },
    published: { ru: "Опубликован", ro: "Publicat" },
    archived: { ru: "Архив", ro: "Arhivă" },
  };
  const status = statusLabels[quest.status]?.[locale] ?? quest.status;

  return <article className="rounded-2xl border border-border/70 bg-card/55 p-5"><div className="flex items-start justify-between gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet/10 text-violet"><Compass className="size-5" aria-hidden="true" /></span><span className="rounded-full border border-violet/35 bg-violet/10 px-2.5 py-1 text-[10px] font-bold uppercase text-violet">{status}</span></div><h3 className="mt-4 text-lg font-black">{title}</h3>{summary && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{summary}</p>}<dl className="mt-5 grid gap-3 border-t border-border/60 pt-4 text-xs sm:grid-cols-3"><div><dt className="text-muted-foreground">{t.questType}</dt><dd className="mt-1 font-bold">{quest.game_type}</dd></div><div><dt className="text-muted-foreground">{t.questStatus}</dt><dd className="mt-1 font-bold">{status}</dd></div><div><dt className="text-muted-foreground">{t.questRoute}</dt><dd className="mt-1 truncate font-bold">{quest.route ?? "—"}</dd></div></dl></article>;
}
