// Uglens taleboble. Når teksten skifter, glider boblen til sin nye størrelse
// i stedet for at springe, så resten af skærmen følger roligt med.
//
// En usynlig kopi måler, hvor stor boblen skal være. Den synlige boble
// animerer hen til det mål, mens teksten toner ind.

import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../theme/tokens";

const DURATION = 280;

export function SpeechBubble({
  text,
  compact = false,
}: {
  text: string;
  // Mindre luft over boblen, når skærmen skal rumme mange knapper.
  compact?: boolean;
}) {
  const width = useRef(new Animated.Value(0)).current;
  const height = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const [target, setTarget] = useState<{ w: number; h: number } | null>(null);
  const measured = useRef(false);

  useEffect(() => {
    if (!measured.current) return;
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [text, fade]);

  function onMeasure(w: number, h: number) {
    if (target && Math.abs(target.w - w) < 0.5 && Math.abs(target.h - h) < 0.5) {
      return;
    }
    setTarget({ w, h });
    if (!measured.current) {
      // Første visning: ingen animation, boblen står der bare.
      measured.current = true;
      width.setValue(w);
      height.setValue(h);
      return;
    }
    Animated.parallel([
      Animated.timing(width, {
        toValue: w,
        duration: DURATION,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(height, {
        toValue: h,
        duration: DURATION,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View
        style={[styles.box, styles.measure]}
        pointerEvents="none"
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        onLayout={(e) =>
          onMeasure(e.nativeEvent.layout.width, e.nativeEvent.layout.height)
        }
      >
        <Text style={styles.text}>{text}</Text>
      </View>

      <Animated.View style={{ width, height }}>
        <View style={[StyleSheet.absoluteFill, styles.clip]}>
          {target && (
            <Animated.View
              style={[styles.box, styles.inner, { width: target.w, opacity: fade }]}
            >
              <Text style={styles.text}>{text}</Text>
            </Animated.View>
          )}
        </View>
        <View style={styles.tail} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    alignItems: "center",
    marginTop: 28,
  },
  wrapCompact: { marginTop: 14 },
  // Fælles mål for den usynlige og den synlige boble, så teksten ombrydes
  // ens i begge.
  box: {
    maxWidth: 290,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  measure: {
    position: "absolute",
    top: 0,
    opacity: 0,
  },
  clip: {
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderRadius: radius.bubble,
    borderWidth: 1,
    borderColor: colors.ringSm,
  },
  inner: {
    flexShrink: 0,
    // Rammen sidder på clip; her kompenseres der for dens ene punkt.
    margin: -1,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    color: colors.text,
  },
  tail: {
    position: "absolute",
    left: "50%",
    bottom: -5,
    marginLeft: -5,
    width: 10,
    height: 10,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.ringSm,
    transform: [{ rotate: "45deg" }],
  },
});
