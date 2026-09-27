import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { randToCents } from "@numi/utils";
import type { Assignment, WalletType } from "@numi/domain";

import { AppIcon } from "@/components/app-icon";
import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import {
  AmountInput,
  Button,
  Card,
  PillToggle,
  ProgressDots,
  ScreenShell,
  TextField,
  type PillOption,
} from "@/components/ui";
import {
  formatCents,
  resolveCategoryAccent,
  spacing,
  type CategoryAccentKey,
} from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";
import { resolveAccentKeyForCategory } from "@/lib/category-accent";
import { useEngine, useStore } from "@/store";

/** Budget stepper increment. R5 is small enough to feel like a choice. */
const STEPPER_STEP = 500;

/** Steppers are 36px; `hitSlop` brings the effective target to 48. */
const STEPPER_SIZE = 36;
const STEPPER_HIT_SLOP = 8;

const WALLET_TYPES: readonly PillOption<WalletType>[] = [
  { value: "cash", label: "Cash", icon: "catOther" },
  { value: "bank", label: "Bank", icon: "balance" },
  { value: "stokvel", label: "Stokvel", icon: "coins" },
  { value: "savings", label: "Savings", icon: "goal" },
];

/**
 * Name only. `Wallet` has no `bankId`, so a brand colour would have nowhere to
 * persist — adding one would mean a presentation concern on a tested entity.
 */
const BANKS: readonly PillOption<"cash" | "bank">[] = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "ABSA" },
];

const PERIOD_NAME = "This month";

