import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { typography, type TypographyToken } from '@/constants/tokens';
import { useTheme } from '@/hooks/use-theme';

/** Spec types + legacy aliases */
type SpecType = TypographyToken;
type LegacyType = 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';

export type ThemedTextProps = TextProps & {
  type?: SpecType | LegacyType;
  themeColor?: 'textPrimary' | 'textSecondary' | 'textMuted' | 'primary' | 'income' | 'expense' | 'transfer' | 'textDisabled';
};

/** Map legacy type names to spec tokens */
function resolveType(type: SpecType | LegacyType): TypographyToken {
  switch (type) {
    case 'default': return 'body';
    case 'title': return 'heading1';
    case 'small': return 'caption';
    case 'smallBold': return 'label';
    case 'subtitle': return 'heading2';
    default: return type as TypographyToken;
  }
}

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const token = resolveType(type);

  return (
    <Text
      style={[
        typography[token] as TextStyle,
        { color: theme[themeColor ?? 'textPrimary'] },
        style,
      ]}
      {...rest}
    />
  );
}
