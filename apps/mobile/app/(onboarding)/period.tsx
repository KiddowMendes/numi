import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ProgressDots } from "@/components/ui/progress-dots";
import { TextField } from "@/components/ui/text-field";
import { radius, screenPadding, spacing } from "@/constants/tokens";
import { useEngine, useStore } from "@/store";

function monthRange(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(
    reference.getFullYear(),
    reference.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  return { start, end };
}

type PickerField = "start" | "end";

/**
 * Step two of two: the budgeting period.
 *
 * The dates were previously rendered as dead text even though a date picker was
 * already installed and unused. They are editable now, because a period that
 * cannot be moved is a period you have to abandon and start again.
 */
export default function PeriodSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { engine } = useEngine();
  const syncFromEngine = useStore((s) => s.syncFromEngine);

  const initial = monthRange();
  const [name, setName] = useState("This month");
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [picking, setPicking] = useState<PickerField | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onChange(event: DateTimePickerEvent, chosen?: Date) {
    const field = picking;
    setPicking(null);
    if (event.type !== "set" || !chosen || !field) return;

    if (field === "start") {
      setStart(chosen);
      if (chosen >= end)
        setEnd(
          new Date(chosen.getFullYear(), chosen.getMonth() + 1, 0, 23, 59, 59),
        );
    } else {
      setEnd(chosen);
      if (chosen <= start)
        setStart(new Date(chosen.getFullYear(), chosen.getMonth(), 1));
    }
    setError(null);
  }

  function handleContinue() {
    if (!name.trim()) {
      setError("Give the period a name.");
      return;
    }
    if (end <= start) {
      setError("The end date has to be after the start date.");
      return;
    }

    const result = engine.createPeriod({
      id: `period-${Date.now()}`,
      name: name.trim(),
      startDate: start,
      endDate: end,
    });

    if (!result.ok) {
      setError(result.errors[0]?.message ?? "Could not start that period.");
      return;
    }

    syncFromEngine();
    router.push({ pathname: "/category" });
  }

  return (
    <ScreenBackground style={styles.root}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <ProgressDots total={2} current={1} />

          <View style={styles.header}>
            <ThemedText type="heading1">How long is this plan for?</ThemedText>
            <ThemedText type="body" tone="textSecondary">
              A period is the window NUMI measures against. A month is usual.
            </ThemedText>
          </View>

          <TextField
            label="Period name"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setError(null);
            }}
            placeholder="e.g. This month"
            autoCapitalize="sentences"
            returnKeyType="done"
          />

          <View style={styles.dates}>
            <DateButton
              label="Starts"
              value={start}
              onPress={() => setPicking("start")}
            />
            <View style={styles.dash}>
              <ThemedText type="body" tone="textDisabled">
                —
              </ThemedText>
            </View>
            <DateButton
              label="Ends"
              value={end}
              onPress={() => setPicking("end")}
            />
          </View>

          {picking ? (
            <DateTimePicker
              value={picking === "start" ? start : end}
              mode="date"
              display="inline"
              onChange={onChange}
            />
          ) : null}

          {error ? (
            <ThemedText type="caption" tone="stateAlert">
              {error}
            </ThemedText>
          ) : null}

          <View style={styles.spacer} />

          <Button
            size="lg"
            onPress={handleContinue}
            icon="forward"
            iconPosition="trailing"
          >
            Start planning
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

function DateButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value: Date;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}`}
      style={styles.dateButton}
    >
      <ThemedText type="overline" tone="textMuted">
        {label}
      </ThemedText>
      <ThemedText type="title">
        {value.toLocaleDateString("en-ZA", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: screenPadding,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  dates: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dateButton: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  dash: {
    paddingHorizontal: spacing.xs,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
});
