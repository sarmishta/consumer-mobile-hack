import { BlurView } from "expo-blur";
import { SymbolView } from "expo-symbols";
import { Children, Fragment, isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text as RNText,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Edge } from "react-native-safe-area-context";
import { colors, radius, spacing, type } from "../lib/theme";
import type { TypeVariant } from "../lib/theme";

/** An SF Symbol name, e.g. "checkmark.circle.fill". */
export type SymbolName = ComponentProps<typeof SymbolView>["name"];

/** SF Symbol (iOS). Renders an empty box of the same size on platforms without symbols. */
export function Icon({
  name,
  size = 22,
  color = colors.label,
  weight = "regular",
  style,
}: {
  name: SymbolName;
  size?: number;
  color?: string;
  weight?: ComponentProps<typeof SymbolView>["weight"];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight={weight}
      style={[{ width: size, height: size }, style]}
      fallback={<View style={{ width: size, height: size }} />}
    />
  );
}

/** Text in one of the theme type variants. Defaults to body / label color. */
export function Text({
  variant = "body",
  color = colors.label,
  align,
  weight,
  numberOfLines,
  style,
  children,
}: {
  variant?: TypeVariant;
  color?: string;
  align?: TextStyle["textAlign"];
  weight?: TextStyle["fontWeight"];
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
}) {
  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[type[variant], { color, textAlign: align }, weight ? { fontWeight: weight } : null, style]}
    >
      {children}
    </RNText>
  );
}

