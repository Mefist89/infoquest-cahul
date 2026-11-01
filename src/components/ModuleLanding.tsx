import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";
import { SiteFooter } from "@/components/SiteFooter";
import { guestModuleLabels, moduleSeo, type SeoLocale, type SeoModule } from "@/data/seo";
import { jsonLd, moduleStructuredData } from "@/lib/seo";

export function ModuleStructuredData({ module, locale }: { module: SeoModule; locale: SeoLocale }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(moduleStructuredData(module, locale)) }} />;
}

export function ModuleLanding({ module, locale, rules }: { module: SeoModule; locale: SeoLocale; rules: readonly string[] }) {
  const content = moduleSeo[module][locale];
  const labels = guestModuleLabels[locale];
  const path = `/modules/${module}`;
  return <>
    <main className="circuit-bg min-h-screen px-4 py-6 sm:py-10">
      <ModuleStructuredData module={module} locale={locale} />
      <div className="relative mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/${locale}`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-base font-semibold text-neon"><ArrowLeft className="size-5" aria-hidden="true" />{labels.back}</Link>
          <nav aria-label="Language" className="flex rounded-full border border-border bg-card/70 p-1">
            {(["ro", "ru"] as const).map(language => <LocaleSwitch key={language} locale={language} href={`/${language}${path}`} aria-current={language === locale ? "page" : undefined} className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-base font-bold uppercase ${language === locale ? "bg-neon text-primary-foreground" : "text-muted-foreground"}`}>{language}</LocaleSwitch>)}
          </nav>
        </header>
        <article className="mt-8 min-w-0 rounded-3xl border border-neon/30 bg-card/80 p-6 sm:p-10">
          <ShieldCheck className="size-12 text-neon" aria-hidden="true" />
          <h1 className="mt-5 break-words text-3xl font-black leading-tight sm:text-4xl">{content.title}</h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{content.description}</p>
          <h2 className="mt-8 text-xl font-bold text-neon">{labels.rules}</h2>
          <ul className="mt-4 grid gap-3">{rules.map(rule => <li key={rule} className="rounded-2xl border border-border bg-background/50 p-4 text-base leading-relaxed">{rule}</li>)}</ul>
          <Link href={`/${locale}/login?next=${encodeURIComponent(`/${locale}${path}`)}`} className="focus-ring mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-neon px-6 py-3 text-lg font-black text-primary-foreground sm:w-auto">{labels.start}<ArrowRight className="size-5" aria-hidden="true" /></Link>
        </article>
      </div>
    </main>
    <SiteFooter lang={locale} />
  </>;
}
