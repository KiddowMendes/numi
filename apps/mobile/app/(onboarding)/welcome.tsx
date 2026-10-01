import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import {
  Button,
  RadialGlow,
  RingWatermark,
  ScreenShell,
  TextField,
} from "@/components/ui";
import { screenPadding, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";
import { useStore } from "@/store";

const MAX_NAME = 30;

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const setUserName = useStore((s) => s.setUserName);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const fieldRef = useRef<React.ComponentRef<typeof TextField>>(null);

  const trimmed = name.trim();
  const isValid = trimmed.length >= 2;

  const handleSubmit = () => {
    if (!isValid || saving) return;
    setSaving(true);
    setUserName(trimmed);
    // Replace, not push: Back must not return to a name field already submitted.
    router.replace("/(onboarding)/pin");
  };

  return (
    <ScreenBackground>
      <RadialGlow color={theme.primary} />
      <RingWatermark
        top={insets.top + spacing["2xl"]}
        right={-90}
        opacity={0.07}
      />

      <ScreenShell style={styles.shell}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <View style={styles.brand}>
            <ThemedText type="display" align="center">
              NUMI
            </ThemedText>
            <ThemedText type="body" tone="textSecondary" align="center">
              Every rand gets a job.
            </ThemedText>
          </View>

          <View style={styles.centre}>
            <View style={styles.form}>
              <TextField
                ref={fieldRef}
                value={name}
                onChangeText={setName}
                placeholder="What should we call you?"
                maxLength={MAX_NAME}
                autoFocus
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
                inputType="title"
                textAlign="center"
                accessibilityLabel="Your name"
              />

              <Button
                onPress={handleSubmit}
                disabled={!isValid || saving}
                size="lg"
                fullWidth
                icon="forward"
                iconPosition="trailing"
                accessibilityHint="Saves your name and sets a PIN"
              >
                Let&apos;s go
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScreenShell>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  shell: {
    // The brand block sits clear of the status bar; the glow bleeds behind it.
    paddingTop: spacing.xl,
  },
  brand: {
    alignItems: "center",
    gap: spacing.xs,
  },
  centre: {
    flex: 1,
    justifyContent: "center",
  },
  form: {
    width: "100%",
    paddingHorizontal: screenPadding,
    gap: spacing.lg,
  },
});
