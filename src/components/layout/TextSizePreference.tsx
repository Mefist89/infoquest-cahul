"use client";

import { useEffect } from "react";
import { useLargeText } from "@/features/accessibility/use-large-text";

export function TextSizePreference() {
  const [largeText] = useLargeText();
  useEffect(() => {
    if (largeText) document.documentElement.style.setProperty("font-size", "125%");
    else document.documentElement.style.removeProperty("font-size");
  }, [largeText]);
  return null;
}
