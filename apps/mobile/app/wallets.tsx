import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { canCreateWallet, walletLimitFor } from "@numi/domain";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import {
  Button,
  CenterDockButton,
  EmptyState,
  GroupList,
  GroupRow,
  WalletSheet,
} from "@/components/ui";
import { formatCents, screenPadding, spacing } from "@/constants/tokens";
import { walletTypeIcon, walletTypeLabel } from "@/lib/wallet-types";
import { useStore } from "@/store";

/** Matches `SIZE` in `CenterDockButton`, for clearing the docked button. */
const DOCK_SIZE = 66;

/**
 * The wallets screen: where the user adds a money source, renames or retypes
 * one, corrects a balance, or removes an empty wallet. Reached from Settings.
 *
 * Not a tab: wallet management is a chore the home screen should not carry, so
 * the home screen keeps the one number that matters and links here for the
 * breakdown (spec 0003, Option 1).
 */
export default function WalletsScreen() {
  const insets = useSafeAreaInsets();
  const wallets = useStore((s) => s.appState.wallets);
  const user = useStore((s) => s.appState.user);
  const openAddWalletSheet = useStore((s) => s.openAddWalletSheet);
  const openEditWalletSheet = useStore((s) => s.openEditWalletSheet);

  const limit = walletLimitFor(user.tier);
  const atCap = !canCreateWallet(user, wallets.length);
  // The cap line is a freemium concern; premium is unlimited, so it is hidden.
  const showCapLine = Number.isFinite(limit);

  const dockOffset = insets.bottom + spacing.sm;
  const contentBottom = insets.bottom + DOCK_SIZE + spacing["2xl"];

  return (
    <ScreenBackground style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.lg, paddingBottom: contentBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            fullWidth={false}
            icon="back"
            onPress={() => router.back()}
            style={styles.back}
          >
            Back
          </Button>
          <ThemedText type="heading1">Wallets</ThemedText>
          <ThemedText type="body" tone="textSecondary">
            Where your money sits.
          </ThemedText>
        </View>

        {wallets.length === 0 ? (
          <EmptyState
            variant="noWallet"
            action={{ label: "Add a wallet", onPress: openAddWalletSheet }}
          />
        ) : (
          <GroupList label="Your wallets">
            {wallets.map((wallet, index) => (
              <GroupRow
                key={wallet.id}
                label={wallet.name}
                icon={walletTypeIcon(wallet.type)}
                detail={walletTypeLabel(wallet.type)}
                value={formatCents(wallet.balance)}
                valueTone="textPrimary"
                onPress={() => openEditWalletSheet(wallet.id)}
                isLast={index === wallets.length - 1}
              />
            ))}
          </GroupList>
        )}

        {showCapLine ? (
          <ThemedText type="caption" tone="textMuted" align="center">
            {wallets.length} of {limit} wallets used
          </ThemedText>
        ) : null}
      </ScrollView>

      <CenterDockButton
        icon="add"
        label="Add wallet"
        accessibilityHint="Opens a sheet to add a money source"
        disabled={atCap}
        offset={dockOffset}
        onPress={openAddWalletSheet}
      />

      <WalletSheet />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: screenPadding,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  back: {
    alignSelf: "flex-start",
    paddingHorizontal: 0,
  },
});
