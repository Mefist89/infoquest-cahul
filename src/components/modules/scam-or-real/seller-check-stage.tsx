"use client";

import type { scamOrRealContent } from "@/data/scam-or-real";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { RetryOrderStage } from "../shared/retry-order-stage";

type Content = (typeof scamOrRealContent)["ru"]["sellerCheck"] | (typeof scamOrRealContent)["ro"]["sellerCheck"];

export function SellerCheckStage(props: { locale: "ru" | "ro"; content: Content; checkLabel: string; retryLabel: string; saving: boolean; onComplete: (result: StageResult) => void }) {
  return <RetryOrderStage {...props} />;
}
