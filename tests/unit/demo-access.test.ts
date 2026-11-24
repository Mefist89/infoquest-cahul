import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DEMO_ALLOWED_MODULE_IDS,
  DEMO_MAX_XP,
  DEMO_MODULE_COUNT,
  DEMO_STAGE_COUNT,
  MODULE_IDS,
  isDemoAllowedModule,
} from "@/data/module-catalog-meta";
import { MODULE_CATALOG } from "@/data/module-catalog";
import { pickNextModule } from "@/features/modules/server/next-module";

describe("ограничение демо-учеников двумя первыми модулями", () => {
  it("разрешает демо-ученикам только operator-call и fake-link (все 8 этапов в каждом)", () => {
    expect(DEMO_ALLOWED_MODULE_IDS).toEqual([MODULE_IDS.operatorCall, MODULE_IDS.fakeLink]);
    expect(DEMO_MODULE_COUNT).toBe(2);
    expect(DEMO_STAGE_COUNT).toBe(16);
    expect(DEMO_MAX_XP).toBe(200);

    expect(isDemoAllowedModule(MODULE_IDS.operatorCall)).toBe(true);
    expect(isDemoAllowedModule(MODULE_IDS.fakeLink)).toBe(true);
    expect(isDemoAllowedModule(MODULE_IDS.hackedAccount)).toBe(false);
    expect(isDemoAllowedModule(MODULE_IDS.scamOrReal)).toBe(false);
  });

  it("не предлагает демо-ученику 3-й и 4-й модули как следующий шаг", () => {
    const demoCatalog = MODULE_CATALOG.filter((entry) => isDemoAllowedModule(entry.moduleId));

    const nextAfterFirst = pickNextModule(
      demoCatalog,
      [{ module_id: MODULE_IDS.operatorCall, status: "completed" }],
      MODULE_IDS.operatorCall,
    );
    expect(nextAfterFirst?.moduleId).toBe(MODULE_IDS.fakeLink);

    const nextAfterBoth = pickNextModule(
      demoCatalog,
      [
        { module_id: MODULE_IDS.operatorCall, status: "completed" },
        { module_id: MODULE_IDS.fakeLink, status: "completed" },
      ],
      MODULE_IDS.fakeLink,
    );
    expect(nextAfterBoth).toBeNull();
  });

  it("блокирует серверные страницы 3-го и 4-го модулей и RPC для демо-учеников", () => {
    const hackedPage = readFileSync(join(process.cwd(), "src/app/[locale]/modules/hacked-account/page.tsx"), "utf8");
    const scamPage = readFileSync(join(process.cwd(), "src/app/[locale]/modules/scam-or-real/page.tsx"), "utf8");
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20261124130000_fix_register_demo_student_and_anonymous_guard.sql"),
      "utf8",
    );

    expect(hackedPage).toContain('from("demo_students")');
    expect(hackedPage).toContain("demoRestricted");
    expect(scamPage).toContain('from("demo_students")');
    expect(scamPage).toContain("demoRestricted");
    expect(migration).toContain("#variable_conflict use_column");
    expect(migration).toContain("p_module_id not in ('operator-call', 'fake-link')");
    expect(migration).toContain("Module is not available in demo mode");
    expect(migration).toContain("coalesce(u.is_anonymous, false)");
  });
});
