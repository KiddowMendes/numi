import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Animated from "react-native-reanimated";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import { Button, PinDots, PinPad, ScreenShell } from "@/components/ui";
import { spacing } from "@/constants/tokens";
import { PRE_SHAKE_DELAY_MS, useShake } from "@/hooks/use-shake";
import {
  PIN_LOCKOUT_SECONDS,
  PIN_MAX_ATTEMPTS,
  clearPin,
  isCompletePin,
  verifyPin,
} from "@/lib/pin";
import { useEngine, useStore } from "@/store";

export default function UnlockScreen() {
  const { shakeStyle, triggerShake } = useShake();
  const { resetEngine } = useEngine();
  const markUnlocked = useStore((s) => s.markUnlocked);
  const isOnboarded = useStore((s) => s.isOnboarded);
  const resetForNewUser = useStore((s) => s.resetForNewUser);

  const [digits, setDigits] = useState("");
  // Authoritative keypad buffer. The handler is a `useCallback` over `digits`,
  // so two taps arriving before React re-renders would both read the same value
  // and the second would overwrite the first.
  const digitsRef = useRef("");
  const [attempts, setAttempts] = useState(0);
  const [lockedFor, setLockedFor] = useState(0);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [error, setError] = useState("");

  const locked = lockedFor > 0;

  useEffect(() => {
    if (lockedFor <= 0) return;
    const id = setTimeout(() => {
      setLockedFor((current) => Math.max(0, current - 1));
      if (lockedFor - 1 <= 0) setAttempts(0);
    }, 1000);
    return () => clearTimeout(id);
  }, [lockedFor]);

  const fail = useCallback(
    (message: string) => {
      setError(message);
      digitsRef.current = "";
      setDigits("");
      triggerShake();
    },
    [triggerShake],
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (locked) return;
      setError("");
      const next = digitsRef.current + digit;
      digitsRef.current = next;
      setDigits(next);
      if (!isCompletePin(next)) return;

      void verifyPin(next).then((ok) => {
        if (ok) {
          markUnlocked();
          // A cold launch resets `isOnboarded` while the hash survives, so the
          // tabs are not always registered. Send an unfinished app back into
          // onboarding rather than at a route the stack is not showing.
          router.replace(isOnboarded ? "/(tabs)" : "/(onboarding)/welcome");
          return;
        }

        const used = attempts + 1;
        setAttempts(used);
        if (used >= PIN_MAX_ATTEMPTS) {
          setLockedFor(PIN_LOCKOUT_SECONDS);
          fail("Too many tries. Wait a moment.");
          return;
        }
        setTimeout(() => fail("That PIN is not right."), PRE_SHAKE_DELAY_MS);
      });
    },
    [attempts, fail, isOnboarded, locked, markUnlocked],
  );

  const handleBackspace = useCallback(() => {
    const next = digitsRef.current.slice(0, -1);
    digitsRef.current = next;
    setDigits(next);
  }, []);

  const handleReset = useCallback(() => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }

    void clearPin().then(() => {
      resetEngine();
      resetForNewUser();
      router.replace("/(onboarding)/welcome");
    });
  }, [confirmingReset, resetEngine, resetForNewUser]);

  return (
    <ScreenBackground>
      <ScreenShell paddingBottom={spacing.lg} style={styles.shell}>
        <View style={styles.head}>
          <ThemedText type="heading1" align="center">
            Welcome back
          </ThemedText>
          <ThemedText type="caption" tone="textMuted" align="center">
            {locked
              ? `Locked for ${lockedFor}s`
              : `${PIN_MAX_ATTEMPTS - attempts} tries left`}
          </ThemedText>
        </View>

        <Animated.View style={[styles.body, shakeStyle]}>
          <PinDots digits={digits} />
          <PinPad
            onDigitPress={handleDigitPress}
            onBackspace={handleBackspace}
            disabled={locked}
            style={styles.pad}
          />
          <ThemedText
            type="caption"
            tone="stateAlert"
            align="center"
            style={styles.error}
          >
            {error || " "}
          </ThemedText>
        </Animated.View>

        <View style={styles.actions}>
          <Button onPress={handleReset} variant="ghost" size="sm" fullWidth>
            {confirmingReset
              ? "Tap again to erase this app"
              : "Forgot PIN? Reset app"}
          </Button>
          {confirmingReset ? (
            <ThemedText type="caption" tone="stateAlert" align="center">
              This deletes the wallet and period on this device. It cannot be
              undone.
            </ThemedText>
          ) : null}
        </View>
      </ScreenShell>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  head: {
    marginTop: spacing["2xl"],
    gap: spacing.xs,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xl,
  },
  pad: {
    alignSelf: "stretch",
  },
  error: {
    minHeight: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
});
