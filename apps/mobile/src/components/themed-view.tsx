import { View, type ViewProps } from 'react-native';

import { color, type ColorToken } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ColorToken;
};

export function ThemedView({ style, lightColor, darkColor, type = 'background', ...otherProps }: ThemedViewProps) {
  const scheme = useColorScheme();
  const mode = scheme === 'unspecified' ? 'light' : scheme;
  const bgColor = mode === 'dark'
    ? (darkColor ?? color.dark[type])
    : (lightColor ?? color.light[type]);

  return <View style={[{ backgroundColor: bgColor }, style]} {...otherProps} />;
}
