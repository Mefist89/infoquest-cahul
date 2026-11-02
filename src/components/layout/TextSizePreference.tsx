"use client";

import { useEffect } from "react";
import { getLargeTextEnabled, subscribeLargeText } from "@/features/accessibility/large-text-settings";

export function TextSizePreference() {
  useEffect(() => {
    const apply = () => {
      if (getLargeTextEnabled()) document.documentElement.setAttribute("data-font-scale", "large");
      else document.documentElement.removeAttribute("data-font-scale");
    };
    apply();
    return subscribeLargeText(apply);
  }, []);
  return null;
}