function monthRange(reference = new Date()): { start: Date; end: Date } {
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

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function QuickSetupScreen() {
  const { engine } = useEngine();
  const categories = useStore((s) => s.appState.categories);
  const setOnboardingSummary = useStore((s) => s.setOnboardingSummary);
  const syncFromEngine = useStore((s) => s.syncFromEngine);

  // Wallet
  const [walletName, setWalletName] = useState("Cash wallet");
  const [walletType, setWalletType] = useState<WalletType>("cash");
  const [bank, setBank] = useState<"cash" | "bank">("cash");
  const [balance, setBalance] = useState("");

  // Period
  const initialPeriod = useMemo(() => monthRange(), []);
  const [periodName, setPeriodName] = useState(PERIOD_NAME);
  const [start, setStart] = useState(initialPeriod.start);
  const [end, setEnd] = useState(initialPeriod.end);
  const [picking, setPicking] = useState<"start" | "end" | null>(null);

  // First budget — cents, keyed by category id
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balanceCents = randToCents(balance || "0");
  const totalAssigned = Object.values(amounts).reduce(
    (sum, cents) => sum + cents,
    0,
  );

  // An assignment may never exceed the wallet balance (C10), so a wallet with
  // no balance has no budget the engine would accept. The increase steppers are
  // disabled in that case rather than left to swallow taps.
  const canAssignBudget = balanceCents > 0;

  const isNameValid = walletName.trim().length > 0;
  const isPeriodValid = end.getTime() > start.getTime();
  const isWithinBalance = totalAssigned <= balanceCents;
  const canSubmit = isNameValid && isPeriodValid && isWithinBalance && !saving;

  const resolvedBankName = BANKS.find((option) => option.value === bank)?.label;
  const finalWalletName =
    walletType === "bank" && resolvedBankName
      ? resolvedBankName
      : walletName.trim() || "Wallet";

  const handleDateChange = useCallback(
    (which: "start" | "end") => (event: DateTimePickerEvent, next?: Date) => {
      setPicking(null);
      if (event.type !== "set" || !next) return;

      if (which === "start") {
        // Nudge the end forward rather than accepting an invalid range, so the
        // user cannot create a period that ends before it begins.
        setStart(next);
        if (next.getTime() >= end.getTime()) {
          const bumped = new Date(next);
          bumped.setDate(bumped.getDate() + 1);
          setEnd(bumped);
        }
        return;
      }

      if (next.getTime() > start.getTime()) setEnd(next);
    },
    [end, start],
  );

  const step = useCallback(
    (categoryId: string, delta: number) => {
      setAmounts((current) => {
        const next = (current[categoryId] ?? 0) + delta;
        // Clamp at zero going down, and at the wallet balance going up. The
        // engine rejects an over-assignment; this keeps the user from having to
        // find out by being told off.
        const clamped = Math.max(0, Math.min(next, balanceCents));
        return { ...current, [categoryId]: clamped };
      });
      setError(null);
    },
    [balanceCents],
  );

  const writeSummary = useCallback(
    (walletCount: number, budgetCount: number) => {
      const lines: string[] = [];
      if (balanceCents > 0)
        lines.push(`${finalWalletName}: ${formatCents(balanceCents)}`);
      for (const category of categories) {
        const cents = amounts[category.id] ?? 0;
        if (cents > 0) {
          lines.push(`${category.name}: ${formatCents(cents)}/mo`);
        }
      }
      setOnboardingSummary({
        walletCount,
        budgetCount,
        lines: lines.slice(0, 3),
      });
    },
    [amounts, balanceCents, categories, finalWalletName, setOnboardingSummary],
  );

  const handleDone = useCallback(() => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);

    const now = new Date();
    const wallet = engine.createWallet({
      id: `wallet-${now.getTime()}`,
      name: finalWalletName,
      type: walletType,
      // Rand→cents went through `randToCents` in `balanceCents`, never inline.
      balance: balanceCents,
      currency: "ZAR",
      created_at: now,
    });

    if (!wallet.ok) {
      setError(wallet.errors[0]?.message ?? "Could not create wallet.");
      setSaving(false);
      return;
    }

    const period = engine.createPeriod({
      name: periodName.trim() || PERIOD_NAME,
      startDate: start,
      endDate: end,
    });

    if (!period.ok) {
      setError(period.errors[0]?.message ?? "Could not start a period.");
      setSaving(false);
      return;
    }

    let budgetCount = 0;
    for (const category of categories) {
      const cents = amounts[category.id] ?? 0;
      if (cents <= 0) continue;

      const assignment: Assignment = {
        id: `assignment-${category.id}-${now.getTime()}`,
        period_id: period.value.id,
        category_id: category.id,
        wallet_id: wallet.value.id,
        amount: cents,
        created_at: now,
      };

      const result = engine.createAssignment(assignment);
      if (!result.ok) {
        setError(result.errors[0]?.message ?? "Could not set a budget.");
        setSaving(false);
        return;
      }
      budgetCount += 1;
    }

    writeSummary(1, budgetCount);
    // The engine holds the new wallet and period; the store's `appState` is a
    // separate snapshot and does not see them until it is synced. Without this
    // the store stays empty, `all-set` has to fall back to the summary, and
    // Home renders its "No wallet yet" empty state over a wallet that exists.
    syncFromEngine();
    router.replace("/(onboarding)/all-set");
  }, [
    amounts,
    balanceCents,
    canSubmit,
    categories,
    end,
    engine,
    finalWalletName,
    periodName,
    start,
    syncFromEngine,
    walletType,
    writeSummary,
  ]);

  const handleSkip = useCallback(() => {
    if (saving) return;
    setSaving(true);
    setError(null);

    const now = new Date();
    // A zero-balance wallet is not optional bookkeeping: the engine rejects an
    // assignment against a missing wallet, and the user needs something for
    // `EmptyState` to hang the rest of onboarding on.
    const wallet = engine.createWallet({
      id: `wallet-${now.getTime()}`,
      name: "Cash",
      type: "cash",
      balance: 0,
      currency: "ZAR",
      created_at: now,
    });

    if (!wallet.ok) {
      setError(wallet.errors[0]?.message ?? "Could not start.");
      setSaving(false);
      return;
    }

    writeSummary(1, 0);
    syncFromEngine();
    router.replace("/(onboarding)/all-set");
  }, [engine, saving, syncFromEngine, writeSummary]);

  return (
    <ScreenBackground>
      <ScreenShell style={styles.shell}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ProgressDots total={4} current={2} />
            <ThemedText type="overline" tone="textMuted">
              Step 3 of 4 — Optional
            </ThemedText>
            <ThemedText type="heading1">Quick Setup</ThemedText>
            <ThemedText type="body" tone="textMuted">
              Set up your wallet and first budget, or skip and do it later.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <PillToggle
              label="What kind of wallet"
              options={WALLET_TYPES}
              value={walletType}
              onChange={setWalletType}
            />
            <TextField
              label="Name"
              value={walletName}
              onChangeText={setWalletName}
              placeholder="Cash wallet"
              maxLength={30}
            />
            <AmountInput
              label="Starting balance"
              value={balance}
              onChangeText={setBalance}
            />
          </View>

          <View style={styles.section}>
            <PillToggle
              label="Bank"
              options={BANKS}
              value={bank}
              onChange={setBank}
            />
          </View>

          <View style={styles.section}>
            <ThemedText type="label" tone="textSecondary">
              Period
            </ThemedText>
            <TextField
              value={periodName}
              onChangeText={setPeriodName}
              placeholder={PERIOD_NAME}
              maxLength={30}
            />
            <DateButton
              label="Start date"
              value={formatDay(start)}
              onPress={() => setPicking("start")}
            />
            <DateButton
              label="End date"
              value={formatDay(end)}
              onPress={() => setPicking("end")}
            />
            {!isPeriodValid ? (
              <ThemedText type="caption" tone="stateAlert">
                End date must be after start date.
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.section}>
            <ThemedText type="label" tone="textSecondary">
              First budget
            </ThemedText>
            {categories.map((category) => (
              <BudgetRow
                key={category.id}
                name={category.name}
                accentKey={resolveAccentKeyForCategory(
                  category.id,
                  category.name,
                )}
                cents={amounts[category.id] ?? 0}
                canIncrease={canAssignBudget}
                onStep={(delta) => step(category.id, delta)}
              />
            ))}
            <Card tone="raised" padding="sm">
              <View style={styles.total}>
                <ThemedText type="label" tone="textSecondary">
                  Total set aside
                </ThemedText>
                <ThemedText type="amountLg">
                  {formatCents(totalAssigned)}
                </ThemedText>
              </View>
            </Card>
            {!canAssignBudget ? (
              <ThemedText type="caption" tone="textMuted">
                Add a starting balance above to set a budget.
              </ThemedText>
            ) : null}
            {!isWithinBalance ? (
              <ThemedText type="caption" tone="stateAlert">
                You only have {formatCents(balanceCents)} in this wallet.
              </ThemedText>
            ) : null}
          </View>

          {error ? (
            <ThemedText type="caption" tone="stateAlert">
              {error}
            </ThemedText>
          ) : null}
        </ScrollView>

        <View style={styles.actions}>
          <Button
            onPress={handleDone}
            disabled={!canSubmit}
            size="lg"
            fullWidth
          >
            I&apos;m done
          </Button>
          <Button
            onPress={handleSkip}
            variant="ghost"
            size="lg"
            fullWidth
            disabled={saving}
          >
            Skip for now
          </Button>
        </View>

        {picking ? (
          <DateTimePicker
            value={picking === "start" ? start : end}
            mode="date"
            display="inline"
            onChange={handleDateChange(picking)}
          />
        ) : null}
      </ScreenShell>
    </ScreenBackground>
  );
}

