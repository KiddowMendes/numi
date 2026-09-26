import {
  categoryAccentOrder,
  type CategoryAccentKey,
} from "@/constants/tokens";

const KEYWORDS: { accent: CategoryAccentKey; words: string[] }[] = [
  {
    accent: "food",
    words: [
      "food",
      "eat",
      "meal",
      "grocer",
      "kitchen",
      "coffee",
      "lunch",
      "dinner",
    ],
  },
  {
    accent: "transport",
    words: [
      "transport",
      "taxi",
      "bus",
      "fuel",
      "petrol",
      "travel",
      "ride",
      "car",
    ],
  },
  {
    accent: "bills",
    words: ["bill", "utilit", "electric", "water", "rent", "loan", "repay"],
  },
  {
    accent: "data",
    words: ["data", "airtime", "phone", "wifi", "internet", "cell"],
  },
  {
    accent: "study",
    words: [
      "study",
      "book",
      "course",
      "tuition",
      "school",
      "fees",
      "university",
    ],
  },
  {
    accent: "health",
    words: ["health", "medic", "clinic", "pharm", "doctor", "hospit"],
  },
  {
    accent: "social",
    words: ["social", "fun", "party", "entertain", "movie", "game", "gift"],
  },
];

let fallbackCursor = 0;

/**
 * Pick an accent key for a category.
 *
 * Positional assignment was the old behaviour and it was wrong: the third
 * seeded category landed on the same accent as Bills purely because of where it
 * sat in the array. Name matching comes first, then a round-robin that still
 * keeps neighbours apart, because the seed order interleaves the hues.
 */
export function resolveAccentKeyForCategory(
  id: string,
  name: string,
): CategoryAccentKey {
  const haystack = `${id} ${name}`.toLowerCase();

  for (const { accent, words } of KEYWORDS) {
    if (words.some((word) => haystack.includes(word))) return accent;
  }

  const accent =
    categoryAccentOrder[fallbackCursor % categoryAccentOrder.length] ?? "other";
  fallbackCursor += 1;
  return accent;
}
