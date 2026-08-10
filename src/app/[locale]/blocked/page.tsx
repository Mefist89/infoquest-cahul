import type { Metadata } from "next";
import { Ban, ShieldAlert } from "lucide-react";
import { notFound } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { createClient } from "@/lib/supabase/server";

type BlockedLocale = "ru" | "ro";

const copy = {
  ru: {
    title: "Доступ заблокирован",
    description: "Доступ к InfoQuest ограничен администратором.",
    message: "Вы не можете использовать страницы, модули и AI-помощника InfoQuest. Если вы считаете, что блокировка установлена ошибочно, обратитесь к администратору проекта.",
    privacy: "Для защиты платформы проверяются аккаунт, адрес электронной почты и хеш сетевого адреса. Открытый IP-адрес не сохраняется.",
    signOut: "Выйти",
  },
  ro: {
    title: "Acces blocat",
    description: "Accesul la InfoQuest a fost restricționat de administrator.",
    message: "Nu poți utiliza paginile, modulele și asistentul AI InfoQuest. Dacă consideri că blocarea a fost aplicată din greșeală, contactează administratorul proiectului.",
    privacy: "Pentru protecția platformei sunt verificate contul, adresa de e-mail și hash-ul adresei de rețea. Adresa IP în clar nu este păstrată.",
    signOut: "Ieșire",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: BlockedLocale = locale === "ro" ? "ro" : "ru";
  return { title: `${copy[lang].title} — InfoQuest`, description: copy[lang].description };
}

export default async function BlockedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ru" && locale !== "ro") notFound();

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const t = copy[locale];

  return (
    <main className="circuit-bg grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-xl rounded-3xl border border-danger/50 bg-card/85 p-7 text-center shadow-[0_25px_90px_rgba(239,68,68,0.16)] backdrop-blur-xl sm:p-10">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl border border-danger/50 bg-danger/10 text-danger">
          <Ban className="size-10" aria-hidden="true" />
        </div>
        <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-danger/35 bg-danger/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-danger">
          <ShieldAlert className="size-4" aria-hidden="true" /> InfoQuest
        </p>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">{t.title}</h1>
        <p className="mt-4 leading-relaxed text-foreground">{t.message}</p>
        <p className="mt-5 rounded-2xl border border-border bg-background/40 p-4 text-sm leading-relaxed text-muted-foreground">{t.privacy}</p>
        {data.user && <div className="mt-7 flex justify-center"><SignOutButton locale={locale} label={t.signOut} /></div>}
      </section>
    </main>
  );
}
