"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleUserRound, Lock, LogIn, Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { strings, type Lang } from "@/data/home-data";
import { useLargeText } from "@/features/accessibility/use-large-text";
import { canUseAi, type UserRole } from "@/lib/roles";

type HeaderProgress = {
  loading: boolean;
  isAuthenticated: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole | null;
};

export function HomeHeader({ lang, setLang, progress }: { lang: Lang; setLang: (lang: Lang) => void; progress: HeaderProgress }) {
  const [open, setOpen] = useState(false);
  const [largeText, toggleLargeText] = useLargeText();
  const panelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const panelId = useId();
  const t = strings[lang];
  const menuLabel = lang === "ru" ? "Меню" : "Meniu";
  const largeTextLabel = lang === "ru" ? "Крупный текст" : "Text mărit";
  const navigationLabel = lang === "ru" ? "Главная навигация" : "Navigare principală";
  const chronoRestricted = progress.isAuthenticated && !canUseAi(progress.role);
  const chronoHref = progress.isAuthenticated ? `/${lang}/ai-help` : `/${lang}/login?next=${encodeURIComponent(`/${lang}/ai-help`)}`;
  const links = [
    ["#how", lang === "ru" ? "Как играть" : "Cum se joacă"],
    ["#missions", lang === "ru" ? "Дела" : "Dosare"],
    ["#badges", lang === "ru" ? "Бейджи" : "Insigne"],
    ["#materials", lang === "ru" ? "Материалы" : "Materiale"],
    ["#about", lang === "ru" ? "О проекте" : "Despre proiect"],
  ];

  useEffect(() => {
    if (!largeText) return;
    const style = document.documentElement.style;
    const previous = style.getPropertyValue("font-size");
    const priority = style.getPropertyPriority("font-size");
    style.setProperty("font-size", "125%");
    return () => {
      if (previous) style.setProperty("font-size", previous, priority);
      else style.removeProperty("font-size");
    };
  }, [largeText]);

  useEffect(() => {
    if (!open) {
      const button = menuButtonRef.current;
      const restoreFocus = wasOpen.current && button?.getClientRects().length;
      wasOpen.current = false;
      if (restoreFocus) {
        const frame = requestAnimationFrame(() => button.focus({ preventScroll: true }));
        return () => cancelAnimationFrame(frame);
      }
      return;
    }
    wasOpen.current = true;
    if (panelRef.current) panelRef.current.scrollTop = 0;
    panelRef.current?.querySelector<HTMLAnchorElement>('a[href]')?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target) && !menuButtonRef.current?.contains(event.target)) setOpen(false);
    };
    const wideScreen = window.matchMedia("(min-width: 1280px)");
    const onResize = () => { if (wideScreen.matches) setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    wideScreen.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      wideScreen.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-4 sm:px-4">
        <a href="#top" onClick={() => setOpen(false)} className="focus-ring flex shrink-0 items-center gap-2 rounded-lg" aria-label="InfoQuest">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-neon/50 bg-card glow-neon"><ShieldCheck className="size-5 text-neon" aria-hidden="true" /></span>
          <span className="hidden leading-tight min-[430px]:block">
            <span className="block whitespace-nowrap font-display text-[10px] font-bold tracking-wider sm:text-base"><span className="text-white">INFO</span><span className="text-[#00D9FF]">QUEST</span></span>
            <span className="hidden text-xs text-neon lg:block">{t.tagline}</span>
          </span>
        </a>

        <nav data-testid="home-desktop-nav" className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground xl:flex" aria-label={navigationLabel}>
          {links.map(([href, label]) => <a key={href} className="focus-ring whitespace-nowrap rounded-lg transition hover:text-neon" href={href}>{label}</a>)}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {progress.loading ? (
            <span className="size-10 shrink-0 animate-pulse rounded-full border border-border bg-card/70" aria-label={lang === "ru" ? "Загрузка профиля" : "Se încarcă profilul"} />
          ) : progress.isAuthenticated ? (
            <>
              <Link data-testid="home-account" href={`/${lang}/profile`} aria-label={lang === "ru" ? "Профиль" : "Profil"} className="focus-ring inline-flex min-h-10 min-w-10 shrink-0 items-center gap-2 rounded-full border border-neon/35 bg-neon/10 p-1 pr-2 text-neon transition hover:border-neon hover:bg-neon/20 sm:pr-3">
                <span className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-background/70">{progress.avatarUrl ? <Image src={progress.avatarUrl} alt="" fill sizes="32px" className="object-cover" /> : <CircleUserRound className="size-5" aria-hidden="true" />}</span>
                {progress.displayName && <span className="hidden max-w-36 truncate text-sm font-semibold text-foreground 2xl:inline">{progress.displayName}</span>}
              </Link>
              <div className="hidden md:block"><SignOutButton locale={lang} label={lang === "ru" ? "Выйти" : "Ieșire"} /></div>
            </>
          ) : (
            <Link href={`/${lang}/login`} aria-label={lang === "ru" ? "Войти" : "Autentificare"} className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-neon/35 bg-neon/10 px-3 text-xs font-bold text-neon transition hover:border-neon hover:bg-neon/20 sm:px-4 sm:text-sm"><LogIn className="size-4" aria-hidden="true" /><span className="hidden md:inline">{lang === "ru" ? "Войти" : "Autentificare"}</span></Link>
          )}

          <button type="button" onClick={toggleLargeText} aria-pressed={largeText} aria-label={largeTextLabel} title={largeTextLabel} className="focus-ring hidden size-11 shrink-0 place-items-center rounded-full border border-border bg-card/70 text-sm font-black text-neon transition hover:border-neon xl:grid">A+</button>

          <div className="flex rounded-full border border-border bg-card/70 p-1" role="group" aria-label="Language">
            {(["ro", "ru"] as const).map(item => <button key={item} type="button" onClick={() => { setOpen(false); setLang(item); }} aria-pressed={lang === item} className={`focus-ring min-h-9 rounded-full px-2 text-xs font-bold uppercase transition sm:px-3 sm:text-sm ${lang === item ? "bg-neon text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{item}</button>)}
          </div>

          <button ref={menuButtonRef} type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls={panelId} aria-label={menuLabel} className="focus-ring inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-2.5 font-bold text-neon xl:hidden">{open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}<span className="hidden text-sm sm:inline">{menuLabel}</span></button>
        </div>
      </div>

      <div ref={panelRef} id={panelId} data-testid="home-menu-panel" hidden={!open} onClickCapture={event => { if (event.target instanceof Element && event.target.closest("a,button")) setOpen(false); }} className="max-h-[65dvh] overflow-y-auto border-t border-border/70 px-4 py-4 xl:hidden">
        <nav className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2" aria-label={navigationLabel}>
          {links.map(([href, label]) => <a key={href} href={href} className="focus-ring flex min-h-12 items-center rounded-xl border border-border bg-card/70 px-4 py-2 text-base font-semibold transition hover:border-neon/50 hover:text-neon">{label}</a>)}
        </nav>
        <div className="mx-auto mt-3 grid max-w-7xl gap-2 border-t border-border/70 pt-3 sm:grid-cols-2">
          {chronoRestricted ? <div><span aria-disabled="true" className="flex min-h-12 items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-base font-semibold text-muted-foreground"><Lock className="size-5" aria-hidden="true" />Chrono</span><p className="mt-1 text-base text-muted-foreground">{t.aiRestricted}</p></div> : <Link href={chronoHref} className="focus-ring flex min-h-12 items-center rounded-xl border border-success/40 bg-success/10 px-4 py-2 text-base font-semibold text-success">Chrono</Link>}
          <button type="button" onClick={toggleLargeText} aria-pressed={largeText} className="focus-ring flex min-h-12 items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-2 text-left text-base font-semibold text-neon"><span aria-hidden="true" className="font-black">A+</span>{largeTextLabel}</button>
          <div className="flex min-h-12 gap-2" role="group" aria-label={lang === "ru" ? "Язык меню" : "Limba meniului"}>
            {(["ro", "ru"] as const).map(item => <button key={item} type="button" aria-pressed={lang === item} onClick={() => setLang(item)} className={`focus-ring min-h-12 flex-1 rounded-xl border px-4 py-2 text-base font-bold uppercase ${lang === item ? "border-neon bg-neon text-primary-foreground" : "border-border bg-card/70 text-muted-foreground"}`}>{item}</button>)}
          </div>
          {progress.isAuthenticated ? <><Link href={`/${lang}/profile`} className="focus-ring flex min-h-12 items-center rounded-xl border border-border bg-card/70 px-4 py-2 text-base font-semibold">{lang === "ru" ? "Профиль" : "Profil"}</Link><div className="[&_button]:min-h-12 [&_button]:w-full [&_button]:text-base [&_span]:inline"><SignOutButton locale={lang} label={lang === "ru" ? "Выйти" : "Ieșire"} /></div></> : <Link href={`/${lang}/login`} className="focus-ring flex min-h-12 items-center rounded-xl border border-border bg-card/70 px-4 py-2 text-base font-semibold">{lang === "ru" ? "Войти" : "Autentificare"}</Link>}
        </div>
      </div>
    </header>
  );
}
