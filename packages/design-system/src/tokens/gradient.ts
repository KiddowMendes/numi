import { color } from "./colors";

/**
 * A soft directional wash so the page is not a flat slab. Every stop sits close
 * to the base `background` in luminance, because the gradient is atmosphere —
 * it is never allowed to reduce text contrast. Cards stay white with a 3:1
 * border and read cleanly on top of it.
 */

export type GradientStop = { color: string; location: number };

export const backgroundGradient = {
  light: [
    { color: color.light.backgroundGlow, location: 0 },
    { color: color.light.background, location: 0.45 },
    { color: color.light.backgroundEdge, location: 1 },
  ],
  dark: [
    { color: color.dark.backgroundGlow, location: 0 },
    { color: color.dark.background, location: 0.45 },
    { color: color.dark.backgroundEdge, location: 1 },
  ],
} as const satisfies Record<"light" | "dark", readonly GradientStop[]>;

export function resolveBackgroundGradient(
  scheme: "light" | "dark",
): GradientStop[] {
  return backgroundGradient[scheme].map((stop) => ({ ...stop }));
}
