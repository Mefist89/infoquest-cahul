import type { LucideIcon } from "lucide-react";

export function DashboardNavLink({ href, icon: Icon, label, active = false }: { href: string; icon: LucideIcon; label: string; active?: boolean }) {
  return <a href={href} className={`focus-ring flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${active ? "border border-neon/30 bg-neon/12 text-neon" : "border border-transparent text-muted-foreground hover:bg-card hover:text-foreground"}`}><Icon className="size-4" aria-hidden="true" />{label}</a>;
}

export function StatCard({ icon: Icon, label, value, color, detail }: { icon: LucideIcon; label: string; value: string; color: string; detail: string }) {
  return <article className="group rounded-2xl border border-border/70 bg-card/55 p-5 transition hover:-translate-y-0.5 hover:border-neon/30 hover:bg-card/75"><div className="flex items-start justify-between gap-3"><span className={`grid size-11 place-items-center rounded-xl bg-background/55 ${color}`}><Icon className="size-5" aria-hidden="true" /></span><span className="rounded-full border border-border bg-background/35 px-2.5 py-1 text-[10px] text-muted-foreground">{detail}</span></div><p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-display text-3xl font-black">{value}</p></article>;
}

export function DashboardPanel({ title, hint, icon: Icon, children }: { title: string; hint: string; icon: LucideIcon; children: React.ReactNode }) {
  return <article className="rounded-2xl border border-border/70 bg-card/55 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon"><Icon className="size-5" aria-hidden="true" /></span><div><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div></div><div className="mt-6">{children}</div></article>;
}

export function SectionHeading({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl border border-neon/25 bg-neon/10 text-neon"><Icon className="size-5" aria-hidden="true" /></span><div><h2 className="text-2xl font-black">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></div>;
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border/70 bg-background/35 p-3 text-center"><p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-display font-black text-neon">{value}</p></div>;
}
