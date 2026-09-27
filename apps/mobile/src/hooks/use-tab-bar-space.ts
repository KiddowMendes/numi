import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing } from "@/constants/tokens";

/**
 * `@react-navigation/bottom-tabs` sizes its bar as
 * `TABBAR_HEIGHT_UIKIT + insets.bottom` and applies the bottom inset as
 * padding. This module is the one place that knows the coupling, so the number
 * lives here rather than being re-guessed per screen.
 *
 * The previous approach was a hand-picked `Platform.select` claiming the bar
 * was 58pt on iOS. The navigator never used that number, so the dock button
 * sat a different height on each platform and every screen over-padded its
 * scroll view by the inset the bar had already accounted for.
 *
 * Numi's tab items need more room than upstream's 49 gives them: the item adds
 * 4pt of vertical padding, the label adds 2pt above it, and together with the
 * pressable's own 5pt inset, a 24pt icon and a 14pt label that is 58pt of
 * content. Upstream's 49 cannot hold it, and the old code responded by
 * overwriting the bar's bottom padding, which is what ate the home indicator.
 * The bar therefore sets an explicit height and hands the inset back.
 */
const TAB_BAR_CONTENT_HEIGHT = 60;

/**
 * How far a centre-docked button deliberately sits inside the tab bar. It has
 * a background-coloured halo that notches the bar, so a small overlap is the
 * intent rather than an error.
 */
const DOCK_OVERLAP = 12;

/** Breathing room between the bar and the last row of scrollable content. */
const CONTENT_CLEARANCE = spacing.xl;

/** Matches `SIZE` in `CenterDockButton`, which owns the button's own box. */
const DOCK_BUTTON_SIZE = 66;

export type TabBarSpace = {
  /** Explicit `height` for the tab bar, bottom inset included. */
  tabBarHeight: number;
  /** `bottom` for a centre-docked button, clearing the tab bar. */
  dockOffset: number;
  /** Scroll padding for a screen with no docked button over the bar. */
  contentBottom: number;
  /** Scroll padding for a screen whose docked button rises above the bar. */
  dockContentBottom: number;
};

export function useTabBarSpace(): TabBarSpace {
  const insets = useSafeAreaInsets();

  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + insets.bottom;
  const dockOffset = tabBarHeight - DOCK_OVERLAP;

  return {
    tabBarHeight,
    dockOffset,
    contentBottom: tabBarHeight + CONTENT_CLEARANCE,
    dockContentBottom: dockOffset + DOCK_BUTTON_SIZE + CONTENT_CLEARANCE,
  };
}
