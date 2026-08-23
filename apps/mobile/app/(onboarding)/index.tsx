import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEngine, useStore } from '@/store';
import { Spacing } from '@/constants/theme';

export default function OnboardingWelcome() {
  const router = useRouter();
  const { engine } = useEngine();
  const syncFromEngine = useStore((s) => s.syncFromEngine);
  const user = useStore((s) => s.appState.user);

  const [walletName, setWalletName] = useState('');
  const [balance, setBalance] = useState('');

  function handleContinue() {
    if (!walletName.trim()) return;

    const now = new Date();
    const result = engine.createWallet({
      id: `wallet-${Date.now()}`,
      name: walletName.trim(),
      type: 'cash',
      balance: Math.round((parseFloat(balance) || 0) * 100),
      currency: 'ZAR',
      created_at: now,
    });

    if (result.ok) {
      syncFromEngine();
      router.push({ pathname: '/period' });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Welcome to Numi</ThemedText>
        <ThemedText type="default">
          Let&apos;s set up your first wallet to get started.
        </ThemedText>

        <View style={styles.form}>
          <ThemedText type="smallBold">Wallet name</ThemedText>
          <TextInput
            style={styles.input}
            value={walletName}
            onChangeText={setWalletName}
            placeholder="e.g. Main Wallet"
            placeholderTextColor="#999"
            autoCapitalize="words"
          />

          <ThemedText type="smallBold">Starting balance (ZAR)</ThemedText>
          <TextInput
            style={styles.input}
            value={balance}
            onChangeText={setBalance}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleContinue}>
          <ThemedText type="default" style={styles.buttonText}>
            Continue
          </ThemedText>
        </Pressable>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.three,
  },
  form: {
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
