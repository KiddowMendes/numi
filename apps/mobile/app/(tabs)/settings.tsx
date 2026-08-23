import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Settings</ThemedText>
        <ThemedView style={styles.card}>
          <ThemedText type="default" themeColor="textSecondary">
            Settings coming soon.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    padding: Spacing.four,
    gap: Spacing.one,
  },
});
