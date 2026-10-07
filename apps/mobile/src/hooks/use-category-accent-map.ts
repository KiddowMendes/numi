import { useMemo } from "react";

import { resolveCategoryAccent } from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";
import { resolveAccentKeyForCategory } from "@/lib/category-accent";
import { useStore } from "@/store";

export type CategoryAccentEntry = { name: string; color: string };

/**
 * Categories keyed by id, each carrying its resolved accent for the palette in
 * play. The accent key is derived once per (categories, mode) rather than on
 * every row render — `resolveAccentKeyForCategory` falls back on a cursor, so
 * re-deriving it per render would hand the same category a different colour
 * each time.
 */
export function useCategoryAccentMap(): Map<string, CategoryAccentEntry> {
  const mode = useThemeMode();
  const categories = useStore((s) => s.appState.categories);

  return useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category.id,
          {
            name: category.name,
            color: resolveCategoryAccent(
              resolveAccentKeyForCategory(category.id, category.name),
              mode,
            ),
          },
        ]),
      ),
    [categories, mode],
  );
}
