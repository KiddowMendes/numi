import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast, {
  type ToastConfig,
  type ToastOptions,
} from "react-native-toast-message";

import { AppIcon, type IconName } from "@/components/app-icon";
import {
  duration,
  radius,
  spacing,
  typography,
  type ColorPalette,
  type StateToken,
} from "@/constants/tokens";

export type ToastKind = "success" | "neutral" | "warning";

type ToastEntry = {
  label: string;
  detail?: string;
  icon: IconName;
  tone: StateToken | "primary";
};

const ENTRIES: Record<ToastKind, ToastEntry> = {
  success: { label: "", icon: "check", tone: "stateSafe" },
  neutral: { label: "", icon: "coins", tone: "primary" },
  warning: { label: "", icon: "caution", tone: "stateCaution" },
};

function fill(tone: StateToken | "primary", theme: ColorPalette): string {
  return tone === "primary" ? theme.primarySoft : theme[tone];
}

function foreground(tone: StateToken | "primary", theme: ColorPalette): string {
  // The library's own text colours are hard-coded, so the chip supplies its own.
  return relativeLuminance(fill(tone, theme)) > 0.45
    ? theme.textPrimary
    : theme.primaryFg;
}

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const channel = (index: number) => {
    const raw = parseInt(value.slice(index, index + 2), 16) / 255;
    return raw <= 0.03928 ? raw / 12.92 : ((raw + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function buildToastConfig(theme: ColorPalette): ToastConfig {
  const render = (kind: ToastKind) =>
    function ToastEntry({
      text1,
      text2,
    }: {
      text1?: string;
      text2?: string;
    }): ReactNode {
      const entry = ENTRIES[kind];
      return (
        <View
          style={[
            styles.row,
            {
              backgroundColor: fill(entry.tone, theme),
              borderRadius: radius.md,
            },
          ]}
        >
          <AppIcon
            name={entry.icon}
            size={18}
            color={foreground(entry.tone, theme)}
            weight="bold"
          />
          <View style={styles.text}>
            <View
              accessible
              accessibilityRole="text"
              accessibilityLiveRegion="polite"
            >
              <Text
                style={[styles.label, { color: foreground(entry.tone, theme) }]}
              >
                {text1}
              </Text>
            </View>
            {text2 ? (
              <Text
                style={[
                  styles.detail,
                  { color: foreground(entry.tone, theme) },
                ]}
              >
                {text2}
              </Text>
            ) : null}
          </View>
        </View>
      );
    };

  return {
    success: render("success"),
    neutral: render("neutral"),
    warning: render("warning"),
  };
}

const TIMING = { type: "timing", duration: duration.fast } as const;

/**
 * The library's default enter animation is `{ type: 'spring', friction: 8 }`,
 * and springs are forbidden by the motion spec, so timing is set explicitly.
 * There is deliberately no error toast: errors belong inline next to the thing
 * that failed, not in a banner that disappears.
 */
const BASE: ToastOptions = {
  position: "top",
  visibilityTime: 3000,
  autoHide: true,
  swipeable: true,
  animationConfig: TIMING,
};

export function showToast(kind: ToastKind, text1: string, text2?: string) {
  Toast.show({ ...BASE, type: kind, text1, text2 });
}

export { Toast };

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  text: {
    flex: 1,
  },
  label: {
    ...typography.label,
  },
  detail: {
    ...typography.caption,
  },
});
