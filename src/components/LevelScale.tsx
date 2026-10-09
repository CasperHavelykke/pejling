import { Pressable, StyleSheet, Text, View } from "react-native";
import { levelName } from "../domain/copy";
import { useStrings } from "../i18n";
import { colors, fonts, radius } from "../theme/tokens";

const STEPS = 5;
const BAR_WIDTH = 260;
const PILL_HEIGHT = 34;

// Skalaen under tallet: fem felter på én linje. Feltet for det niveau, der
// gælder, er en lilla pille med navnet, samme farve som knapperne, så man
// kan se, at den kan trykkes; de andre er tynde dæmpede streger. Et tryk
// på pillen meldes op, og uglen forklarer niveauet i sin boble. Ved nul
// vises intet; tallet siger det hele.
export function LevelScale({
  level,
  onPress,
}: {
  level: number;
  onPress: () => void;
}) {
  const s = useStrings();
  if (level === 0) return null;
  const name = levelName(level);
  const top = level >= STEPS;

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {Array.from({ length: STEPS }, (_, i) =>
          i + 1 === level ? (
            <Pressable
              key={i}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={name}
              accessibilityHint={s.main.showLevelHint}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              style={({ pressed }) => [
                styles.pill,
                pressed && { backgroundColor: colors.btnActive },
              ]}
            >
              <Text style={[styles.pillText, top && styles.pillTop]}>
                {name.toUpperCase()}
              </Text>
            </Pressable>
          ) : (
            <View key={i} style={styles.segment} />
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: 10 },
  bar: {
    width: BAR_WIDTH,
    height: PILL_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.divider,
  },
  pill: {
    height: PILL_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.btnBg,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    letterSpacing: 1.2,
    color: colors.btnFg,
  },
  pillTop: { fontFamily: fonts.bold },
});
