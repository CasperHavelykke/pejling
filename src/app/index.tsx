import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chevron } from "../components/Chevron";
import { DrinkPager } from "../components/DrinkPager";
import { InfoSheet } from "../components/InfoSheet";
import { Owl } from "../components/Owl";
import { SpeechBubble } from "../components/SpeechBubble";
import { TonightDrawer } from "../components/TonightDrawer";
import { roastFor, statusFor } from "../domain/copy";
import { daWhole, hhmm, soberLine, unitsX10Label } from "../domain/format";
import { setLang, useStrings, type Lang } from "../i18n";
import { usePejling, type Mode } from "../state/usePejling";
import { saveSetting } from "../storage/store";
import { mixOklch } from "../theme/color";
import { colors, fonts, radius, space } from "../theme/tokens";

// Knappanelerne i den rækkefølge, de swipes i.
const PAGES: readonly Mode[] = ["simple", "advanced"];

// Uglens højde i punkter ved skala 1.
const OWL_HEIGHT = 130;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

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
  const s = useStrings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const background = useBackground(p.t);
  const { width, height } = useWindowDimensions();
  // Knappanelets vandrette position. Ugle og luft følger den, så skærmen
  // glider mellem de to opstillinger, mens man swiper.
  const scrollX = useRef(new Animated.Value(0)).current;
  const between = (simple: number, advanced: number) =>
    scrollX.interpolate({
      inputRange: [0, width],
      outputRange: [simple, advanced],
      extrapolate: "clamp",
    });
  // Uglen får den plads, der er tilbage, når tekst og knapper har fået
  // deres. Tallene er højden af alt andet på skærmen i de to opstillinger.
  const usable = height - insets.top - insets.bottom;
  const owlSimple = clamp((usable - 570) / OWL_HEIGHT, 0.75, 1.35);
  const owlAdvanced = clamp((usable - 645) / OWL_HEIGHT, 0.32, 0.9);
  // På de mindste skærme får Avanceret også mindre luft mellem delene.
  const tight = usable < 700;

  const sober = soberLine(p.minutesToZero);
  const summary =
    p.tonight.length > 0
      ? s.main.summary(unitsX10Label(p.totalX10), hhmm(p.tonight[0].t))
      : s.main.nothingYet;

  function changeLang(lang: Lang) {
    setLang(lang);
    saveSetting("lang", lang).catch((e) => {
      console.warn("Kunne ikke gemme sprog", e);
    });
  }

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
          <View style={[styles.topSide, styles.topRight]}>
            <Pressable
              onPress={() => setInfoOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={s.main.infoButton}
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
          {/* I Avanceret fylder knapperne tre rækker. Ugle og luft bliver
              mindre, så statuslinjen ikke bliver skåret af på små skærme. */}
          <Animated.View
            style={[styles.bubble, { marginTop: between(28, tight ? 8 : 14) }]}
          >
            <SpeechBubble text={roastFor(p.level, p.tonight.length)} />
          </Animated.View>

          <Animated.View style={{ marginTop: between(22, tight ? 2 : 6) }}>
            <Owl t={p.t} scale={between(owlSimple, owlAdvanced)} />
          </Animated.View>

          <Animated.View
            style={[styles.numberBlock, { marginTop: between(22, tight ? 6 : 12) }]}
          >
            <Text
              style={styles.number}
              accessibilityLabel={`${daWhole(p.active)} ${s.main.activeLabel}`}
            >
              {daWhole(p.active)}
            </Text>
            <Text style={styles.numberLabel}>{s.main.activeLabel}</Text>
            <StatusLine level={p.level} />
          </Animated.View>

          {/* Hvornår tallet når nul, står i bunden af listen "I aften". */}
          <View style={styles.spacer} />
        </ScrollView>

        <DrinkPager
          scrollX={scrollX}
          width={width}
          page={Math.max(0, PAGES.indexOf(p.mode))}
          labels={[s.main.simple, s.main.advanced]}
          onPage={(i) => p.setMode(PAGES[i])}
          onAdd={p.add}
        />

        <Pressable
          onPress={() => setDrawerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`${summary}. ${s.main.showList}`}
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
        onLang={changeLang}
      />
    </Animated.View>
  );
}

const TOP_LEVEL = 5;

// På det højeste trin står "TAG HJEM" med store bogstaver og fed skrift.
// Resten af linjen er uændret.
function StatusLine({ level }: { level: number }) {
  // Ved nul siger tallet det hele.
  if (level === 0) return null;
  const text = statusFor(level);
  const split = text.indexOf(" – ");
  if (level < TOP_LEVEL || split === -1) {
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
  bubble: { alignSelf: "stretch" },
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
  // Luft ned til knapperne, også når indholdet fylder hele feltet.
  middle: { flex: 1, marginBottom: 12 },
  middleContent: { flexGrow: 1, alignItems: "center" },
  numberBlock: { alignItems: "center", gap: 4 },
  number: {
    fontFamily: fonts.medium,
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -2.88,
    color: colors.num,
    fontVariant: ["tabular-nums"],
  },
  // Samme farve som tallet, så de to læses som ét.
  numberLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.numMuted,
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
  spacer: { flex: 1, minHeight: 22 },
  handle: {
    alignSelf: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
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
