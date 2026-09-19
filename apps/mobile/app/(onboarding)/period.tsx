import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useEngine, useStore } from "@/store";
import { formatDate } from "@/lib/format";
import { spacing } from "@/constants/tokens";

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export default function PeriodSetupScreen() {
  const router = useRouter();
  const { engine } = useEngine();
  const syncFromEngine = useStore((s) => s.syncFromEngine);

  const { start, end } = getCurrentMonthRange();
  const [periodName, setPeriodName] = useState("My Budget");

  function handleContinue() {
    if (!periodName.trim()) return;

    const result = engine.createPeriod({
      id: `period-${Date.now()}`,
      name: periodName.trim(),
      startDate: start,
      endDate: end,
    });

    if (!result.ok) {
      console.error("Failed to create period:", result.errors);
      return;
    }

    syncFromEngine();
    router.push({ pathname: "/category" });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="heading1" themeColor="textPrimary">
            Set Your Period
          </ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            A period is your budgeting cycle — typically a month.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <ThemedView style={styles.field}>
            <ThemedText type="label" themeColor="textSecondary">
              Period name
            </ThemedText>
            <TextField
              value={periodName}
              onChangeText={setPeriodName}
              placeholder="e.g. My Budget"
              autoCapitalize="words"
            />
          </ThemedView>

          <ThemedView style={styles.dateRange}>
            <ThemedView style={styles.dateField}>
              <ThemedText type="caption" themeColor="textMuted">
                Start
              </ThemedText>
              <ThemedText type="body" themeColor="textPrimary">
                {formatDate(start)}
              </ThemedText>
            </ThemedView>

            <ThemedText type="body" themeColor="textMuted">
              —
            </ThemedText>

            <ThemedView style={styles.dateField}>
              <ThemedText type="caption" themeColor="textMuted">
                End
              </ThemedText>
              <ThemedText type="body" themeColor="textPrimary">
                {formatDate(end)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <Button variant="primary" size="lg" onPress={handleContinue}>
          Continue
        </Button>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  form: {
    flex: 1,
    gap: spacing.xl,
  },
  field: {
    gap: spacing.sm,
  },
  dateRange: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dateField: {
    gap: spacing.xs,
  },
});