/** Full screen with safe area and grouped background. scroll wraps content in a ScrollView. */
export function Screen({
  children,
  scroll,
  padded = true,
  edges = ["top", "left", "right"],
  background = colors.bg,
  footer,
  style,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  background?: string;
  /** Pinned bottom content (e.g. a primary Button), rendered in a BlurBar. */
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const pad = padded ? { paddingHorizontal: spacing.lg } : null;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: background }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {scroll ? (
            <ScrollView
              contentContainerStyle={[pad, { paddingBottom: 120 }, style]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentInsetAdjustmentBehavior="automatic"
            >
              {children}
            </ScrollView>
          ) : (
            <Pressable accessible={false} onPress={Keyboard.dismiss} style={[{ flex: 1 }, pad, style]}>
              {children}
            </Pressable>
          )}
          {footer ? <BlurBar>{footer}</BlurBar> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** iOS large title with optional subtitle line above it (e.g. the date) and a trailing accessory. */
export function LargeTitle({
  children,
  eyebrow,
  subtitle,
  right,
}: {
  children: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.largeTitle}>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Text variant="footnote" color={colors.secondaryLabel} weight="600" style={{ textTransform: "uppercase" }}>
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="largeTitle">{children}</Text>
        {subtitle ? (
          <Text variant="subhead" color={colors.secondaryLabel} style={{ marginTop: spacing.xs }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

type ButtonVariant = "primary" | "secondary" | "plain" | "destructive";

/** Pill button. primary = amber fill, secondary = gray fill, plain = text only, destructive = red text. */
export function Button({
  testID,
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  small,
  style,
}: {
  testID: string;
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: SymbolName;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const fg = {
    primary: colors.onAccent,
    secondary: colors.label,
    plain: colors.accentInk,
    destructive: colors.danger,
  }[variant];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        variant === "primary" && { backgroundColor: colors.accent },
        variant === "secondary" && { backgroundColor: colors.fill },
        (disabled || loading) && { opacity: 0.4 },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.buttonInner}>
          {icon ? <Icon name={icon} size={small ? 15 : 18} color={fg} weight="semibold" /> : null}
          <Text variant={small ? "subhead" : "headline"} color={fg} weight="600">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** White rounded surface. */
export function Card({
  children,
  padded = true,
  style,
}: {
  children: ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, padded && { padding: spacing.lg }, style]}>{children}</View>;
}

/** Inset-grouped list section. Children (usually Row) get hairline separators between them. */
export function Section({
  title,
  footer,
  children,
  style,
}: {
  title?: string;
  footer?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[{ marginTop: spacing.xxl }, style]}>
      {title ? (
        <Text variant="footnote" color={colors.secondaryLabel} style={styles.sectionTitle}>
          {title.toUpperCase()}
        </Text>
      ) : null}
      <View style={styles.card}>
        {items.map((item, i) => (
          <Fragment key={item.key ?? i}>
            {i > 0 ? <View style={styles.separator} /> : null}
            {item}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <Text variant="footnote" color={colors.secondaryLabel} style={styles.sectionFooter}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

/** List row for a Section. Pass onPress (and testID) to make it tappable with a chevron. */
export function Row({
  testID,
  title,
  subtitle,
  icon,
  iconColor = colors.accent,
  left,
  value,
  right,
  onPress,
  chevron = !!onPress,
}: {
  testID?: string;
  title: string;
  subtitle?: string;
  /** SF Symbol shown in a rounded colored tile, like Settings. */
  icon?: SymbolName;
  iconColor?: string;
  /** Custom leading element (e.g. Avatar). Overrides icon. */
  left?: ReactNode;
  /** Trailing secondary text. */
  value?: string;
  /** Custom trailing element. */
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
}) {
  return (
    <Pressable
      testID={testID}
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfacePressed }]}
    >
      {left ??
        (icon ? (
          <View style={[styles.rowIcon, { backgroundColor: iconColor }]}>
            <Icon name={icon} size={17} color={colors.white} weight="semibold" />
          </View>
        ) : null)}
      <View style={{ flex: 1 }}>
        <Text variant="body" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color={colors.secondaryLabel} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="body" color={colors.secondaryLabel}>
          {value}
        </Text>
      ) : null}
      {right}
      {chevron ? <Icon name="chevron.right" size={14} color={colors.tertiaryLabel} weight="semibold" /> : null}
    </Pressable>
  );
}

/** Round avatar: photo if photoUrl, else emoji, else initials. ring draws the amber "checked in today" story ring. */
export function Avatar({
  name,
  photoUrl,
  emoji,
  size = 44,
  ring,
  ringColor = colors.accent,
}: {
  name: string;
  photoUrl?: string | null;
  emoji?: string | null;
  size?: number;
  ring?: boolean;
  ringColor?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const inner = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.fill,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={{ width: size, height: size }} />
      ) : emoji ? (
        <RNText style={{ fontSize: size * 0.5 }}>{emoji}</RNText>
      ) : (
        <Text variant="headline" color={colors.secondaryLabel} style={{ fontSize: size * 0.38 }}>
          {initials || "?"}
        </Text>
      )}
    </View>
  );
  const gap = Math.max(2, Math.round(size * 0.06));
  return (
    <View
      style={{
        padding: gap,
        borderRadius: size,
        borderWidth: gap,
        borderColor: ring ? ringColor : "transparent",
      }}
    >
      {inner}
    </View>
  );
}

/** Big tappable answer chip for quizzes and pickers. */
export function Chip({
  testID,
  label,
  emoji,
  icon,
  selected,
  onPress,
  style,
}: {
  testID: string;
  label: string;
  emoji?: string;
  icon?: SymbolName;
  selected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: colors.accentSoft, borderColor: colors.accent },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      {emoji ? <RNText style={{ fontSize: 22 }}>{emoji}</RNText> : null}
      {icon ? <Icon name={icon} size={20} color={selected ? colors.accentInk : colors.secondaryLabel} /> : null}
      <Text variant="headline" color={selected ? colors.accentInk : colors.label}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Horizontal progress bar. value is 0..1. */
export function ProgressBar({
  value,
  color = colors.accent,
  height = 6,
  style,
}: {
  value: number;
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={[{ height, borderRadius: height, backgroundColor: colors.fill, overflow: "hidden" }, style]}>
      <View style={{ width: `${pct}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

const PLACEHOLDER_TINTS = {
  neutral: [colors.fill, colors.tertiaryLabel],
  amber: [colors.accentSoft, colors.accentInk],
  rain: [colors.rainSoft, colors.rain],
  coral: [colors.coralSoft, colors.coral],
} as const;

/** Flat block where a photo would go: soft tint, centered SF Symbol, optional caption. */
export function Placeholder({
  height = 160,
  icon = "photo",
  label,
  tint = "neutral",
  style,
}: {
  height?: number;
  icon?: SymbolName;
  label?: string;
  tint?: keyof typeof PLACEHOLDER_TINTS;
  style?: StyleProp<ViewStyle>;
}) {
  const [bg, fg] = PLACEHOLDER_TINTS[tint];
  return (
    <View style={[styles.placeholder, { height, backgroundColor: bg }, style]}>
      <Icon name={icon} size={Math.min(44, height * 0.3)} color={fg} />
      {label ? (
        <Text variant="footnote" color={fg} weight="600" style={{ marginTop: spacing.sm }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

/** Translucent bottom bar (expo-blur) for pinned actions. Screen's footer prop uses it. */
export function BlurBar({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <BlurView intensity={80} tint="systemChromeMaterialLight" style={[styles.blurBar, style]}>
      {children}
    </BlurView>
  );
}

/** Text field on a white rounded surface. testID required. */
export function Input({ style, ...props }: TextInputProps & { testID: string }) {
  return (
    <TextInput
      placeholderTextColor={colors.tertiaryLabel}
      {...props}
      style={[styles.input, style]}
    />
  );
}

/** Grid of emoji choices. testIDs are `${testIDPrefix}-${index}`. */
export function EmojiPicker({
  options,
  value,
  onChange,
  testIDPrefix,
}: {
  options: string[];
  value: string | null;
  onChange: (emoji: string) => void;
  testIDPrefix: string;
}) {
  return (
    <View style={styles.emojiGrid}>
      {options.map((emoji, i) => (
        <Pressable
          key={emoji}
          testID={`${testIDPrefix}-${i}`}
          accessibilityRole="button"
          accessibilityLabel={emoji}
          onPress={() => onChange(emoji)}
          style={[styles.emojiCell, value === emoji && { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
        >
          <RNText style={{ fontSize: 28 }}>{emoji}</RNText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  largeTitle: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  button: {
    minHeight: 50,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSmall: { minHeight: 36, paddingHorizontal: spacing.lg },
  buttonInner: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: "hidden" },
  sectionTitle: { marginLeft: spacing.lg, marginBottom: spacing.sm },
  sectionFooter: { marginHorizontal: spacing.lg, marginTop: spacing.sm },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 44,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  rowIcon: { width: 29, height: 29, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: colors.surface,
  },
  placeholder: { borderRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  blurBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  input: {
    ...type.body,
    color: colors.label,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  emojiCell: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: "transparent",
  },
});
