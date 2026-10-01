import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ADVANCED_GROUPS,
  SIMPLE_DRINKS,
  drinkText,
  groupTitle,
  type DrinkDef,
} from "../domain/drinks";
import { useLang } from "../i18n";
import type { Entry } from "../state/usePejling";
import { colors, fonts, radius } from "../theme/tokens";
import { DrinkIcon, iconHeight } from "./icons";

type Props = { onAdd: (entry: Entry) => void };

export function SimpleButtons({ onAdd }: Props) {
  // Tegnes igen, når sproget skifter.
  useLang();
  return (
    <View style={styles.simpleRow}>
      {SIMPLE_DRINKS.map((d) => {
        const text = drinkText(d.kind);
        return (
        <Pressable
          key={d.kind}
          onPress={() => onAdd(d)}
          accessibilityRole="button"
          accessibilityLabel={`${text.name}, ${text.sub}`}
          style={({ pressed }) => [
            styles.button,
            styles.simpleButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.simpleIcon}>
            <DrinkIcon icon={d.icon} height={28} color={colors.btnFg} />
          </View>
          <Text
            style={styles.simpleName}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {text.label}
          </Text>
          <Text
            style={styles.sub}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {text.sub}
          </Text>
        </Pressable>
        );
      })}
    </View>
  );
}

export function AdvancedButtons({ onAdd }: Props) {
  useLang();
  return (
    <View style={styles.groups}>
      {ADVANCED_GROUPS.map((g) => (
        <View key={g.key}>
          <Text style={styles.kicker}>{groupTitle(g.key)}</Text>
          <View style={styles.advRow}>
            {g.items.map((d) => {
              const text = drinkText(d.kind);
              return (
              <Pressable
                key={d.kind}
                onPress={() => onAdd(d)}
                accessibilityRole="button"
                accessibilityLabel={`${text.name}, ${text.sub}`}
                style={({ pressed }) => [
                  styles.button,
                  styles.advButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.advTop}>
                  <View style={styles.advIcon}>
                    <DrinkIcon
                      icon={d.icon}
                      height={iconHeight(d.icon, 16)}
                      color={colors.btnFg}
                    />
                  </View>
                  <Text style={styles.advName} numberOfLines={1}>
                    {text.label}
                  </Text>
                </View>
                <Text style={styles.sub} numberOfLines={1}>
                  {text.sub}
                </Text>
              </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.btnBg,
    borderWidth: 1,
    borderColor: colors.btnBg,
    borderRadius: radius.button,
  },
  pressed: {
    backgroundColor: colors.btnActive,
    borderColor: colors.btnActive,
  },
  simpleRow: { flexDirection: "row", gap: 8 },
  simpleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 22,
    // Smal kant: fire knapper skal kunne stå side om side på små skærme.
    paddingHorizontal: 4,
    minWidth: 0,
    gap: 3,
  },
  simpleIcon: { marginBottom: 4 },
  simpleName: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.btnFg,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.btnSub,
  },
  groups: { gap: 10 },
  kicker: {
    fontFamily: fonts.regular,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 5,
  },
  advRow: { flexDirection: "row", gap: 6 },
  advButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingTop: 7,
    paddingBottom: 6,
    // Smal kant: rækken med drinks og vin har fire knapper, og "Stærk"
    // skal kunne stå ved siden af det brede cocktailikon.
    paddingHorizontal: 7,
    gap: 1,
    justifyContent: "center",
  },
  advTop: { flexDirection: "row", alignItems: "center", gap: 4 },
  // Fast højde: et højere ikon må ikke gøre sin knap højere end naboernes.
  advIcon: { height: 16, justifyContent: "center" },
  advName: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 16,
    color: colors.btnFg,
  },
});
