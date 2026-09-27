import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { drinkName, type DrinkLog } from "../domain/drinks";
import { genstandWord, hhmm, unitsX10Label } from "../domain/format";
import { colors, fonts, radius, space } from "../theme/tokens";
import { BottomPanel } from "./BottomPanel";
import { Chevron } from "./Chevron";

export function TonightDrawer({
  open,
  onClose,
  drinks,
  totalX10,
  soberLine,
  bottomInset,
  onUndo,
}: {
  open: boolean;
  onClose: () => void;
  // Nyeste øverst.
  drinks: readonly DrinkLog[];
  totalX10: number;
  soberLine: string;
  bottomInset: number;
  onUndo: (id: number) => void;
}) {
  return (
    <BottomPanel
      open={open}
      onClose={onClose}
      style={[styles.panel, { paddingBottom: bottomInset }]}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Luk listen"
        style={styles.handle}
      >
        <View style={styles.bar} />
        <Chevron direction="down" />
      </Pressable>

      <View style={styles.titleRow}>
        <Text style={styles.title}>I aften</Text>
        {drinks.length > 0 && (
          <Text style={styles.total}>
            {drinks.length} {genstandWord(drinks.length)} ·{" "}
            {unitsX10Label(totalX10)} gs.
          </Text>
        )}
      </View>

      <ScrollView style={styles.list} alwaysBounceVertical={false}>
        {drinks.length === 0 ? (
          <Text style={styles.empty}>Ingen genstande endnu.</Text>
        ) : (
          drinks.map((d) => (
            <View key={d.id} style={styles.row}>
              <Text style={styles.time}>{hhmm(d.t)}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {drinkName(d.kind)}
              </Text>
              <Text style={styles.units}>{unitsX10Label(d.unitsX10)} gs.</Text>
              <Pressable
                onPress={() => onUndo(d.id)}
                accessibilityRole="button"
                accessibilityLabel={`Fortryd ${drinkName(d.kind)} klokken ${hhmm(d.t)}`}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                style={({ pressed }) => [
                  styles.undo,
                  pressed && { backgroundColor: colors.accentTint },
                ]}
              >
                <Text style={styles.undoText}>Fortryd</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <Text style={styles.sober}>{soberLine}</Text>
    </BottomPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    maxHeight: "70%",
    paddingHorizontal: space.side,
    borderTopLeftRadius: radius.drawer,
    borderTopRightRadius: radius.drawer,
    borderBottomWidth: 0,
  },
  handle: {
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
    paddingBottom: 6,
  },
  bar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
  },
  title: { fontFamily: fonts.medium, fontSize: 18, color: colors.text },
  total: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  list: { marginTop: 8, flexGrow: 0 },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  time: {
    width: 44,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    fontVariant: ["tabular-nums"],
  },
  name: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  units: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  undo: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: radius.ghost,
  },
  undoText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.accentText,
  },
  sober: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 14,
  },
});
