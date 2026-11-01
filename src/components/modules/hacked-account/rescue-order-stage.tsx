"use client";

import type { hackedAccountContent } from "@/data/hacked-account";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { RetryOrderStage } from "../shared/retry-order-stage";

type Content = (typeof hackedAccountContent)["ru"]["rescueOrder"] | (typeof hackedAccountContent)["ro"]["rescueOrder"];

export function RescueOrderStage(props: { locale: "ru" | "ro"; content: Content; checkLabel: string; retryLabel: string; saving: boolean; onComplete: (result: StageResult) => void }) {
  return <RetryOrderStage {...props} />;
}
