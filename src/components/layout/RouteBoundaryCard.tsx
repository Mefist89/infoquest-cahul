import type { ReactNode } from "react";

export function RouteBoundaryCard({ icon, eyebrow, title, description, actions, busy = false }: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  busy?: boolean;
}) {
  return (
    <main className="circuit-bg grid min-h-screen place-items-center px-4 py-10" aria-busy={busy || undefined}>
      <section className="relative z-10 w-full max-w-xl rounded-3xl border border-neon/35 bg-card/90 p-7 text-center shadow-[0_24px_90px_rgba(0,217,255,0.14)] backdrop-blur-xl sm:p-10">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl border border-neon/45 bg-neon/10 text-neon">{icon}</div>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-neon">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-black text-foreground sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-muted-foreground">{description}</p>
        {actions && <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
      </section>
    </main>
  );
}
