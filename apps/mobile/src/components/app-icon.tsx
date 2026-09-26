import { View, type ViewStyle } from "react-native";

import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowsLeftRight,
  BookOpen,
  Bus,
  CalendarBlank,
  ChartPieSlice,
  Check,
  CheckCircle,
  ClockCounterClockwise,
  Coins,
  CreditCard,
  DeviceMobile,
  Drop,
  FirstAid,
  ForkKnife,
  Gear,
  Handbag,
  House,
  Lightning,
  MagnifyingGlass,
  Minus,
  Moon,
  PencilSimple,
  Phone,
  Plus,
  Prohibit,
  Receipt,
  SignOut,
  Sliders,
  Sun,
  Target,
  Trash,
  TrendDown,
  TrendUp,
  UsersThree,
  Wallet,
  Warning,
  WifiHigh,
  type Icon,
  type IconWeight,
} from "phosphor-react-native";

import { iconSize } from "@/constants/tokens";

/**
 * The app's entire icon vocabulary. Screens reference these names, never a
 * Phosphor export directly, so the library can be swapped in one file.
 *
 * Every category has a fixed icon, which is what lets the palette carry eight
 * hues without colour ever being the only signal.
 */
export const icons = {
  // navigation
  home: House,
  plan: ChartPieSlice,
  history: ClockCounterClockwise,
  settings: Gear,

  // actions
  add: Plus,
  subtract: Minus,
  remove: Minus,
  back: ArrowLeft,
  forward: ArrowRight,
  edit: PencilSimple,
  delete: Trash,
  search: MagnifyingGlass,
  sliders: Sliders,
  signOut: SignOut,

  // money direction
  moneyIn: ArrowDownLeft,
  moneyOut: ArrowUpRight,
  transfer: ArrowsLeftRight,
  trendUp: TrendUp,
  trendDown: TrendDown,
  balance: Wallet,
  coins: Coins,
  card: CreditCard,

  // categories — fixed set, one per accent
  catFood: ForkKnife,
  catTransport: Bus,
  catBills: Lightning,
  catData: WifiHigh,
  catStudy: BookOpen,
  catHealth: FirstAid,
  catSocial: UsersThree,
  catOther: Handbag,

  // state
  safe: CheckCircle,
  caution: Warning,
  alert: Prohibit,
  check: Check,

  // objects
  goal: Target,
  receipt: Receipt,
  calendar: CalendarBlank,
  water: Drop,
  phone: Phone,

  // theme
  sun: Sun,
  moon: Moon,
  device: DeviceMobile,
} as const satisfies Record<string, Icon>;

export type IconName = keyof typeof icons;

export type AppIconProps = {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
  /** Supply this for any icon that carries meaning on its own. */
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export const iconSizes = iconSize;

export function AppIcon({
  name,
  size = iconSize.md,
  color,
  weight = "regular",
  accessibilityLabel,
  style,
}: AppIconProps) {
  const Glyph = icons[name];
  if (!Glyph) return null;

  // Phosphor's IconProps carries no accessibilityLabel, so a labelled icon gets
  // a wrapping View instead. Unlabelled icons stay bare, which is also what
  // keeps decorative glyphs out of the screen-reader tree.
  const glyph = (
    <Glyph size={size} color={color} weight={weight} style={style} />
  );

  if (!accessibilityLabel) return glyph;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {glyph}
    </View>
  );
}
