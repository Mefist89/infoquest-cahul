import { LocaleSwitch } from "@/components/layout/LocaleSwitch";
import { TextSizeButton } from "@/components/layout/TextSizeButton";
import { ArrowLeft, Clock3, Home, ShieldCheck } from "lucide-react";
import Link from "next/link";

export type RouteStateLocale = "ru" | "ro";

type RouteStatePageProps = {
  locale: RouteStateLocale;
  routePath?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
};

const sharedCopy = {
  ru: { eyebrow: "InfoQuest · раздел готовится", home: "На главную", back: "Назад" },
  ro: { eyebrow: "InfoQuest · secțiune în pregătire", home: "Pagina principală", back: "Înapoi" },
} as const;

export function RouteStatePage({ locale, routePath = "", title, description, primaryHref, primaryLabel }: RouteStatePageProps) {
  const copy = sharedCopy[locale];

  return (
    <main className="circuit-bg grid min-h-screen overflow-x-clip place-items-center px-4 pb-24 pt-8 sm:py-10">
      <section className="relative z-10 w-full max-w-2xl rounded-3xl border border-neon/35 bg-card/90 p-6 text-center shadow-[0_24px_90px_rgba(0,217,255,0.14)] backdrop-blur-xl sm:p-10">
        <div className="mb-4 flex items-center justify-end gap-2">
          <TextSizeButton locale={locale} />
          <nav aria-label="Language" className="flex rounded-full border border-border bg-background/60 p-1">
            {(["ro", "ru"] as const).map((language) => (
              <LocaleSwitch
                key={language}
                locale={language}
                href={`/${language}${routePath}`}
                aria-current={language === locale ? "page" : undefined}
                className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-base font-bold uppercase transition ${
                  language === locale ? "bg-neon text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {language}
              </LocaleSwitch>
            ))}
          </nav>
        </div>
        <div className="mx-auto grid size-20 place-items-center rounded-3xl border border-neon/45 bg-neon/10 text-neon shadow-[0_0_35px_rgba(0,217,255,0.18)]">
          <Clock3 className="size-10" aria-hidden="true" />
        </div>
        <p className="mt-7 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-neon/30 bg-neon/10 px-3.5 py-1.5 text-center text-sm font-black uppercase tracking-wider text-neon">
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          <span>{copy.eyebrow}</span>
        </p>
        <h1 className="mt-5 break-words text-3xl font-black leading-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {primaryHref && primaryLabel && (
            <Link className="focus-ring rounded-xl bg-neon px-5 py-3 font-black text-primary-foreground transition hover:brightness-110" href={primaryHref}>
              {primaryLabel}
            </Link>
          )}
          <Link className="focus-ring inline-flex items-center gap-2 rounded-xl border border-border bg-background/45 px-5 py-3 font-bold text-foreground transition hover:border-neon/60" href={`/${locale}`}>
            <Home className="size-4" aria-hidden="true" /> {copy.home}
          </Link>
          <Link className="focus-ring inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-3 font-bold text-muted-foreground transition hover:text-foreground" href={`/${locale}#missions`}>
            <ArrowLeft className="size-4" aria-hidden="true" /> {copy.back}
          </Link>
        </div>
      </section>
    </main>
  );
}
