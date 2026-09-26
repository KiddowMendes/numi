import { View } from "react-native";

import { type IconName } from "@/components/app-icon";
import { PillToggle, type PillOption } from "@/components/ui/pill-toggle";
import { type CategoryAccentKey } from "@/constants/tokens";

export type CategoryOption = {
  id: string;
  label: string;
  accent: CategoryAccentKey;
  icon?: IconName;
};

export type CategoryPickerProps = {
  options: readonly CategoryOption[];
  value: string | null;
  onChange: (id: string) => void;
  label?: string;
};

const DEFAULT_ICON: Record<CategoryAccentKey, IconName> = {
  food: "catFood",
  transport: "catTransport",
  bills: "catBills",
  data: "catData",
  study: "catStudy",
  health: "catHealth",
  social: "catSocial",
  other: "catOther",
};

/**
 * Category selection. Every option carries a fixed Phosphor icon, which is
 * what lets the eight accents stay decorative — colour never has to be the only
 * thing telling two categories apart, and the pill's own fill is the single
 * `primary` tone so a selected chip can never clash with a state colour.
 */
export function CategoryPicker({
  options,
  value,
  onChange,
  label,
}: CategoryPickerProps) {
  const pills: PillOption<string>[] = options.map((option) => ({
    value: option.id,
    label: option.label,
    icon: option.icon ?? DEFAULT_ICON[option.accent],
  }));

  return (
    <View>
      <PillToggle
        options={pills}
        value={value ?? ""}
        onChange={onChange}
        label={label}
      />
    </View>
  );
}