type DateButtonProps = {
  label: string;
  value: string;
  onPress: () => void;
};

function DateButton({ label, value, onPress }: DateButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
    >
      <ThemedText type="overline" tone="textMuted">
        {label}
      </ThemedText>
      <ThemedText type="title">{value}</ThemedText>
    </Pressable>
  );
}

type BudgetRowProps = {
  name: string;
  accentKey: CategoryAccentKey;
  cents: number;
  canIncrease: boolean;
  onStep: (delta: number) => void;
};

function BudgetRow({
  name,
  accentKey,
  cents,
  canIncrease,
  onStep,
}: BudgetRowProps) {
  const mode = useThemeMode();
  const accent = resolveCategoryAccent(accentKey, mode);

  return (
    <View style={styles.budgetRow}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <ThemedText type="body" style={styles.budgetName}>
        {name}
      </ThemedText>
      <StepperButton
        icon="subtract"
        label={`Decrease ${name}`}
        disabled={cents <= 0}
        onPress={() => onStep(-STEPPER_STEP)}
      />
      <ThemedText type="amountSm" style={styles.budgetAmount}>
        {formatCents(cents)}
      </ThemedText>
      <StepperButton
        icon="add"
        label={`Increase ${name}`}
        disabled={!canIncrease}
        onPress={() => onStep(STEPPER_STEP)}
      />
    </View>
  );
}

type StepperButtonProps = {
  icon: "add" | "subtract";
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function StepperButton({ icon, label, onPress, disabled }: StepperButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={STEPPER_HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.stepper,
        disabled && styles.stepperOff,
        pressed && styles.stepperPressed,
      ]}
    >
      <AppIcon name={icon} size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  shell: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  total: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  budgetName: {
    flex: 1,
  },
  budgetAmount: {
    minWidth: 72,
    textAlign: "right",
  },
  stepper: {
    width: STEPPER_SIZE,
    height: STEPPER_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: STEPPER_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "transparent",
  },
  stepperPressed: {
    opacity: 0.6,
  },
  stepperOff: {
    opacity: 0.3,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
});
