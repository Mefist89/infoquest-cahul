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
  return {
    ...extra,
    fontFamily: getRubikFontFamily(),
    fontSize: typeof size === "number" ? `${size}px` : size,
    resolution: Math.min(dpr, 2),
  };
}
