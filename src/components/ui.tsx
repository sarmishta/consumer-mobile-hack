import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { Children, Fragment, isValidElement, useEffect, useRef } from "react";
import type { ComponentProps, ComponentRef, ReactNode } from "react";
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
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Edge } from "react-native-safe-area-context";
import { colors, fontForWeight, fonts, radius, spacing, type } from "../lib/theme";
import { StoryRing } from "./fun";
import type { TypeVariant } from "../lib/theme";

/** An SF Symbol name, e.g. "checkmark.circle.fill". */
export type SymbolName = ComponentProps<typeof SymbolView>["name"];

const WEB_ICONS: Record<string, ComponentProps<typeof Ionicons>["name"]> = {
  "bolt.fill": "flash",
  camera: "camera-outline",
  checkmark: "checkmark",
  heart: "heart-outline",
  house: "home-outline",
  message: "chatbubble-outline",
  moon: "moon-outline",
  pencil: "pencil",
  plus: "add",
  sofa: "bed-outline",
  sparkles: "sparkles",
  sunrise: "partly-sunny-outline",
  sunset: "cloudy-night-outline",
  xmark: "close",
  "bubble.left": "chatbubble-outline",
  "camera.fill": "camera",
  "checkmark.circle.fill": "checkmark-circle",
  "checkmark.seal.fill": "checkmark-done-circle",
  "chevron.left": "chevron-back",
  "chevron.right": "chevron-forward",
  "doc.on.doc": "copy-outline",
  "figure.walk": "walk",
  "gift.fill": "gift",
  "hand.raised.fill": "hand-left",
  "message.badge": "chatbubble-ellipses-outline",
  "message.fill": "chatbubble",
  "moon.fill": "moon",
  "moon.stars.fill": "moon",
  "party.popper.fill": "sparkles",
  "person.2": "people-outline",
  "person.2.fill": "people",
  "person.3": "people-outline",
  "person.3.fill": "people",
  "person.badge.plus": "person-add",
  "phone.bubble": "call",
  "photo.on.rectangle": "images",
  "play.fill": "play",
  "square.and.arrow.up": "share-outline",
  "sun.max": "sunny-outline",
  "sun.max.fill": "sunny",
};

