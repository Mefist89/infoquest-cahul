import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MODULE_CATALOG,
  MODULE_COUNT,
  MODULE_MAX_XP,
  MODULE_STAGES,
  STAGE_COUNT,
  TOTAL_MAX_XP,
  TOTAL_STAGE_COUNT,
} from "@/data/module-catalog";
import { canUseAi, isAdministrator, isUserRole, USER_ROLES } from "@/lib/roles";
import { getRiskIndicatorClass, getRiskLevel } from "@/lib/risk-level";

describe("единый каталог модулей", () => {
  it("содержит восемь модулей и восемь этапов", () => {
    expect(MODULE_COUNT).toBe(8);
    expect(STAGE_COUNT).toBe(8);
    expect(TOTAL_STAGE_COUNT).toBe(64);
    expect(MODULE_CATALOG).toHaveLength(MODULE_COUNT);
    expect(MODULE_STAGES).toHaveLength(STAGE_COUNT);
  });

  it("имеет уникальные идентификаторы и ровно один доступный модуль", () => {
    expect(new Set(MODULE_CATALOG.map((module) => module.moduleId)).size).toBe(MODULE_COUNT);
    expect(MODULE_CATALOG.filter((module) => module.status === "playable").map((module) => module.moduleId)).toEqual(["operator-call"]);
    expect(MODULE_CATALOG[0].route).toBe("/modules/operator-call");
  });

  it("начисляет 100 XP за модуль и 800 XP за весь проект", () => {
    expect(MODULE_MAX_XP).toBe(100);
    expect(TOTAL_MAX_XP).toBe(800);
    expect(MODULE_STAGES.map((stage) => stage.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("Supabase configuration contract", () => {
  const supabaseDirectory = join(process.cwd(), "src/lib/supabase");
  const clientSources = ["client.ts", "server.ts", "proxy.ts"]
    .map((file) => readFileSync(join(supabaseDirectory, file), "utf8"))
    .join("\n");

  it("uses typed clients and has no embedded production fallback", () => {
    expect(clientSources).toContain("<Database>");
    expect(clientSources).not.toContain("qfmjjhitknwnbfblohvw.supabase.co");
    expect(clientSources).not.toContain("sb_publishable_");
  });

  it("keeps required public environment variables in one fail-fast validator", () => {
    const configSource = readFileSync(join(supabaseDirectory, "config.ts"), "utf8");
    expect(configSource).toContain("Missing required environment variable");
    expect(configSource).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(configSource).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });
});

describe("роли и доступ к Chrono", () => {
  it("распознаёт только поддерживаемые роли", () => {
    USER_ROLES.forEach((role) => expect(isUserRole(role)).toBe(true));
    expect(isUserRole("owner")).toBe(false);
    expect(isUserRole(null)).toBe(false);
  });

  it("разрешает AI ученику, учителю и администратору", () => {
    expect(canUseAi("user")).toBe(false);
    expect(canUseAi("student")).toBe(true);
    expect(canUseAi("teacher")).toBe(true);
    expect(canUseAi("administrator")).toBe(true);
    expect(canUseAi("blocked")).toBe(false);
    expect(isAdministrator("teacher")).toBe(false);
    expect(isAdministrator("administrator")).toBe(true);
    expect(isAdministrator("blocked")).toBe(false);
  });
});

describe("контракт клавиатурной доступности первого модуля", () => {
  const moduleDirectory = join(process.cwd(), "src/components/modules/operator-call");
  const source = [
    readFileSync(join(process.cwd(), "src/components/modules/OperatorCallModule.tsx"), "utf8"),
    ...readdirSync(moduleDirectory)
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => readFileSync(join(moduleDirectory, file), "utf8")),
  ].join("\n");

  it("не использует кликабельные div, span или p", () => {
    expect(source).not.toMatch(/<(?:div|span|p)\b[^>]*\bonClick=/u);
  });

  it("содержит состояния выбора, live-сообщения и паузу таймеров", () => {
    expect(source).toContain('aria-pressed={isSelected}');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("setPaused");
    expect(source).toContain("setBlitzPaused");
  });
});

describe("архитектурная граница первого модуля", () => {
  const coordinatorPath = join(process.cwd(), "src/components/modules/OperatorCallModule.tsx");
  const stageDirectory = join(process.cwd(), "src/components/modules/operator-call");

  it("оставляет координатор компактным и не создаёт новый монолит этапов", () => {
    expect(readFileSync(coordinatorPath, "utf8").split(/\r?\n/u).length).toBeLessThanOrEqual(300);
    for (const file of readdirSync(stageDirectory).filter((name) => name.endsWith(".tsx"))) {
      expect(readFileSync(join(stageDirectory, file), "utf8").split(/\r?\n/u).length, file).toBeLessThanOrEqual(400);
    }
  });

  it("делегирует прогресс общему ModuleRunner-контроллеру", () => {
    const coordinator = readFileSync(coordinatorPath, "utf8");
    const runner = readFileSync(join(process.cwd(), "src/features/modules/runner/use-module-runner.ts"), "utf8");
    expect(coordinator).toContain("useModuleRunner");
    expect(coordinator).not.toContain('rpc("complete_module_stage"');
    expect(runner).toContain('rpc("complete_module_stage"');
    expect(runner).toContain("unlockedThrough");
  });
});

describe("architecture boundaries", () => {
  it("keeps the TypeScript and Supabase module catalogs aligned", () => {
    const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260809161329_create_module_catalog.sql"), "utf8");
    MODULE_CATALOG.forEach((module) => expect(migration).toContain(`('${module.moduleId}', ${module.id},`));
    MODULE_STAGES.forEach((stage) => expect(migration).toContain(`(${stage.index}, '${stage.kind}',`));
  });

  it("keeps provider-specific endpoints outside the AI route", () => {
    const route = readFileSync(join(process.cwd(), "src/app/api/ai/route.ts"), "utf8");
    const provider = readFileSync(join(process.cwd(), "src/features/ai-help/server/openai-compatible-provider.ts"), "utf8");
    expect(route).toContain("createAiProvider");
    expect(route).not.toContain("/chat/completions");
    expect(route).not.toContain("/audio/transcriptions");
    expect(provider).toContain("interface AiProvider");
    expect(provider).toContain("/chat/completions");
    expect(provider).toContain("/audio/transcriptions");
  });

  it("records the modular-monolith decision and revisit triggers", () => {
    const adr = readFileSync(join(process.cwd(), "docs/architecture/adr-001-modular-monolith-boundaries.md"), "utf8");
    expect(adr).toContain("Модульный монолит");
    expect(adr).toContain("Когда пересмотреть");
  });
});

describe("route boundaries and placeholder routes", () => {
  const appDirectory = join(process.cwd(), "src/app/[locale]");
  const placeholderPages = [
    "intro/page.tsx",
    "map/page.tsx",
    "results/page.tsx",
    "modules/fake-link/page.tsx",
    "modules/hacked-account/page.tsx",
    "modules/scam-or-real/page.tsx",
    "modules/deepfake-detective/page.tsx",
  ];

  it("does not leave any planned route as an empty page", () => {
    for (const page of placeholderPages) {
      const source = readFileSync(join(appDirectory, page), "utf8");
      expect(source, page).not.toMatch(/return\s+null/u);
      expect(source, page).toContain("PlaceholderRoutePage");
    }
  });

  it("provides localized loading, error and not-found boundaries", () => {
    for (const boundary of ["loading.tsx", "error.tsx", "not-found.tsx"]) {
      const source = readFileSync(join(appDirectory, boundary), "utf8");
      expect(source, boundary).toContain('pathname?.startsWith("/ro")');
      expect(source, boundary).toContain("ru:");
      expect(source, boundary).toContain("ro:");
    }
  });
});

describe("media performance budget", () => {
  const videoFiles = [
    "public/video/2-video_ro.mp4",
    "public/video/2-video_ru.mp4",
    "public/video/3video.mp4",
    "public/promo.mp4",
    "public/promo_ro.mp4",
  ];

  it("keeps every video under 12 MiB and the current set under 25 MiB", () => {
    const sizes = videoFiles.map((file) => statSync(join(process.cwd(), file)).size);
    sizes.forEach((size) => expect(size).toBeLessThanOrEqual(12 * 1024 * 1024));
    expect(sizes.reduce((total, size) => total + size, 0)).toBeLessThanOrEqual(25 * 1024 * 1024);
  });
});

describe("UX and accessibility contracts", () => {
  it("uses one risk threshold function for frame and indicator", () => {
    expect(getRiskLevel(29)).toBe("low");
    expect(getRiskLevel(30)).toBe("medium");
    expect(getRiskLevel(70)).toBe("medium");
    expect(getRiskLevel(71)).toBe("high");
    expect(getRiskIndicatorClass(getRiskLevel(70))).toBe("bg-gold");
  });

  it("uses a modal primitive with managed focus", () => {
    const source = readFileSync(join(process.cwd(), "src/components/Modal.tsx"), "utf8");
    expect(source).toContain("Dialog.Root");
    expect(source).toContain("Dialog.Popup");
    expect(source).toContain("initialFocus={closeButtonRef}");
    expect(source).toContain("Dialog.Close");
  });

  it("removes the hidden scroll button from the tab order", () => {
    const source = readFileSync(join(process.cwd(), "src/components/ScrollToTop.tsx"), "utf8");
    expect(source).toContain("if (!isVisible) return null");
  });

  it("allows skipping typewriter animation and respects reduced motion", () => {
    const source = readFileSync(join(process.cwd(), "src/components/modules/operator-call/intro-media-stages.tsx"), "utf8");
    expect(source).toContain('prefers-reduced-motion: reduce');
    expect(source).toContain("showAllLabel");
  });

  it("announces AI thinking and names attachment removal", () => {
    const source = readFileSync(join(process.cwd(), "src/components/ai/AiHelpChat.tsx"), "utf8");
    expect(source).toContain("t.thinking");
    expect(source).toContain("t.removeAttachment");
    expect(source).toContain('role="status"');
  });

  it("keeps automatic carousel changes out of its live region", () => {
    const source = readFileSync(join(process.cwd(), "src/components/HomePage.tsx"), "utf8");
    expect(source).toContain("setAnnouncement");
    expect(source).not.toMatch(/key=\{slide\.id\}[^>]*aria-live/u);
  });

  it("keeps the central mission artwork fully visible at zero progress", () => {
    const source = readFileSync(join(process.cwd(), "src/components/HomePage.tsx"), "utf8");
    expect(source).toContain('className="mx-auto w-full opacity-100');
    expect(source).not.toContain("opacity: 0.58 + percent");
  });
});

describe("repository completeness and SEO", () => {
  it("does not keep the removed empty game-engine placeholders", () => {
    const removedPlaceholders = [
      "src/lib/game-store.ts",
      "src/lib/scoring.ts",
      "src/lib/storage.ts",
      "src/components/game/GameShell.tsx",
      "src/data/operator-call.json",
    ];

    removedPlaceholders.forEach((file) => expect(existsSync(join(process.cwd(), file)), file).toBe(false));
    expect(readFileSync(join(process.cwd(), "src/lib/types.ts"), "utf8").trim().length).toBeGreaterThan(0);
  });

  it("documents the current one-module MVP and operational setup", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const scope = readFileSync(join(process.cwd(), "docs/mvp-scope.md"), "utf8");
    expect(readme).toContain("Supabase и Google OAuth");
    expect(readme).toContain("AI Chrono");
    expect(readme).toContain("NEXT_PUBLIC_SITE_URL");
    expect(scope).toContain("один полностью доступный учебный модуль");
    expect(scope).toContain("operator-call");
  });

  it("defines an evidence-based GO/NO-GO gate for the public pilot", () => {
    const definitionOfDone = readFileSync(join(process.cwd(), "docs/public-pilot-definition-of-done.md"), "utf8");
    expect(definitionOfDone).toContain("G-01");
    expect(definitionOfDone).toContain("G-08");
    expect(definitionOfDone).toContain("Условия немедленной остановки");
    expect(definitionOfDone).toContain("GO / NO-GO");
  });

  it("keeps a complete application overview for product and technical handoff", () => {
    const overview = readFileSync(join(process.cwd(), "docs/application-overview.md"), "utf8");
    expect(overview).toContain("Общая информация");
    expect(overview).toContain("Первый модуль");
    expect(overview).toContain("AI-помощник Chrono");
    expect(overview).toContain("Данные Supabase");
    expect(overview).toContain("Архитектура");
    expect(overview).toContain("Что не входит в текущую версию");
  });

  it("keeps the admin dashboard connected to real data and management actions", () => {
    const dashboard = readFileSync(join(process.cwd(), "src/app/[locale]/admin/page.tsx"), "utf8");
    const sectionPage = readFileSync(join(process.cwd(), "src/app/[locale]/admin/[section]/page.tsx"), "utf8");
    expect(dashboard).toContain('supabase.rpc("get_admin_dashboard")');
    expect(dashboard).toContain('supabase.rpc("get_ai_budget_status")');
    expect(dashboard).toContain('href={`/${locale}/admin`}');
    expect(dashboard).toContain('href={`/${locale}/admin/learning`}');
    expect(dashboard).toContain('href={`/${locale}/admin/quests`}');
    expect(dashboard).toContain('href={`/${locale}/admin/users`}');
    expect(dashboard).toContain('href={`/${locale}/admin/security`}');
    expect(dashboard).toContain('section === "overview"');
    expect(sectionPage).toContain("isAdminSection(section)");
    expect(sectionPage).toContain("renderAdminDashboard(locale, section)");
    expect(dashboard).toContain("<ActivityChart");
    expect(dashboard).toContain("<RoleChart");
    expect(dashboard).toContain("<ModuleBar");
    expect(dashboard).toContain("action={updateUserRole}");
    expect(dashboard).toContain("action={toggleUserIpBlock}");
  });

  it("keeps the user dashboard connected to progress, missions and rewards", () => {
    const dashboard = readFileSync(join(process.cwd(), "src/app/[locale]/profile/page.tsx"), "utf8");
    const sectionPage = readFileSync(join(process.cwd(), "src/app/[locale]/profile/[section]/page.tsx"), "utf8");
    expect(dashboard).toContain('supabase.from("module_progress")');
    expect(dashboard).toContain('supabase.from("module_stage_progress")');
    expect(dashboard).toContain('href={`/${locale}/profile`}');
    expect(dashboard).toContain('href={`/${locale}/profile/missions`}');
    expect(dashboard).toContain('href={`/${locale}/profile/achievements`}');
    expect(dashboard).toContain('href={`/${locale}/profile/quests`}');
    expect(dashboard).toContain('section === "overview"');
    expect(dashboard).toContain('section === "quests"');
    expect(sectionPage).toContain("isProfileSection(section)");
    expect(sectionPage).toContain("renderProfileDashboard(locale, section)");
    expect(dashboard).toContain("MODULE_CATALOG.map");
    expect(dashboard).toContain("module.badge[locale]");
    expect(dashboard).toContain("<ProgressDonut");
  });

  it("keeps independent quests separate from modules and administrator-only", () => {
    const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260812190000_create_quests_catalog.sql"), "utf8");
    const dashboard = readFileSync(join(process.cwd(), "src/app/[locale]/admin/page.tsx"), "utf8");
    expect(migration).toContain("create table public.quests");
    expect(migration).toContain("config jsonb");
    expect(migration).toContain("quests_administrator_all");
    expect(migration).toContain("profiles.role = 'administrator'");
    expect(migration).not.toContain("references public.module_catalog");
    expect(dashboard).toContain('supabase.from("quests")');
    expect(dashboard).toContain('href={`/${locale}/admin/quests`}');
    expect(dashboard).toContain("<QuestCard");
  });

  it("publishes sitemap, robots, OpenGraph, canonical and language alternates", () => {
    const sitemap = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
    const robots = readFileSync(join(process.cwd(), "src/app/robots.ts"), "utf8");
    const ogImage = readFileSync(join(process.cwd(), "src/app/[locale]/opengraph-image.tsx"), "utf8");
    const homeMetadata = readFileSync(join(process.cwd(), "src/app/[locale]/page.tsx"), "utf8");
    expect(sitemap).toContain("alternates");
    expect(robots).toContain("/sitemap.xml");
    expect(ogImage).toContain("ImageResponse");
    expect(homeMetadata).toContain("localizedAlternates");
    expect(homeMetadata).toContain("openGraph");
  });

  it("keeps the redesigned bilingual home journey complete", () => {
    const home = readFileSync(join(process.cwd(), "src/components/HomePage.tsx"), "utf8");
    const learningSections = readFileSync(join(process.cwd(), "src/components/home/HomeLearningSections.tsx"), "utf8");
    const footer = readFileSync(join(process.cwd(), "src/components/SiteFooter.tsx"), "utf8");

    expect(home).toContain("<HowItWorks");
    expect(home).toContain("<MiniChallenge");
    expect(home).toContain("<SkillsSection");
    expect(home).toContain("<ProgressAndBadges");
    expect(home).toContain("<AudienceSection");
    expect(home).toContain("<AiAssistantSection");
    expect(home).toContain("<FaqSection");
    expect(home).toContain("missionFilter");
    expect(home).not.toContain('aria-label="XP"');
    expect(home).toContain("absolute left-1/2 hidden -translate-x-1/2");
    expect(home).toContain('className="home-content-width relative mx-auto mt-12"');
    expect(learningSections).toContain('role="status"');
    expect(learningSections).toContain("content[lang]");
    expect(footer).toContain('id="materials"');
  });
});
