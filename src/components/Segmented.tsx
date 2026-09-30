import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../theme/tokens";

type Option<T extends string> = { value: T; label: string };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "small",
  background = colors.surface,
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  // small: topbaren. large: info-arket, hvor trykmålet er større.
  size?: "small" | "large";
  background?: string;
}) {
  const large = size === "large";
  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.wrap, { backgroundColor: background }]}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            // Den synlige pille er lav; hitSlop løfter trykmålet til 44 pt.
            hitSlop={{ top: 10, bottom: 10 }}
            style={({ pressed }) => [
              styles.item,
              large ? styles.itemLarge : styles.itemSmall,
              on && { backgroundColor: colors.segOn },
              !on && pressed && { backgroundColor: colors.pressTint },
            ]}
          >
            <Text
              style={[
                styles.label,
                // Fast linjehøjde med plads til underlængder som g og p.
                // Uden den skærer telefonen bunden af bogstaverne.
                large
                  ? { fontSize: 13, lineHeight: 18 }
                  : { fontSize: 12, lineHeight: 16 },
                { color: on ? colors.segOnFg : colors.muted },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 3,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.pill,
  },
  item: { borderRadius: radius.pill },
  // Lodret luft er et punkt mindre end før, fordi linjen selv er højere.
  itemSmall: { paddingVertical: 5, paddingHorizontal: 12 },
  itemLarge: { paddingVertical: 7, paddingHorizontal: 14 },
  label: { fontFamily: fonts.medium },
});
