import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";
import { colors, radius } from "../lib/theme";

type ButtonProps = {
  testID: string;
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  big?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ testID, label, onPress, variant = "primary", disabled, loading, big, style }: ButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        big && styles.buttonBig,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.ink : colors.text} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            big && styles.buttonTextBig,
            variant === "primary" && { color: colors.ink },
            variant === "secondary" && { color: colors.bg },
            variant === "ghost" && { color: colors.rain },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Input(props: TextInputProps & { testID: string }) {
  return (
    <TextInput
      placeholderTextColor={colors.faint}
      selectionColor={colors.amber}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function EmojiPicker({
  options,
  value,
  onChange,
  testIDPrefix,
}: {
  options: string[];
  value: string;
  onChange: (emoji: string) => void;
  testIDPrefix: string;
}) {
  return (
    <View style={styles.emojiGrid}>
      {options.map((emoji, index) => (
        <Pressable
          key={emoji}
          testID={`${testIDPrefix}-${index}`}
          accessibilityRole="button"
          accessibilityLabel={emoji}
          accessibilityState={{ selected: emoji === value }}
          onPress={() => onChange(emoji)}
          style={[styles.emojiCell, emoji === value && styles.emojiCellSelected]}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Raindrop({ size = 14, color = colors.rain, style }: { size?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderTopLeftRadius: 0,
          borderTopRightRadius: size,
          borderBottomLeftRadius: size,
          borderBottomRightRadius: size,
          transform: [{ rotate: "-45deg" }],
        },
        style,
      ]}
    />
  );
}

export const text = StyleSheet.create({
  title: { color: colors.text, fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 17, lineHeight: 24 },
  label: { color: colors.muted, fontSize: 13, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
  body: { color: colors.text, fontSize: 17 },
});

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonBig: { minHeight: 76, borderRadius: 24 },
  primary: { backgroundColor: colors.amber },
  secondary: { backgroundColor: colors.rain },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.4 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  buttonText: { fontSize: 17, fontWeight: "700" },
  buttonTextBig: { fontSize: 22, fontWeight: "800" },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: 20 },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius,
    color: colors.text,
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: colors.cardRaised,
  },
  emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  emojiCell: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  emojiCellSelected: { borderColor: colors.amber, backgroundColor: colors.cardRaised },
  emoji: { fontSize: 28 },
});
