import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectId = "qfmjjhitknwnbfblohvw";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const target = resolve("src/lib/supabase/database.types.ts");

const generated = execFileSync(
  npx,
  ["supabase", "gen", "types", "typescript", "--project-id", projectId, "--schema", "public"],
  { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
);

if (!generated.includes("export type Database")) {
  throw new Error("Supabase CLI returned an invalid TypeScript schema");
}

writeFileSync(target, generated, "utf8");
