import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { AppIcon, type IconName } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import {
  iconSize,
  type ColorPalette,
  type StateToken,
} from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type GemBadgeProps = {
  label: string;
  tone?: StateToken | "primary" | "neutral";
  icon?: IconName;
  size?: "sm" | "md";
  style?: ViewStyle;
};

const STATE_ICON: Record<StateToken, IconName> = {
  stateSafe: "safe",
  stateCaution: "caution",
  stateAlert: "alert",
};

const GLYPH_GAP = 3;

const SIZE = {
  sm: { w: 30, h: 26, cut: 7, font: 11 as const, pad: 10 },
  md: { w: 40, h: 34, cut: 9, font: 12 as const, pad: 14 },
};

/**
 * A faceted tag, the shape you get by cutting the corners off a lozenge. Reads
 * as a distinct object rather than another pill, so a status never gets lost
 * in a row of controls.
 */
export function GemBadge({
  label,
  tone = "neutral",
  icon,
  size = "sm",
  style,
}: GemBadgeProps) {
  const theme = useTheme();
  const dim = SIZE[size];

  const fill = resolveFill(tone, theme);
  const foreground =
    tone === "neutral" ? theme.textSecondary : resolveForeground(tone, theme);
  const glyph = icon ?? (isState(tone) ? STATE_ICON[tone] : undefined);

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={style}
      hitSlop={4}
    >
      <View style={styles.row}>
        <Svg width={dim.w} height={dim.h} viewBox={`0 0 ${dim.w} ${dim.h}`}>
          <Path
            d={gemPath(dim.w, dim.h, dim.cut)}
            fill={fill}
            stroke={resolveStroke(tone, theme)}
            strokeWidth={1}
          />
        </Svg>
        <View style={[styles.labelWrap, { left: dim.pad - 3 }]}>
          {glyph ? (
            <AppIcon
              name={glyph}
              size={size === "sm" ? iconSize.dot : 13}
              color={foreground}
              weight="bold"
            />
          ) : null}
          <ThemedText
            type="overline"
            numberOfLines={1}
            style={{ color: foreground, fontSize: dim.font }}
          >
            {label}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function isState(tone: GemBadgeProps["tone"]): tone is StateToken {
  return (
    tone === "stateSafe" || tone === "stateCaution" || tone === "stateAlert"
  );
}

function resolveFill(
  tone: NonNullable<GemBadgeProps["tone"]>,
  theme: ColorPalette,
): string {
  if (tone === "neutral") return theme.surfaceSunken;
  if (tone === "primary") return theme.primarySoft;
  return theme[tone];
}

function resolveStroke(
  tone: NonNullable<GemBadgeProps["tone"]>,
  theme: ColorPalette,
): string {
  if (tone === "neutral") return theme.border;
  if (tone === "primary") return theme.primary;
  return theme[tone];
}

function resolveForeground(
  tone: NonNullable<GemBadgeProps["tone"]>,
  theme: ColorPalette,
): string {
  const fill = resolveFill(tone, theme);
  return relativeLuminance(fill) > 0.45 ? theme.textPrimary : theme.primaryFg;
}

/**
 * Fills flip lightness between themes — a state green is dark in light mode and
 * pale in dark mode — so the legible foreground has to be derived from the fill
 * rather than assumed.
 */
function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const channel = (index: number) => {
    const raw = parseInt(value.slice(index, index + 2), 16) / 255;
    return raw <= 0.03928 ? raw / 12.92 : ((raw + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** A lozenge with all four corners cut. */
function gemPath(w: number, h: number, cut: number): string {
  return [
    `M ${cut} 0`,
    `H ${w - cut}`,
    `L ${w} ${cut}`,
    `V ${h - cut}`,
    `L ${w - cut} ${h}`,
    `H ${cut}`,
    `L 0 ${h - cut}`,
    `V ${cut}`,
    "Z",
  ].join(" ");
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelWrap: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: GLYPH_GAP,
  },
});
