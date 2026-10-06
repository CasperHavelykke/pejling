import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { levelName, statusDetail } from "../domain/copy";
import { useStrings } from "../i18n";
import { LEVEL_STEPS } from "../theme/levels";
import { colors, fonts, radius } from "../theme/tokens";

const BAR_WIDTH = 220;
const PILL_HEIGHT = 24;

// Så længe står forklaringen fremme efter et tryk på pillen.
const DETAIL_MS = 5000;

// Skalaen under tallet: fem felter i niveauernes farver på én linje. Feltet
// for det niveau, der gælder, er en pille med navnet; de andre er tynde
// streger. Et tryk på pillen viser forklaringen under skalaen i nogle
// sekunder. Ved nul vises intet; tallet siger det hele.
export function LevelScale({ level }: { level: number }) {
  const s = useStrings();
  const [showDetail, setShowDetail] = useState(false);
  useEffect(() => {
    if (!showDetail) return;
    const timer = setTimeout(() => setShowDetail(false), DETAIL_MS);
    return () => clearTimeout(timer);
  }, [showDetail, level]);
  if (level === 0) return null;
  const name = levelName(level);
  const top = level >= LEVEL_STEPS.length;

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {LEVEL_STEPS.map((step, i) =>
          i + 1 === level ? (
            <Pressable
              key={i}
              onPress={() => setShowDetail((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={name}
              accessibilityHint={s.main.showLevelHint}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              style={({ pressed }) => [
                styles.pill,
                { backgroundColor: step.fill },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: step.ink },
                  top && styles.pillTop,
                ]}
              >
                {name.toUpperCase()}
              </Text>
            </Pressable>
          ) : (
            <View
              key={i}
              style={[
                styles.segment,
                { backgroundColor: step.fill },
                i + 1 > level && styles.segmentAhead,
              ]}
            />
          ),
        )}
      </View>
      {showDetail && (
        <Text style={styles.detail} accessibilityLiveRegion="polite">
          {statusDetail(level)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: 8 },
  bar: {
    width: BAR_WIDTH,
    height: PILL_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  segmentAhead: { opacity: 0.3 },
  pill: {
    height: PILL_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1,
  },
  pillTop: { fontFamily: fonts.bold },
  detail: {
    marginTop: 6,
    maxWidth: 300,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
    color: colors.muted,
  },
});
