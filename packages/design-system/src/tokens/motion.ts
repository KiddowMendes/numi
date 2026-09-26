/**
 * Motion is calm and informative. No springs, no overshoot, no bounce — this is
 * a tool for someone checking their balance in a queue, not a toy.
 */

export const duration = {
  instant: 90,
  fast: 180,
  base: 260,
  slow: 420,
  gauge: 640,
} as const;

export const easing = {
  standard: "ease-in-out",
  entrance: "ease-out",
  exit: "ease-in",
  linear: "linear",
} as const satisfies Record<string, string>;

export const motion = {
  /** Press feedback. Opacity only, never a scale bounce. */
  pressOpacity: 0.72,
  /** The one sanctioned scale, for dock buttons only. */
  pressScale: 0.96,
  /** Range for the press scale, so callers cannot overshoot into playfulness. */
  pressScaleMin: 0.94,
  pressScaleMax: 0.98,
  sheetEnter: duration.base,
  sheetExit: duration.fast,
  sheetTopRadius: 26,
  overlayFade: duration.fast,
  numberTick: duration.base,
  gaugeSweep: duration.gauge,
  stagger: 60,
} as const;

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;

/** The single easing every non-overlay transition uses. */
export const motionEasing: string = easing.standard;
