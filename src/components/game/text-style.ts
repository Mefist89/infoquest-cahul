import type Phaser from "phaser";

export function getRubikFontFamily(): string {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const fromCssVar = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--font-rubik")
      .trim();
    if (fromCssVar) {
      return fromCssVar;
    }
  }
  return "Rubik, sans-serif";
}

export function gameText(
  size: number | string,
  extra?: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.Types.GameObjects.Text.TextStyle {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const numericSize = typeof size === "number" ? size : parseFloat(size) || 14;
  let fontStyle = extra?.fontStyle;
  if (fontStyle === "900") {
    fontStyle = numericSize < 16 ? "600" : "700";
  } else if (fontStyle === "bold" && numericSize < 15) {
    fontStyle = "600";
  }
  return {
    ...extra,
    ...(fontStyle ? { fontStyle } : {}),
    fontFamily: `${getRubikFontFamily()}, system-ui, -apple-system, Segoe UI, sans-serif`,
    fontSize: typeof size === "number" ? `${size}px` : size,
    resolution: Math.max(2, Math.min(dpr, 3)),
  };
}
