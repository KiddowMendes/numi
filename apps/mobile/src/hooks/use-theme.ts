import { color } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const mode = scheme === 'unspecified' ? 'light' : scheme;
  return color[mode];
}
