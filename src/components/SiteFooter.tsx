"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, PlayCircle, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { homeData, type HomeLocale } from "@/data/home-data";
import { Modal } from "@/components/Modal";

function BottomCard({ label, icon, children, onClick }: { label: string; icon?: ReactNode; children?: ReactNode; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-border bg-card/40 p-8 transition-all hover:bg-card/80 ${onClick ? "focus-ring hover:border-neon/40 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,217,255,0.15)]" : ""}`}
    >
      <div className="absolute -top-12 right-4 size-24 rounded-full bg-white/5 blur-2xl transition group-hover:bg-neon/10" aria-hidden="true" />
      {icon}
      {children}
      <span className="font-semibold text-foreground/90">{label}</span>
    </Comp>
  );
}

const teamMembers = {
  ru: ["Дмитрий (Разработка/UX)", "Евгения (Дизайн/Контент)", "Виктор (Аналитика/Тестирование)", "Александр (Менеджмент/QA)", "Мария (Копирайтинг/Маркетинг)"],
  ro: ["Dumitru (Dezvoltare/UX)", "Eugenia (Design/Conținut)", "Victor (Analiză/Testare)", "Alexandru (Management/QA)", "Maria (Copywriting/Marketing)"],
};

export function SiteFooter({ lang }: { lang: string }) {
  const t = homeData[lang as HomeLocale];
  const [openBlock, setOpenBlock] = useState<"logo" | "qr" | "team" | "demo" | null>(null);
  const siteUrl = "https://infoquest-cahul.vercel.app";

  const downloadQr = () => {
    const svg = document.getElementById("infoquest-qr-large");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "infoquest-qr.svg";
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <>
      <footer className="relative border-t border-neon/15 bg-slate-950/35">
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-7 text-center">
            <h2 className="text-lg font-bold text-neon">{t.projectMaterials}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.projectMaterialsHint}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <BottomCard label={t.teamLogo} onClick={() => setOpenBlock("logo")}>
              <Image
                src="/patrol-shield.png"
                alt={t.teamLogo}
                width={80}
                height={80}
                className="size-20 rounded-xl object-cover ring-2 ring-neon/70"
              />
            </BottomCard>
            <BottomCard label={t.qrCode} onClick={() => setOpenBlock("qr")}>
              <span className="grid size-[88px] place-items-center rounded-lg bg-white p-2">
                <QRCodeSVG value={siteUrl} size={72} bgColor="#ffffff" fgColor="#071328" />
              </span>
            </BottomCard>
            <BottomCard label={t.projectTeam} icon={<Users className="size-12 text-neon" aria-hidden="true" />} onClick={() => setOpenBlock("team")} />
            <BottomCard label={t.demo} icon={<PlayCircle className="size-12 text-gold" aria-hidden="true" />} onClick={() => setOpenBlock("demo")} />
          </div>

          <div className="mt-16 border-t border-neon/10 pt-8 text-center text-xs text-muted-foreground">
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
        </section>
      </footer>

      {openBlock && (
        <Modal
          title={openBlock === "logo" ? t.teamLogo : openBlock === "qr" ? t.qrCode : openBlock === "team" ? t.projectTeam : t.demo}
          onClose={() => setOpenBlock(null)}
          wide={openBlock === "demo"}
        >
          {openBlock === "logo" && (
            <div className="overflow-hidden rounded-2xl border border-neon/35 bg-slate-950">
              <Image
                src="/patrol-shield.png"
                alt={t.teamLogo}
                width={1024}
                height={1024}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          )}

          {openBlock === "qr" && (
            <div className="flex flex-col items-center gap-4">
              <span className="grid size-[272px] place-items-center rounded-2xl bg-white p-4">
                <QRCodeSVG id="infoquest-qr-large" value={siteUrl} size={240} bgColor="#ffffff" fgColor="#071328" />
              </span>
              <p className="text-sm text-muted-foreground">{t.qrHint}</p>
              <button type="button" onClick={downloadQr} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon px-5 text-sm font-semibold text-primary-foreground">
                <Download className="size-4" aria-hidden="true" /> SVG
              </button>
            </div>
          )}

          {openBlock === "team" && (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">{t.teamHint}</p>
              <ul className="space-y-2">
                {teamMembers[lang as keyof typeof teamMembers].map((member) => (
                  <li key={member} className="rounded-xl border border-border bg-card/70 px-4 py-3 text-sm text-foreground">{member}</li>
                ))}
              </ul>
            </div>
          )}

          {openBlock === "demo" && (
            <div className="overflow-hidden rounded-2xl border border-gold/40 bg-slate-950">
              <video
                key={lang}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-black object-contain"
                aria-label={t.demo}
              >
                <source src={lang === "ro" ? "/promo_ro.mp4" : "/promo.mp4"} type="video/mp4" />
                {t.demoHint}
              </video>
              <p className="px-4 py-3 text-center text-sm text-muted-foreground">{t.demoHint}</p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
