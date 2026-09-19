import { useState } from "react";
import { TextInput, type TextInputProps } from "react-native";

import { radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export function TextField({ style, onFocus, onBlur, ...rest }: TextInputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={theme.textDisabled}
      {...rest}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        {
          height: 56,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          fontFamily: "Inter",
          fontSize: 16,
          color: theme.textPrimary,
          backgroundColor: theme.surfaceRaised,
          borderColor: focused ? theme.primary : theme.border,
        },
        style,
      ]}
    />
  );
}
