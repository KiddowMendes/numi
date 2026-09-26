import { forwardRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import {
  radius,
  spacing,
  typography,
  type TypographyToken,
} from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type TextFieldProps = Omit<TextInputProps, "style"> & {
  label?: string;
  hint?: string;
  error?: string;
  /** Right-aligned adornment, e.g. a unit or a clear button. */
  adornment?: React.ReactNode;
  inputType?: TypographyToken;
  containerStyle?: ViewStyle;
};

export const TextField = forwardRef<
  React.ComponentRef<typeof TextInput>,
  TextFieldProps
>(
  (
    {
      label,
      hint,
      error,
      adornment,
      inputType = "body",
      containerStyle,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? theme.stateAlert
      : focused
        ? theme.primary
        : theme.border;
    const message = error ?? hint;

    return (
      <View style={containerStyle}>
        {label ? (
          <ThemedText type="label" tone="textSecondary" style={styles.label}>
            {label}
          </ThemedText>
        ) : null}

        <View
          style={[
            styles.field,
            { borderColor, backgroundColor: theme.surface },
          ]}
        >
          <TextInput
            ref={ref}
            accessibilityLabel={label}
            placeholderTextColor={theme.textDisabled}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            style={[
              styles.input,
              typography[inputType],
              { color: theme.textPrimary },
            ]}
            {...rest}
          />
          {adornment ? <View style={styles.adornment}>{adornment}</View> : null}
        </View>

        {message ? (
          <ThemedText
            type="caption"
            tone={error ? "stateAlert" : "textMuted"}
            style={styles.message}
          >
            {message}
          </ThemedText>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = "TextField";

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  adornment: {
    marginLeft: spacing.sm,
  },
  message: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
