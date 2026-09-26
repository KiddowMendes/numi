export interface Category {
  id: string;
  name: string;
  /** Hex fallback. The UI resolves the live accent by category name via
   *  `resolveAccentKeyForCategory`, so this is not what gets rendered. */
  color: string;
  /** Phosphor icon name, e.g. "ForkKnife". */
  icon: string;
  is_default: boolean;
  created_at: Date;
}
