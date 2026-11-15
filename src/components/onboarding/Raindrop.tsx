import { useEffect, useState } from "react";
import { Animated, Easing, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { colors } from "../../lib/theme";

/** Flat raindrop: a square with three rounded corners, turned 45 degrees. */
export function Raindrop({ size = 72, color = colors.rain, style }: { size?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
          borderTopLeftRadius: 0,
          transform: [{ rotate: "45deg" }],
        },
        style,
      ]}
    />
  );
}

/** A drop that falls, lands with a ripple, and repeats. */
export function FallingRaindrop({ size = 56 }: { size?: number }) {
  const [fall] = useState(() => new Animated.Value(0));
  const [ripple] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fall, { toValue: 1, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(ripple, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(fall, { toValue: 2, duration: 250, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(fall, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(ripple, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fall, ripple]);

  const translateY = fall.interpolate({ inputRange: [0, 1, 2], outputRange: [-90, 40, 40] });
  const dropOpacity = fall.interpolate({ inputRange: [0, 0.2, 1, 2], outputRange: [0, 1, 1, 0] });
  const scale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.6] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.6, 0] });

  return (
    <View style={{ width: 200, height: 200, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          position: "absolute",
          top: 140,
          width: 140,
          height: 36,
          borderRadius: 70,
          borderWidth: 3,
          borderColor: colors.rain,
          opacity: rippleOpacity,
          transform: [{ scaleX: scale }, { scaleY: scale }],
        }}
      />
      <Animated.View style={{ opacity: dropOpacity, transform: [{ translateY }] }}>
        <Raindrop size={size} />
      </Animated.View>
    </View>
  );
}
