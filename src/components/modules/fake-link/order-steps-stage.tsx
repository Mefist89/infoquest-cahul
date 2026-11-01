"use client";

import type { fakeLinkContent } from "@/data/fake-link";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { RetryOrderStage } from "../shared/retry-order-stage";

type Content = (typeof fakeLinkContent)["ru"]["orderSteps"] | (typeof fakeLinkContent)["ro"]["orderSteps"];

export function OrderStepsStage(props: { locale: "ru" | "ro"; content: Content; checkLabel: string; retryLabel: string; saving: boolean; onComplete: (result: StageResult) => void }) {
  return <RetryOrderStage {...props} />;
}
