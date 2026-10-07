import { color } from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";

/**
 * The screen options every stack in the app shares: no header, and a content
 * background matched to the palette in play so a transition never flashes the
 * wrong colour. `animation` is opt-in — a group that runs its own internal
 * motion (the onboarding PIN slide) cross-fades instead of pushing, because
 * stacking two horizontal motions on one transition reads as a lurch.
 */
export function useStackScreenOptions(animation?: "fade") {
  const mode = useThemeMode();

  return {
    headerShown: false,
    contentStyle: { backgroundColor: color[mode].background },
    ...(animation ? { animation } : {}),
  };
}
