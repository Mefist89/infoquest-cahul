import { AlertTriangle, Bot } from "lucide-react";

import { ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/roles";
import { copy, roleColors } from "./copy";
import type { AdminLocale, AdminUser, AiBudgetStatus } from "./types";

export function buildMonthlyActivity(users: AdminUser[], locale: AdminLocale) {
  const formatter = new Intl.DateTimeFormat(locale === "ro" ? "ro-MD" : "ru-MD", { month: "short" });
  const now = new Date();
  return Array.from({ length: 6 }, (_, offset) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - offset), 1));
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const value = users.filter((user) => { const created = new Date(user.created_at); return created.getUTCFullYear() === year && created.getUTCMonth() === month; }).length;
    return { label: formatter.format(date).replace(".", ""), value };
  });
}

export function ActivityChart({ items }: { items: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return <div className="flex h-52 items-end gap-2 sm:gap-4" role="img" aria-label={items.map((item) => `${item.label}: ${item.value}`).join(", ")}>{items.map((item) => <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-foreground">{item.value}</span><div className="w-full rounded-t-xl bg-gradient-to-t from-neon/45 to-neon shadow-[0_0_18px_rgba(0,217,255,0.12)]" style={{ height: `${Math.max(8, (item.value / max) * 145)}px` }} /><span className="max-w-full truncate text-[10px] uppercase text-muted-foreground sm:text-xs">{item.label}</span></div>)}</div>;
}

export function RoleChart({ counts, total, locale }: { counts: Record<UserRole, number>; total: number; locale: AdminLocale }) {
  return <div className="grid gap-3">{USER_ROLES.map((role) => { const percent = total > 0 ? Math.round((counts[role] / total) * 100) : 0; return <div key={role}><div className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2"><span className={`size-2.5 rounded-full ${roleColors[role]}`} />{ROLE_LABELS[role][locale]}</span><strong>{counts[role]} · {percent}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${roleColors[role]}`} style={{ width: `${percent}%` }} /></div></div>; })}</div>;
}

export function ModuleBar({ label, completed, maximum, percent, available, statusLabel }: { label: string; completed: number; maximum: number; percent: number; available: boolean; statusLabel: string }) {
  return <div><div className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2"><span className={`size-2.5 shrink-0 rounded-full ${available ? "bg-neon" : "bg-muted-foreground/50"}`} /><span className="truncate font-semibold">{label}</span><span className={`rounded-full px-2 py-0.5 text-[9px] uppercase ${available ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>{statusLabel}</span></span><strong>{completed}/{maximum}</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${available ? "bg-neon" : "bg-muted-foreground/40"}`} style={{ width: `${percent}%` }} /></div></div>;
}

export function AiBudgetPanel({ budget, locale }: { budget: AiBudgetStatus; locale: AdminLocale }) {
  const t = copy[locale];
  const dailyPercent = Math.min(100, Math.round((budget.daily_used / budget.daily_limit) * 100));
  const monthlyPercent = Math.min(100, Math.round((budget.monthly_used / budget.monthly_limit) * 100));
  const warning = dailyPercent >= budget.warning_percent || monthlyPercent >= budget.warning_percent;
  return <section className={`mt-5 rounded-2xl border p-5 sm:p-6 ${warning ? "border-gold/50 bg-gold/8" : "border-border/70 bg-card/55"}`}><div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-xl ${warning ? "bg-gold/10 text-gold" : "bg-success/10 text-success"}`}><Bot className="size-5" aria-hidden="true" /></span><div><h2 className="font-black">{t.aiBudget}</h2><p role="status" className={`mt-1 flex items-center gap-1.5 text-xs ${warning ? "text-gold" : "text-muted-foreground"}`}>{warning && <AlertTriangle className="size-3.5" aria-hidden="true" />}{warning ? t.budgetWarning : t.budgetOk}</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><BudgetBar label={t.today} used={budget.daily_used} limit={budget.daily_limit} percent={dailyPercent} warning={warning && dailyPercent >= budget.warning_percent} /><BudgetBar label={t.month} used={budget.monthly_used} limit={budget.monthly_limit} percent={monthlyPercent} warning={warning && monthlyPercent >= budget.warning_percent} /></div></section>;
}

function BudgetBar({ label, used, limit, percent, warning }: { label: string; used: number; limit: number; percent: number; warning: boolean }) {
  return <div><div className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{label}</span><strong className={warning ? "text-gold" : "text-foreground"}>{used}/{limit} · {percent}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit} aria-label={label}><div className={`h-full rounded-full transition-[width] duration-500 ${warning ? "bg-gold" : "bg-success"}`} style={{ width: `${percent}%` }} /></div></div>;
}
