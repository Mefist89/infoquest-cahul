import type { ReactNode } from "react";
import Link from "next/link";
import { footerStrings, type FooterLocale } from "@/data/footer-data";

export function SiteFooter({ lang, beforeLegal }: { lang: FooterLocale; beforeLegal?: ReactNode }) {
  const t = footerStrings[lang];

  return (
    <footer className="relative border-t border-neon/15 bg-slate-950/35">
      <div className="mx-auto max-w-6xl px-4 py-14">
        {beforeLegal}

        <div className="mt-16 border-t border-neon/10 pt-8 text-center text-sm text-muted-foreground">
          <p className="mx-auto mb-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{lang === "ru" ? "Двуязычная образовательная игра для школьников, учителей, семей и всего сообщества. Учись распознавать мошенничество, дезинформацию, дипфейки и цифровые угрозы." : "Joc educațional bilingv pentru elevi, profesori, familii și întreaga comunitate. Învață să recunoști fraudele, dezinformarea, deepfake-urile și amenințările digitale."}</p>
          <div className="mb-4 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
            <span className="font-semibold text-foreground/80">{t.footerHackathon}</span>
            <span className="hidden text-neon/30 sm:inline">•</span>
            <span className="font-semibold text-neon/80">{t.footerAi}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <span>{t.footerCopyright}</span>
            <div className="flex gap-4">
              <Link href={`/${lang}/privacy`} className="transition hover:text-neon">{t.footerPrivacy}</Link>
              <Link href={`/${lang}/terms`} className="transition hover:text-neon">{t.footerTerms}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
