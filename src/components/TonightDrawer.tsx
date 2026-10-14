import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { drinkName, type DrinkLog } from "../domain/drinks";
import {
  entryWord,
  genstandWord,
  hhmm,
  unitsX10Label,
} from "../domain/format";
import { useStrings } from "../i18n";
import { colors, fonts, radius, space } from "../theme/tokens";
import { BottomPanel } from "./BottomPanel";

export function TonightDrawer({
  open,
  onClose,
  drinks,
  totalX10,
  activeUnits,
  soberLine,
  bottomInset,
  onUndo,
  onClear,
  onHistory,
}: {
  open: boolean;
  onClose: () => void;
  // Nyeste øverst.
  drinks: readonly DrinkLog[];
  totalX10: number;
  // Genstande, der stadig er aktive; resten af aftenens er forbrændt.
  activeUnits: number;
  soberLine: string;
  bottomInset: number;
  onUndo: (id: number) => void;
  onClear: () => void;
  onHistory: () => void;
}) {
  // Listen ruller kun, når den er længere end pladsen. Ellers ejer
  // trækket hele panelet. Er listen rullet ned, skal den rulle op igen,
  // før et træk lukker panelet.
  const s = useStrings();
  const scrollY = useRef(0);
  const [listHeight, setListHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const scrollable = contentHeight > listHeight + 1;
  // Bjælken: hele bredden er aftenens genstande, den fyldte del er
  // forbrændt. Den fylder op fra venstre, som timerne går.
  const total = totalX10 / 10;
  const active = Math.min(total, Math.max(0, activeUnits));
  const burned = Math.max(0, total - active);
  const burnedPct = total > 0 ? (burned / total) * 100 : 0;
  // Fyldet glider til sin nye længde, når en genstand fortrydes eller
  // logges, i stedet for at hoppe.
  const fillPct = useRef(new Animated.Value(burnedPct)).current;
  useEffect(() => {
    Animated.timing(fillPct, {
      toValue: burnedPct,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [burnedPct, fillPct]);
  const fillWidth = fillPct.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });
  // Rækkerne under glider på plads, når en forsvinder.
  const animateList = () =>
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  // Rydning kan ikke fortrydes, så der spørges først. Browseren har ikke
  // Alert, så der bruges dens egen dialog.
  const confirmClear = () => {
    const title = s.drawer.clearTitle(drinks.length);
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n${s.drawer.clearBody}`)) {
        animateList();
        onClear();
      }
      return;
    }
    Alert.alert(title, s.drawer.clearBody, [
      { text: s.drawer.cancel, style: "cancel" },
      {
        text: s.drawer.clear,
        style: "destructive",
        onPress: () => {
          animateList();
          onClear();
        },
      },
    ]);
  };

  return (
    <BottomPanel
      open={open}
      onClose={onClose}
      draggable
      canStartDrag={() => !scrollable || scrollY.current <= 0}
      style={[styles.panel, { paddingBottom: bottomInset }]}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={s.drawer.close}
        style={styles.handle}
      >
        <View style={styles.bar} />
      </Pressable>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{s.drawer.title}</Text>
        {drinks.length > 0 && (
          <Text style={styles.total} numberOfLines={1}>
            {drinks.length} {entryWord(drinks.length)} ·{" "}
            {unitsX10Label(totalX10)} {genstandWord(totalX10 / 10)}
          </Text>
        )}
        {drinks.length > 0 && (
          <Pressable
            onPress={confirmClear}
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            style={({ pressed }) => [
              styles.clear,
              pressed && { backgroundColor: colors.accentTint },
            ]}
          >
            <Text style={styles.clearText}>{s.drawer.clear}</Text>
          </Pressable>
        )}
      </View>

      {drinks.length > 0 && (
        <View
          style={styles.progress}
          accessibilityRole="progressbar"
          accessibilityLabel={s.drawer.barLabel(
            unitsX10Label(Math.round(burned * 10)),
            unitsX10Label(Math.round(active * 10)),
          )}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(burnedPct) }}
        >
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width: fillWidth }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {s.drawer.burned}{" "}
              <Text style={styles.progressNum}>
                {unitsX10Label(Math.round(burned * 10))}
              </Text>
            </Text>
            <Text style={styles.progressText}>
              {s.drawer.active}{" "}
              <Text style={styles.progressNum}>
                {unitsX10Label(Math.round(active * 10))}
              </Text>
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.list}
        scrollEnabled={scrollable}
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(_w, h) => setContentHeight(h)}
      >
        {drinks.length === 0 ? (
          <Text style={styles.empty}>{s.drawer.empty}</Text>
        ) : (
          drinks.map((d) => (
            <View key={d.id} style={styles.row}>
              <Text style={styles.time} numberOfLines={1}>
                {hhmm(d.t)}
              </Text>
              <Text style={styles.name} numberOfLines={1}>
                {drinkName(d.kind)}
              </Text>
              <Text style={styles.units}>
                {unitsX10Label(d.unitsX10)} {s.unitShort}
              </Text>
              <Pressable
                onPress={() => {
                  animateList();
                  onUndo(d.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={s.drawer.undoLabel(
                  drinkName(d.kind),
                  hhmm(d.t),
                )}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                style={({ pressed }) => [
                  styles.undo,
                  pressed && { backgroundColor: colors.accentTint },
                ]}
              >
                <Text style={styles.undoText}>{s.drawer.undo}</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.sober}>{soberLine}</Text>
        <Pressable
          onPress={onHistory}
          accessibilityRole="link"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          style={({ pressed }) => [
            styles.history,
            pressed && { backgroundColor: colors.accentTint },
          ]}
        >
          <Text style={styles.historyText}>{s.drawer.history}</Text>
        </Pressable>
      </View>
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
    paddingTop: 10,
    paddingBottom: 12,
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
  total: {
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  clear: {
    marginLeft: "auto",
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginRight: -6,
    borderRadius: radius.ghost,
  },
  clearText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.accentText,
  },
  progress: { marginTop: 12, gap: 6 },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.num,
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  progressNum: { fontFamily: fonts.medium, color: colors.text },
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
  // Mindste bredde, så navnene står lige; vokser med større skrift i
  // stedet for at ombryde.
  time: {
    minWidth: 44,
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 14,
  },
  sober: {
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  history: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginRight: -6,
    borderRadius: radius.ghost,
  },
  historyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.accentText,
  },
});