/** SF Symbol (iOS), Ionicons on web. Renders an empty box of the same size on platforms without symbols. */
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
  if (Platform.OS === "web") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <Ionicons name={WEB_ICONS[name as string] ?? "ellipse"} size={size} color={color} />
      </View>
    );
  }
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
      style={[
        type[variant],
        { color, textAlign: align },
        weight && type[variant].fontFamily !== fonts.display ? { fontFamily: fontForWeight(weight), ...(Platform.OS === "web" ? { fontWeight: weight } : null) } : null,
        style,
      ]}
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
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    if (!scroll || !footer) return;
    const sub = Keyboard.addListener("keyboardDidShow", () => scrollRef.current?.scrollToEnd({ animated: true }));
    return () => sub.remove();
  }, [scroll, footer]);
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: background }}>
      <KeyboardAvoidingView enabled={Platform.OS !== "web"} behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {scroll ? (
            <ScrollView
              contentContainerStyle={[pad, { paddingBottom: 120 }, style]}
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentInsetAdjustmentBehavior="automatic"
            >
              {children}
            </ScrollView>
          ) : Platform.OS === "web" ? (
            <View style={[{ flex: 1 }, pad, style]}>{children}</View>
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
          <View style={styles.eyebrow}>
            <Text variant="caption" color={colors.white} weight="800" style={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
              {eyebrow}
            </Text>
          </View>
        ) : null}
        <Text variant="largeTitle">{children}</Text>
        {subtitle ? (
          <Text variant="subhead" color={colors.secondaryLabel} weight="600" style={{ marginTop: spacing.xxs }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

type ButtonVariant = "primary" | "secondary" | "plain" | "destructive";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Springy scale on press, shared by buttons and chips. */
function usePressScale(to = 0.94) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return {
    animated,
    onPressIn: () => {
      scale.set(withSpring(to, { damping: 15, stiffness: 400 }));
    },
    onPressOut: () => {
      scale.set(withSpring(1, { damping: 8, stiffness: 300 }));
    },
  };
}

/** Chunky pill button with a springy press. primary = amber fill, secondary = soft fill, plain = text only, destructive = red text. haptic adds a tap. */
export function Button({
  testID,
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  small,
  haptic,
  style,
}: {
  testID: string;
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  haptic?: boolean;
  icon?: SymbolName;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const press = usePressScale();
  const fg = {
    primary: colors.onAccent,
    secondary: colors.label,
    plain: colors.accentInk,
    destructive: colors.danger,
  }[variant];
  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={[
        styles.button,
        small && styles.buttonSmall,
        variant === "primary" && styles.buttonPrimary,
        variant === "secondary" && { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.fill },
        (disabled || loading) && { opacity: 0.4 },
        style,
        press.animated,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.buttonInner}>
          {icon ? <Icon name={icon} size={small ? 15 : 18} color={fg} weight="semibold" /> : null}
          <Text variant={small ? "subhead" : "headline"} color={fg} weight="700" style={small ? null : { fontSize: 18 }}>
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
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
        <Text variant="footnote" color={colors.label} weight="800" style={styles.sectionTitle}>
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
          <View style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}>
            <Icon name={icon} size={17} color={colors.accentDeep} weight="semibold" />
          </View>
        ) : null)}
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="600" numberOfLines={1}>
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

/** Round avatar: photo if photoUrl, else emoji, else initials. ring draws the pulsing gradient "checked in today" story ring; a custom ringColor draws a solid ring. */
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
        backgroundColor: colors.accentSoft,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={{ width: size, height: size }} />
      ) : emoji ? (
        <RNText style={{ fontSize: size * 0.5, lineHeight: size * 0.62 }}>{emoji}</RNText>
      ) : (
        <Text variant="headline" color={colors.secondaryLabel} style={{ fontSize: size * 0.38 }}>
          {initials || "?"}
        </Text>
      )}
    </View>
  );
  const thickness = Math.max(2, Math.round(size * 0.06));
  if (!ring) return <View style={{ padding: thickness * 2 }}>{inner}</View>;
  return (
    <StoryRing
      size={size}
      thickness={thickness}
      pulse={ringColor === colors.accent}
      colorsOverride={ringColor === colors.accent ? undefined : [ringColor, ringColor]}
    >
      {inner}
    </StoryRing>
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
  const press = usePressScale(0.96);
  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[styles.chip, selected && styles.chipSelected, style, press.animated]}
    >
      {emoji ? (
        <View style={[styles.chipEmoji, selected && { backgroundColor: colors.white }]}>
          <RNText style={{ fontSize: 24, lineHeight: 30 }}>{emoji}</RNText>
        </View>
      ) : null}
      {icon ? <Icon name={icon} size={20} color={selected ? colors.onAccent : colors.secondaryLabel} /> : null}
      <Text variant="headline" weight="700" color={selected ? colors.onAccent : colors.label} style={{ flex: 1, fontSize: 18 }}>
        {label}
      </Text>
      {selected ? <Icon name="checkmark.circle.fill" size={24} color={colors.onAccent} /> : null}
    </AnimatedPressable>
  );
}

/** Horizontal progress bar. value is 0..1. */
export function ProgressBar({
  value,
  color = colors.coral,
  height = 10,
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
  eyebrow: {
    alignSelf: "flex-start",
    backgroundColor: colors.label,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs + 1,
    marginBottom: spacing.xs,
    transform: [{ rotate: "-2deg" }],
  },
  largeTitle: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  button: {
    minHeight: 56,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSmall: { minHeight: 40, paddingHorizontal: spacing.lg },
  buttonPrimary: {
    backgroundColor: colors.accent,
    borderBottomWidth: 4,
    borderBottomColor: colors.accentDeep,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonInner: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.separator,
  },
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
    minHeight: 64,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.separator,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.label },
  chipEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
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
    borderWidth: 2,
    borderColor: colors.separator,
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
