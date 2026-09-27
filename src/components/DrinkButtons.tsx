import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ADVANCED_GROUPS,
  SIMPLE_DRINKS,
  type DrinkDef,
} from "../domain/drinks";
import { colors, fonts, radius } from "../theme/tokens";
import { DrinkIcon, iconHeight } from "./icons";

type Props = { onAdd: (def: DrinkDef) => void };

export function SimpleButtons({ onAdd }: Props) {
  return (
    <View style={styles.simpleRow}>
      {SIMPLE_DRINKS.map((d) => (
        <Pressable
          key={d.kind}
          onPress={() => onAdd(d)}
          accessibilityRole="button"
          accessibilityLabel={`${d.name}, ${d.sub}`}
          style={({ pressed }) => [
            styles.button,
            styles.simpleButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.simpleIcon}>
            <DrinkIcon icon={d.icon} height={28} color={colors.btnFg} />
          </View>
          <Text style={styles.simpleName}>{d.label}</Text>
          <Text style={styles.sub}>{d.sub}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function AdvancedButtons({ onAdd }: Props) {
  return (
    <View style={styles.groups}>
      {ADVANCED_GROUPS.map((g) => (
        <View key={g.category}>
          <Text style={styles.kicker}>{g.title}</Text>
          <View style={styles.advRow}>
            {g.items.map((d) => (
              <Pressable
                key={d.kind}
                onPress={() => onAdd(d)}
                accessibilityRole="button"
                accessibilityLabel={`${d.name}, ${d.sub}`}
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
                    {d.label}
                  </Text>
                </View>
                <Text style={styles.sub} numberOfLines={1}>
                  {d.sub}
                </Text>
              </Pressable>
            ))}
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
  simpleRow: { flexDirection: "row", gap: 10 },
  simpleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 8,
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
    paddingHorizontal: 9,
    gap: 1,
    justifyContent: "center",
  },
  advTop: { flexDirection: "row", alignItems: "center", gap: 6 },
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
