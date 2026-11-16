import type Phaser from "phaser";

/** Логический размер игрового поля: вся раскладка сцен считается в этих координатах. */
export const BASE_WIDTH = 960;
export const BASE_HEIGHT = 600;

let renderScale = 2;

/**
 * Во сколько раз реальный холст больше логического поля.
 * Холст 960×600 растягивается браузером на весь блок и в полноэкранный режим,
 * поэтому текст размывается. Рисуем в 2–3 раза крупнее и уменьшаем камерой.
 */
export function computeRenderScale(): number {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  return Math.min(3, Math.max(2, Math.ceil(dpr * 1.5)));
}

export function setRenderScale(value: number): void {
  renderScale = value;
}

export function getRenderScale(): number {
  return renderScale;
}

/** Логическая ширина и высота сцены (без учёта увеличения холста). */
export function viewSize(scene: Phaser.Scene): { width: number; height: number } {
  return {
    width: scene.scale.width / renderScale,
    height: scene.scale.height / renderScale,
  };
}

/** Камера оверлейной сцены: начало координат в левом верхнем углу, увеличение под холст. */
export function applyOverlayCamera(scene: Phaser.Scene): void {
  scene.cameras.main.setOrigin(0, 0).setZoom(renderScale).setScroll(0, 0);
}
