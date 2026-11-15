"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { MODULE_CATALOG } from "@/data/module-catalog";
import { PATROL_NPCS, PATROL_SCENE_META, type PatrolLocale } from "@/data/patrol";
import { PatrolLoadingFrame, PatrolStartPanel } from "./PatrolStartPanel";

const PatrolGame = dynamic(() => import("./PatrolGame").then((module) => module.PatrolGame), {
  ssr: false,
  loading: () => <PatrolLoadingFrame />,
});

type DeviceMode = "unknown" | "desktop" | "unsupported";

export function isUnsupportedPatrolDevice(win: Window): boolean {
  const coarseOnly =
    Boolean(win.matchMedia?.("(pointer: coarse)").matches) &&
    !Boolean(win.matchMedia?.("(any-pointer: fine)").matches);
  return coarseOnly || win.innerWidth < 900;
}

export function getUniquePatrolModules() {
  const uniqueRoutes = Array.from(new Set(PATROL_NPCS.map((npc) => npc.moduleRoute)));
  return uniqueRoutes
    .map((route) => MODULE_CATALOG.find((mod) => mod.route === route))
    .filter((mod): mod is NonNullable<typeof mod> => Boolean(mod));
}

function usePatrolDeviceMode(): DeviceMode {
  const [mode, setMode] = useState<DeviceMode>("unknown");

  useEffect(() => {
    const coarseMql = window.matchMedia?.("(pointer: coarse)");
    const fineMql = window.matchMedia?.("(any-pointer: fine)");
    const update = () => {
      setMode(isUnsupportedPatrolDevice(window) ? "unsupported" : "desktop");
    };
    update();
    window.addEventListener("resize", update);
    coarseMql?.addEventListener?.("change", update);
    fineMql?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("resize", update);
      coarseMql?.removeEventListener?.("change", update);
      fineMql?.removeEventListener?.("change", update);
    };
  }, []);

  return mode;
}

export function PatrolControlsHint({ locale }: { locale: PatrolLocale }) {
  const mode = usePatrolDeviceMode();
  if (mode !== "desktop") return null;

  return (
    <p className="mt-2 text-sm text-muted-foreground sm:text-base">
      {PATROL_SCENE_META[locale].pageControlsHint}
    </p>
  );
}

export function PatrolGameLoader({
  locale,
  isAuthenticated = false,
}: {
  locale: PatrolLocale;
  isAuthenticated?: boolean;
}) {
  const [started, setStarted] = useState(false);
  const deviceMode = usePatrolDeviceMode();
  const meta = PATROL_SCENE_META[locale];

  if (deviceMode === "unknown") {
    return <PatrolLoadingFrame label={meta.loadingLabel} />;
  }

  if (deviceMode === "unsupported") {
    const modules = getUniquePatrolModules();
    return (
      <div className="rounded-3xl border border-neon/35 bg-[#060d1f] p-5 sm:p-7">
        <p className="text-base font-bold leading-relaxed text-foreground sm:text-lg">
          {meta.desktopOnlyNotice}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {modules.map((mod) => (
            <Link
              key={mod.moduleId}
              href={`/${locale}${mod.route}`}
              className="focus-ring flex min-h-12 items-center justify-center rounded-2xl border border-neon/45 bg-neon/10 px-4 py-3 text-center text-sm font-black text-neon transition hover:bg-neon/20"
            >
              {mod.title[locale]}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div>
        {!isAuthenticated && (
          <div className="mb-3 rounded-2xl border border-neon/35 bg-neon/10 px-4 py-3 text-sm">
            <Link
              href={`/${locale}/login?next=/${locale}/patrol`}
              className="focus-ring font-bold text-neon underline-offset-4 hover:underline"
            >
              {meta.guestLoginPrompt}
            </Link>
          </div>
        )}
        <PatrolStartPanel locale={locale} onStart={() => setStarted(true)} />
      </div>
    );
  }

  return <PatrolGame locale={locale} isAuthenticated={isAuthenticated} />;
}
