import { StyleSheet, Text, View } from "react-native";
import { levelName, statusDetail, statusFor } from "../domain/copy";
import { useStrings } from "../i18n";
import { colors, fonts } from "../theme/tokens";

const STEPS = 5;
// Blokken har fast højde i alle stadier, så uglen ikke skifter størrelse,
// når den første genstand logges.
const HEIGHT = 140;

// Niveauet som overskrift: fem prikker, der fyldes med stadiet, navnet
// stort, forklaringen under, en tynd streg og til sidst tallet med sin
// enhed. Betydningen står øverst; tallet er det lille i den her udgave.
export function LevelHeadline({
  level,
  numberText,
}: {
  level: number;
  numberText: string;
}) {
  const s = useStrings();
  const title = level === 0 ? statusFor(0) : levelName(level);
  const top = level >= STEPS;

  return (
    <View style={styles.wrap}>
      <View style={styles.dots} accessibilityLabel={title}>
        {Array.from({ length: STEPS }, (_, i) => (
          <View
            key={i}
            style={[styles.dot, i + 1 <= level && styles.dotOn]}
          />
        ))}
      </View>
      {/* Lange navne ("Ingen aktive genstande") sættes mindre, så de står
          på én linje. */}
      <Text
        style={[
          styles.title,
          top && styles.titleTop,
          title.length > 14 && styles.titleLong,
        ]}
        accessibilityRole="header"
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text style={styles.detail} numberOfLines={2}>
        {level === 0 ? "" : statusDetail(level)}
      </Text>
      {/* Ved nul siger overskriften det hele. */}
      {level > 0 && (
        <>
          <View style={styles.rule} />
          <Text
            style={styles.numberLine}
            accessibilityLabel={`${s.main.about} ${numberText} ${s.main.activeLabel}`}
          >
            <Text style={styles.tilde}>~</Text>
            <Text style={styles.number}>{numberText}</Text>
            {"  "}
            {s.main.activeLabel}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", height: HEIGHT, width: 330 },
  dots: { flexDirection: "row", gap: 7, marginBottom: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
  },
  dotOn: { backgroundColor: colors.num },
  title: {
    fontFamily: fonts.medium,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.7,
    color: colors.num,
    textAlign: "center",
  },
  titleTop: { fontFamily: fonts.bold },
  titleLong: { fontSize: 24, letterSpacing: -0.3 },
  detail: {
    marginTop: 2,
    height: 38,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
    color: colors.text,
  },
  rule: {
    width: 240,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginTop: 6,
    marginBottom: 6,
  },
  numberLine: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 26,
    color: colors.muted,
  },
  tilde: { fontFamily: fonts.regular, fontSize: 16, color: colors.muted },
  number: {
    fontFamily: fonts.medium,
    fontSize: 22,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
});
