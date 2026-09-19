import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TextField } from "@/components/ui/text-field";
import { useEngine, useStore } from "@/store";
import { spacing } from "@/constants/tokens";
type WalletType = "cash" | "bank" | "stokvel" | "savings";

const WALLET_TYPES: { label: string; value: WalletType }[] = [
  { label: "Cash", value: "cash" },
  { label: "Bank", value: "bank" },
  { label: "Stokvel", value: "stokvel" },
  { label: "Savings", value: "savings" },
];

export default function WalletSetupScreen() {
  const router = useRouter();
  const { engine } = useEngine();
  const syncFromEngine = useStore((s) => s.syncFromEngine);

  const [name, setName] = useState("Cash Wallet");
  const [walletType, setWalletType] = useState<WalletType>("cash");
  const [balance, setBalance] = useState("");

  function handleContinue() {
    if (!name.trim()) return;

    const now = new Date();
    const result = engine.createWallet({
      id: `wallet-${Date.now()}`,
      name: name.trim(),
      type: walletType,
      balance: Math.round((parseFloat(balance) || 0) * 100),
      currency: "ZAR",
      created_at: now,
    });

    if (result.ok) {
      syncFromEngine();
      router.push({ pathname: "/period" });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="heading1" themeColor="textPrimary">
            Create a Wallet
          </ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            Where will you track your spending?
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <ThemedView style={styles.field}>
            <ThemedText type="label" themeColor="textSecondary">
              Wallet name
            </ThemedText>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder="e.g. Cash Wallet"
              autoCapitalize="words"
            />
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="label" themeColor="textSecondary">
              Wallet type
            </ThemedText>
            <SegmentedControl
              options={WALLET_TYPES}
              selected={walletType}
              onChange={setWalletType}
            />
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="label" themeColor="textSecondary">
              Starting balance
            </ThemedText>
            <AmountInput value={balance} onChangeText={setBalance} />
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
});
