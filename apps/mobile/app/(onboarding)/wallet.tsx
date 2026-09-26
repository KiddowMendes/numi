import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/ui/pill-toggle";
import { ProgressDots } from "@/components/ui/progress-dots";
import { TextField } from "@/components/ui/text-field";
import {
  screenPadding,
  spacing,
  themePreferences,
  type ThemePreferenceValue,
} from "@/constants/tokens";
import { useEngine, useStore } from "@/store";

type WalletType = "cash" | "bank" | "stokvel" | "savings";

const WALLET_TYPES = [
  { value: "cash" as const, label: "Cash", icon: "catOther" as const },
  { value: "bank" as const, label: "Bank", icon: "balance" as const },
  { value: "stokvel" as const, label: "Stokvel", icon: "coins" as const },
  { value: "savings" as const, label: "Savings", icon: "goal" as const },
];

const THEME_OPTIONS = themePreferences.map((preference) => ({
  value: preference.value,
  label: preference.label,
  icon:
    preference.value === "light"
      ? ("sun" as const)
      : preference.value === "dark"
        ? ("moon" as const)
        : ("device" as const),
}));

/**
 * Step one of two: the wallet the money sits in, and how NUMI should look.
 *
 * Both live on one screen because the old flow spent three screens asking
 * questions that fit on one, and the locked pattern doc is explicit that
 * onboarding should not be a wizard.
 */
export default function WalletSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { engine } = useEngine();
  const syncFromEngine = useStore((s) => s.syncFromEngine);
  const setThemePreference = useStore((s) => s.setThemePreference);

  const [name, setName] = useState("Cash wallet");
  const [walletType, setWalletType] = useState<WalletType>("cash");
  const [balance, setBalance] = useState("");
  const [theme, setTheme] = useState<ThemePreferenceValue>("light");
  const [error, setError] = useState<string | null>(null);

  function handleContinue() {
    if (!name.trim()) {
      setError("Give the wallet a name so you can tell it apart later.");
      return;
    }

    const result = engine?.createWallet({
      id: `wallet-${Date.now()}`,
      name: name.trim(),
      type: walletType,
      balance: Math.round(Number.parseFloat(balance || "0") * 100),
      currency: "ZAR",
      created_at: new Date(),
    });

    if (!result?.ok) {
      setError(
        result && !result.ok
          ? (result.errors[0]?.message ?? "Could not create that wallet.")
          : "Engine not ready.",
      );
      return;
    }

    setThemePreference(theme);
    syncFromEngine();
    router.push({ pathname: "/period" });
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
          <ProgressDots total={2} current={0} />

          <View style={styles.header}>
            <ThemedText type="heading1">Where does your money sit?</ThemedText>
            <ThemedText type="body" tone="textSecondary">
              One wallet is enough to start. You can add more later.
            </ThemedText>
          </View>

          <TextField
            label="Wallet name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Cash wallet"
            autoCapitalize="sentences"
            returnKeyType="next"
          />

          <PillToggle
            label="What kind"
            options={WALLET_TYPES}
            value={walletType}
            onChange={setWalletType}
          />

          <AmountInput
            label="How much is in it today?"
            value={balance}
            onChangeText={setBalance}
            error={error ?? undefined}
          />

          <PillToggle
            label="How should NUMI look?"
            options={THEME_OPTIONS}
            value={theme}
            onChange={(value) => {
              setTheme(value);
              setThemePreference(value);
            }}
          />

          <Button
            size="lg"
            onPress={handleContinue}
            icon="forward"
            iconPosition="trailing"
          >
            Continue
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
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
});
