import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

/**
 * Whether the user has asked the OS to reduce motion. The spec is firm: every
 * transition becomes instant and the count-up is disabled, because a number
 * sweeping into place is exactly the kind of decoration that setting is for.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (Platform.OS === "web") {
      if (typeof window === "undefined" || !window.matchMedia) return;
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      const sync = () => {
        if (!cancelled) setReduced(query.matches);
      };
      sync();
      query.addEventListener("change", sync);
      return () => {
        cancelled = true;
        query.removeEventListener("change", sync);
      };
    }

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!cancelled) setReduced(enabled);
      })
      .catch(() => {
        if (!cancelled) setReduced(false);
      });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        setReduced(enabled);
      },
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return reduced;
}
