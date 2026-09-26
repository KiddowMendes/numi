import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";

import { AppIcon, type IconName } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import { duration, radius, spacing, type StateToken } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type SafeToSpendHeroProps = {
  /** The safe-to-spend figure, already formatted. */
  amount: string;
  /** Fraction of the period already committed or spent, 0–1. Drives the arc. */
  consumed: number;
  /** How many days are left in the period. */
  daysRemaining: number;
  state: StateToken;
  caption?: string;
  style?: ViewStyle;
};

const SIZE = 248;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SWEEP = 0.72;

const STATE_ICON: Record<StateToken, IconName> = {
  stateSafe: "safe",
  stateCaution: "caution",
  stateAlert: "alert",
};

/**
 * The one number that answers "will my money last?".
 *
 * The arc is the fraction of the period already committed, so a full ring means
 * the money is spoken for and an empty ring means it is all still yours. State
 * is carried by an icon and a caption as well as by hue, never by hue alone.
 */
export function SafeToSpendHero({
  amount,
  consumed,
  daysRemaining,
  state,
  caption,
  style,
}: SafeToSpendHeroProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  const sweep = Math.max(0, Math.min(1, consumed));
  const progress = useSharedValue(reduceMotion ? sweep : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? sweep
      : withTiming(sweep, {
          duration: duration.gauge,
          easing: Easing.out(Easing.cubic),
        });
  }, [progress, reduceMotion, sweep]);

  const dashOffset = useDerivedValue(
    () => CIRCUMFERENCE * (1 - progress.value * SWEEP),
  );

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const trackColor = theme.surfaceSunken;
  const progressColor = theme[state];
  const iconColor = theme[state];

  return (
    <View
      style={[styles.wrap, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Safe to spend today: ${amount}. ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} remaining.`}
    >
      <View style={styles.gauge}>
        <Svg width={SIZE} height={SIZE}>
          <G rotation={144} origin={`${SIZE / 2}, ${SIZE / 2}`}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={trackColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={CIRCUMFERENCE * (1 - SWEEP)}
              fill="none"
            />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={progressColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              animatedProps={animatedProps}
              fill="none"
            />
          </G>
        </Svg>

        <View style={styles.centre} pointerEvents="none">
          <AppIcon
            name={STATE_ICON[state]}
            size={22}
            color={iconColor}
            weight="fill"
          />
          <ThemedText
            type="display"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.amount}
          >
            {amount}
          </ThemedText>
          <ThemedText type="caption" tone="textMuted">
            {caption ?? "safe to spend today"}
          </ThemedText>
        </View>
      </View>

      <View style={styles.footer}>
        <AppIcon name="calendar" size={14} color={theme.textMuted} />
        <ThemedText type="label" tone="textSecondary">
          {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left this
          period
        </ThemedText>
      </View>
    </View>
  );
}

/** The zero case is its own thing: no green, no red, just honest. */
export function SafeToSpendZero({ style }: { style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View style={[styles.wrap, styles.zeroWrap, style]}>
      <View
        style={[
          styles.zeroCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <ThemedText type="amountHero" tone="textSecondary">
          R0
        </ThemedText>
        <ThemedText type="label" tone="textMuted" align="center">
          Nothing is safe to spend right now. Your money is already spoken for.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: spacing.md,
  },
  zeroWrap: {
    paddingVertical: spacing.md,
  },
  gauge: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  centre: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  amount: {
    paddingHorizontal: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  zeroCard: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
