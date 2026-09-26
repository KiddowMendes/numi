import type { ReactNode } from "react";
import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

import {
  typography,
  type TextTone,
  type TypographyToken,
} from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type { TextTone };

export type ThemedTextProps = Omit<TextProps, "style"> & {
  /** A typography token. No aliases — if it is not in the scale, it is not used. */
  type?: TypographyToken;
  /** A colour role from the palette. */
  tone?: TextTone;
  align?: "left" | "center" | "right";
  uppercase?: boolean;
  /** One line, ellipsised. Use on labels that must never push a row wider. */
  truncate?: boolean;
  style?: TextStyle | TextStyle[];
  children?: ReactNode;
};

export function ThemedText({
  type = "body",
  tone = "textPrimary",
  align,
  uppercase,
  truncate,
  style,
  children,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      numberOfLines={truncate ? 1 : rest.numberOfLines}
      style={[
        typography[type] as TextStyle,
        { color: theme[tone] },
        align ? { textAlign: align } : null,
        uppercase ? styles.uppercase : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  uppercase: {
    textTransform: "uppercase",
  },
});
