import { useEffect, useRef, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { levelName, scalePosition } from "../domain/copy";
import { levelThresholds, type Body } from "../domain/widmark";
import { useStrings } from "../i18n";
import { mixOklch } from "../theme/color";
import { colors, fonts, radius } from "../theme/tokens";

const STEPS = 5;
const WIDTH = 280;
const STROKE = 7;
const DOT = 7;
// Hullet om prikken, ud over prikkens egen radius.
const HOLE = 3;
const R = WIDTH / 2 - DOT - 2;
const CX = WIDTH / 2;
const CY = R + DOT + 2;
// Luft mellem felterne, i grader.
const GAP_DEG = 4;
// Buen er en halvcirkel; tegningen slutter ved dens midte.
const ARC_HEIGHT = CY;
const PILL_HEIGHT = 34;

// Felternes farver, fra appens lilla til rød, som baggrunden. Den lave
// ende skal kunne ses mod den mørke baggrund, også som pille.
const SEGMENT_COLORS = Array.from({ length: STEPS }, (_, i) =>
  mixOklch("#7a5cd6", "#e04a62", i / (STEPS - 1)),
);

function point(deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) };
}

// Bue fra én vinkel til en anden, med uret over toppen (180° er venstre).
function arc(fromDeg: number, toDeg: number): string {
  const a = point(fromDeg);
  const b = point(toDeg);
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)} A${R} ${R} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

const STEP_POINTS = Array.from({ length: 41 }, (_, i) => i / 40);

// Måleren om tallet: en halv bue i fem felter fra lilla til rød, en prik,
// der viser hvor tallet ligger, og niveauets navn i en pille i feltets
// farve. Tallet, dets tekst og pillen ligger inde i buen, og pillen
// sidder på buens grundlinje, så måleren ikke bliver højere af den. Et
// tryk på pillen meldes op, og uglen forklarer niveauet i sin boble.
export function LevelGauge({
  level,
  active,
  body,
  background,
  onPress,
  children,
}: {
  level: number;
  active: number;
  body: Body;
  // Skærmens baggrundsfarve, animeret. Prikkens kant får samme farve, så
  // den ser ud til at skære et hul i buen.
  background: Animated.AnimatedInterpolation<string>;
  onPress: () => void;
  children: ReactNode;
}) {
  const s = useStrings();
  const position = scalePosition(active, levelThresholds(body));
  const pos = useRef(new Animated.Value(position)).current;
  useEffect(() => {
    Animated.timing(pos, {
      toValue: position,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pos, position]);
  // Prikken følger buen: vinklen går fra 180° (venstre) til 0° (højre).
  // Den er en almindelig View oven på tegningen, så den kan animeres ens
  // på alle platforme. Hullet er en cirkel i baggrundens farve med prikken
  // inden i; en kant på prikken ville lade en tynd stribe af fyldet titte
  // frem på telefonen.
  const dotX = pos.interpolate({
    inputRange: STEP_POINTS,
    outputRange: STEP_POINTS.map((p) => point(180 - p * 180).x - DOT - HOLE),
  });
  const dotY = pos.interpolate({
    inputRange: STEP_POINTS,
    outputRange: STEP_POINTS.map((p) => point(180 - p * 180).y - DOT - HOLE),
  });
  const name = level === 0 ? "" : levelName(level);
  const top = level >= STEPS;
  // Pillen får samme farve som det felt, prikken står i.
  const pillColor = SEGMENT_COLORS[Math.min(level, STEPS) - 1];

  return (
    <View style={styles.wrap}>
      <View style={styles.arcBox}>
        <Svg width={WIDTH} height={ARC_HEIGHT} style={styles.svg}>
          {SEGMENT_COLORS.map((color, i) => {
            const from = 180 - (i * 180) / STEPS - (i === 0 ? 0 : GAP_DEG / 2);
            const to =
              180 - ((i + 1) * 180) / STEPS + (i === STEPS - 1 ? 0 : GAP_DEG / 2);
            return (
              // Felter over niveauet er et neutralt spor; farven kommer,
              // når man når dem.
              <Path
                key={i}
                d={arc(from, to)}
                stroke={i + 1 <= level ? color : colors.divider}
                strokeWidth={STROKE}
                strokeLinecap="round"
                fill="none"
              />
            );
          })}
        </Svg>
        {level > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.hole,
              {
                backgroundColor: background,
                transform: [{ translateX: dotX }, { translateY: dotY }],
              },
            ]}
          >
            <View style={styles.dot} />
          </Animated.View>
        )}
        <View style={styles.inner}>
          {children}
          {level > 0 ? (
            <Pressable
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={name}
              accessibilityHint={s.main.showLevelHint}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [
                styles.pill,
                { backgroundColor: pillColor },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.pillText, top && styles.pillTop]}>
                {name.toUpperCase()}
              </Text>
            </Pressable>
          ) : (
            <View style={[styles.pill, styles.pillHidden]} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  // Pillen rager en halv højde ned under buens grundlinje.
  arcBox: {
    width: WIDTH,
    height: ARC_HEIGHT + PILL_HEIGHT / 2,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  svg: { position: "absolute", top: 0, left: 0 },
  hole: {
    position: "absolute",
    top: 0,
    left: 0,
    width: (DOT + HOLE) * 2,
    height: (DOT + HOLE) * 2,
    borderRadius: DOT + HOLE,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: DOT * 2,
    height: DOT * 2,
    borderRadius: DOT,
    backgroundColor: colors.num,
  },
  inner: { alignItems: "center", gap: 6 },
  pill: {
    height: PILL_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: radius.pill,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    letterSpacing: 1.2,
    color: colors.btnFg,
  },
  pillTop: { fontFamily: fonts.bold },
  // Ved nul holdes pladsen, men intet vises.
  pillHidden: { opacity: 0 },
});
