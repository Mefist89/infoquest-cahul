import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { legalContent, type LegalKind, type LegalLocale } from "@/data/legal-content";

export function LegalDocumentPage({ locale, kind }: { locale: LegalLocale; kind: LegalKind }) {
  const document = legalContent[locale][kind];
  const alternateLocale: LegalLocale = locale === "ru" ? "ro" : "ru";

  return (
    <div className="circuit-bg min-h-screen">
      <header className="sticky top-0 z-30 border-b border-neon/15 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href={`/${locale}`} className="focus-ring flex min-w-0 items-center gap-2 rounded-lg">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-neon/50 bg-card glow-neon">
              <ShieldCheck className="size-5 text-neon" aria-hidden="true" />
            </span>
            <span className="font-display text-xs font-bold tracking-wider text-foreground sm:text-sm">
              INFOQUEST CAHUL
            </span>
          </Link>

          <nav className="ml-auto flex rounded-full border border-border bg-card/70 p-1" aria-label="Language">
            {(["ro", "ru"] as const).map((item) => (
              <Link
                key={item}
                href={`/${item}/${kind}`}
                aria-current={locale === item ? "page" : undefined}
                className={`focus-ring min-h-9 rounded-full px-3 py-2 text-xs font-bold uppercase transition ${
                  locale === item
                    ? "bg-neon text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <Link
          href={`/${locale}`}
          className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-neon transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {document.backHome}
        </Link>

        <article className="mt-7 overflow-hidden rounded-3xl border border-neon/25 bg-card/70 shadow-[0_0_70px_rgba(0,214,255,0.08)] backdrop-blur">
          <header className="border-b border-neon/15 bg-slate-950/25 px-5 py-8 sm:px-10 sm:py-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neon">{document.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-black text-foreground sm:text-5xl">{document.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">{document.summary}</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-gold">{document.updated}</p>
          </header>

          <div className="space-y-9 px-5 py-8 sm:px-10 sm:py-10">
            {document.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-neon sm:text-xl">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-7 text-foreground/85 sm:text-base">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-3 pl-1">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-7 text-foreground/85 sm:text-base">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold shadow-[0_0_10px_var(--gold)]" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section className="rounded-2xl border border-neon/20 bg-background/35 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-neon">{document.linksTitle}</h2>
              <ul className="mt-4 space-y-3">
                {document.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href} className="focus-ring inline-flex items-center gap-2 rounded text-sm font-semibold text-foreground transition hover:text-neon">
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="focus-ring inline-flex items-center gap-2 rounded text-sm font-semibold text-foreground transition hover:text-neon"
                      >
                        {link.label}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <p className="rounded-2xl border border-dashed border-gold/35 bg-gold/5 p-5 text-sm leading-relaxed text-muted-foreground">
              {document.notice}
            </p>
          </div>
        </article>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© 2026 InfoQuest Cahul</span>
          <Link href={`/${alternateLocale}/${kind}`} className="focus-ring rounded font-semibold text-neon hover:text-foreground">
            {alternateLocale.toUpperCase()}
          </Link>
        </div>
      </main>
    </div>
  );
}
