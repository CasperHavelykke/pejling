import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chevron } from "../components/Chevron";
import { AdvancedButtons, SimpleButtons } from "../components/DrinkButtons";
import { InfoSheet } from "../components/InfoSheet";
import { Owl } from "../components/Owl";
import { Segmented } from "../components/Segmented";
import { SpeechBubble } from "../components/SpeechBubble";
import { TonightDrawer } from "../components/TonightDrawer";
import { STATUS, roastFor } from "../domain/copy";
import { daWhole, hhmm, soberLine, unitsX10Label } from "../domain/format";
import { usePejling, type Mode } from "../state/usePejling";
import { mixOklch } from "../theme/color";
import { colors, fonts, radius, space } from "../theme/tokens";

const MODE_OPTIONS = [
  { value: "simple", label: "Simpel" },
  { value: "advanced", label: "Avanceret" },
] as const;

// Baggrunden glider mod rød: ved fuldt udslag er 85 % af farven rød.
function useBackground(t: number) {
  const target = useMemo(
    () => mixOklch(colors.bg, colors.red, Math.round(t * 85) / 100),
    [t],
  );
  const [pair, setPair] = useState({ from: target, to: target });
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    progress.setValue(0);
    setPair((prev) => ({ from: prev.to, to: target }));
    Animated.timing(progress, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [target, progress]);

  return progress.interpolate({
    inputRange: [0, 1],
    outputRange: [pair.from, pair.to],
  });
}

export default function PejlingScreen() {
  const insets = useSafeAreaInsets();
  const p = usePejling();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const background = useBackground(p.t);

  const sober = soberLine(p.minutesToZero);
  const summary =
    p.tonight.length > 0
      ? `${unitsX10Label(p.totalX10)} genstande i aften · seneste ${hhmm(p.tonight[0].t)}`
      : "Ingen genstande endnu";
  const advanced = p.mode === "advanced";

  if (!p.ready) {
    return <View style={[styles.root, { backgroundColor: colors.bg }]} />;
  }

  return (
    <Animated.View style={[styles.root, { backgroundColor: background }]}>
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom, 12) + 6,
          },
        ]}
      >
        <View style={styles.topbar}>
          <View style={styles.topSide}>
            <Text style={styles.brand} accessibilityRole="header">
              Pejling
            </Text>
          </View>
          <Segmented<Mode>
            options={MODE_OPTIONS}
            value={p.mode}
            onChange={p.setMode}
          />
          <View style={[styles.topSide, styles.topRight]}>
            <Pressable
              onPress={() => setInfoOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Om Pejling og dine indstillinger"
              hitSlop={8}
              style={({ pressed }) => [
                styles.info,
                pressed && { backgroundColor: colors.pressTint },
              ]}
            >
              <Text style={styles.infoText}>i</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.middle}
          contentContainerStyle={styles.middleContent}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
        >
          <SpeechBubble
            text={roastFor(p.level, p.tonight.length)}
            compact={advanced}
          />

          {/* I Avanceret fylder knapperne tre rækker. Ugle og luft er gjort
              mindre, så linjen over knapperne ikke bliver skåret af på
              små skærme. */}
          <View style={{ marginTop: advanced ? 6 : 22 }}>
            <Owl t={p.t} scale={advanced ? 0.6 : 1.35} />
          </View>

          <View style={[styles.numberBlock, advanced && { marginTop: 12 }]}>
            <Text
              style={styles.number}
              accessibilityLabel={`${daWhole(p.active)} aktive genstande`}
            >
              {daWhole(p.active)}
            </Text>
            <Text style={styles.numberLabel}>aktive genstande</Text>
            <StatusLine level={p.level} />
          </View>

          <View style={styles.spacer} />

          {/* Tom ved nul, men linjen beholder sin plads, så knapperne
              ikke flytter sig ved første tryk. */}
          <Text style={styles.sober}>{sober || " "}</Text>
        </ScrollView>

        {advanced ? (
          <AdvancedButtons onAdd={p.add} />
        ) : (
          <SimpleButtons onAdd={p.add} />
        )}

        <Pressable
          onPress={() => setDrawerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`${summary}. Vis listen`}
          style={({ pressed }) => [
            styles.handle,
            pressed && { backgroundColor: colors.pressTint },
          ]}
        >
          <Chevron direction="up" />
          <Text style={styles.handleText}>{summary}</Text>
        </Pressable>
      </View>

      <TonightDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        drinks={p.tonight}
        totalX10={p.totalX10}
        soberLine={sober}
        bottomInset={Math.max(insets.bottom, 12) + 10}
        onUndo={p.remove}
        onHistory={() => {
          setDrawerOpen(false);
          router.push("/historik");
        }}
      />

      <InfoSheet
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        weightKg={p.weightKg}
        sex={p.sex}
        bottomInset={Math.max(insets.bottom, 12) + 28}
        onWeight={p.setWeight}
        onSex={p.setSex}
      />
    </Animated.View>
  );
}

// På det højeste trin står "TAG HJEM" med store bogstaver og fed skrift.
// Resten af linjen er uændret.
function StatusLine({ level }: { level: number }) {
  const text = STATUS[level];
  const split = text.indexOf(" – ");
  if (level < STATUS.length - 1 || split === -1) {
    return <Text style={styles.status}>{text}</Text>;
  }
  return (
    <Text style={styles.status} accessibilityLabel={text}>
      <Text style={styles.statusAlarm}>
        {text.slice(0, split).toUpperCase()}
      </Text>
      {text.slice(split)}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  screen: { flex: 1, paddingHorizontal: space.side },
  topbar: { flexDirection: "row", alignItems: "center", gap: 10 },
  topSide: { flex: 1 },
  topRight: { alignItems: "flex-end" },
  brand: {
    fontFamily: fonts.wordmark,
    fontSize: 20,
    letterSpacing: -0.2,
    color: colors.text,
  },
  info: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontFamily: fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 13,
    color: colors.muted,
  },
  middle: { flex: 1 },
  middleContent: { flexGrow: 1, alignItems: "center" },
  numberBlock: { alignItems: "center", marginTop: 22, gap: 4 },
  number: {
    fontFamily: fonts.medium,
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -2.88,
    color: colors.num,
    fontVariant: ["tabular-nums"],
  },
  numberLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  status: {
    marginTop: 8,
    maxWidth: 300,
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 22,
    textAlign: "center",
    color: colors.text,
  },
  statusAlarm: { fontFamily: fonts.bold, letterSpacing: 0.5 },
  spacer: { flex: 1, minHeight: 12 },
  sober: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
    marginBottom: 14,
  },
  handle: {
    alignSelf: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 16,
    minHeight: 44,
    borderRadius: radius.control,
  },
  handleText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
});
