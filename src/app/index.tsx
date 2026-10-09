import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { LevelScale } from "../components/LevelScale";
import { Owl } from "../components/Owl";
import { BUBBLE_FIELD_HEIGHT, SpeechBubble } from "../components/SpeechBubble";
import { TonightDrawer } from "../components/TonightDrawer";
import { isTestHint, roastFor, statusDetail } from "../domain/copy";
import {
  clearLine,
  daWhole,
  hhmm,
  soberLine,
  unitsX10Label,
} from "../domain/format";
import { alongTrack, buildTrack } from "../domain/pagerTrack";
import { setLang, useStrings, type Lang } from "../i18n";
import { usePejling, type Mode } from "../state/usePejling";
import { saveSetting } from "../storage/store";
import { lerpRgb, mixOklch } from "../theme/color";
import { colors, fonts, radius, space } from "../theme/tokens";

// Knappanelerne i den rækkefølge, de swipes i.
const PAGES: readonly Mode[] = ["simple", "advanced", "custom"];

// Så længe står forklaringen i boblen efter et tryk på pillen.
const EXPLAIN_MS = 5000;

// Uglens højde i punkter ved skala 1.
const OWL_HEIGHT = 130;
// Mindste luft under tallet, før knapperne begynder.
const SPACER = 22;
// Så længe må midten vente på målingen, før den vises alligevel.
const FIT_TIMEOUT_MS = 800;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// Baggrunden glider mod rød: ved fuldt udslag er 85 % af farven rød.
function useBackground(t: number) {
  const target = useMemo(
    () => mixOklch(colors.bg, colors.red, Math.round(t * 85) / 100),
    [t],
  );
  // Start, mål og fremdrift hører sammen og skiftes samlet. Blev
  // fremdriften nulstillet for sig, viste skærmen i et enkelt billede den
  // farve, den forrige overgang startede fra: et kort blink tilbage mod blå.
  const [fade, setFade] = useState(() => ({
    from: target,
    to: target,
    progress: new Animated.Value(1),
  }));
  // Hvor langt den igangværende overgang er nået, 0..1.
  const reached = useRef(1);

  useEffect(() => {
    setFade((prev) =>
      prev.to === target
        ? prev
        : {
            // Fortsæt fra den farve, der står på skærmen nu, også hvis den
            // forrige overgang ikke var færdig.
            from: lerpRgb(prev.from, prev.to, reached.current),
            to: target,
            progress: new Animated.Value(0),
          },
    );
  }, [target]);

  useEffect(() => {
    const { progress } = fade;
    const done = fade.from === fade.to;
    reached.current = done ? 1 : 0;
    const id = progress.addListener(({ value }) => {
      reached.current = value;
    });
    if (!done) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
    return () => progress.removeListener(id);
  }, [fade]);

  return fade.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [fade.from, fade.to],
  });
}

export default function PejlingScreen() {
  const insets = useSafeAreaInsets();
  const p = usePejling();
  const s = useStrings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [remindersDenied, setRemindersDenied] = useState(false);
  const background = useBackground(p.t);
  // Ved urealistisk mange genstande dropper uglen rollen og ser nøgtern
  // ud, mens tal, statuslinje og baggrund stadig viser det rigtige.
  const testing = isTestHint(p.active);
  const window = useWindowDimensions();
  const width = window.width;
  // Skærmens højde måles på selve skærmbilledet. Telefonens egen oplysning
  // om vinduets højde regner på nogle Android-telefoner ikke statuslinjen
  // og knapperne i bunden med, og så blev uglen alt for lille.
  const [rootHeight, setRootHeight] = useState<number | null>(null);
  const height = rootHeight ?? window.height;
  // Knappanelernes højder, målt af panelerne selv.
  const [heights, setHeights] = useState<(number | null)[]>(() =>
    PAGES.map(() => null),
  );
  const setPanelHeight = useCallback((index: number, h: number) => {
    setHeights((prev) => {
      if (prev[index] !== null && Math.abs((prev[index] ?? 0) - h) < 0.5) {
        return prev;
      }
      const next = [...prev];
      next[index] = h;
      return next;
    });
  }, []);
  // Knappanelets vandrette position. Ugle, luft og feltets højde følger
  // den ad samme spor, så skærmen glider samlet mellem opstillingerne.
  const scrollX = useRef(new Animated.Value(0)).current;
  const track = useMemo(() => buildTrack(heights, width), [heights, width]);
  const along = (values: readonly number[]) =>
    scrollX.interpolate({
      inputRange: track.input,
      outputRange: alongTrack(track, values),
      extrapolate: "clamp",
    });
  const measured = heights.every((h): h is number => h !== null);
  const panelHeight = measured ? along(heights as number[]) : undefined;
  const usable = height - insets.top - insets.bottom;
  // På de mindste skærme får Avanceret også mindre luft mellem delene.
  const tight = usable < 700;
  const page = Math.max(0, PAGES.indexOf(p.mode));
  // Luft over boble, ugle og tal i Simpel og i de to høje paneler.
  const gaps = (i: number) =>
    i === 0 ? [28, 22, 22] : [tight ? 8 : 14, tight ? 2 : 6, tight ? 6 : 12];

  // Uglen får den plads, der er tilbage, når boble, tal og knapper har
  // fået deres, så skærmen aldrig skal rulle. Feltet mellem topbaren og
  // knapperne måles, mens panelet ligger stille; lagt sammen med panelets
  // højde giver det pladsen uden panel, som gælder for alle tre paneler.
  // Indtil målingen er der, bruges et skøn ud fra skærmens højde.
  const scrollPos = useRef(0);
  useEffect(() => {
    const id = scrollX.addListener(({ value }) => {
      scrollPos.current = value;
    });
    return () => scrollX.removeListener(id);
  }, [scrollX]);
  const [middleBase, setMiddleBase] = useState<number | null>(null);
  const [numberHeight, setNumberHeight] = useState<number | null>(null);
  // Feltets seneste mål, og om panelerne havde deres målte højde, da det
  // blev taget. Før de er målt, er knapfeltet så højt som det højeste
  // panel. Panelernes højder kommer ofte efter feltets første måling,
  // uden at feltet ændrer størrelse, så regnestykket laves igen, når de
  // er der.
  const middleHeight = useRef<{ h: number; withPanels: boolean } | null>(
    null,
  );
  const updateMiddleBase = useCallback(() => {
    const m = middleHeight.current;
    if (m === null || !heights.every((h) => h !== null)) return;
    const all = heights as number[];
    let base: number;
    if (m.withPanels) {
      const pos = scrollPos.current / width;
      const at = Math.round(pos);
      if (Math.abs(pos - at) > 0.02) return;
      base = m.h + all[at];
    } else {
      base = m.h + Math.max(...all);
    }
    setMiddleBase((prev) =>
      prev !== null && Math.abs(prev - base) < 0.5 ? prev : base,
    );
  }, [heights, width]);
  useEffect(updateMiddleBase, [updateMiddleBase]);
  const onMiddleLayout = (h: number) => {
    middleHeight.current = { h, withPanels: measured };
    updateMiddleBase();
  };
  const owlFor = (i: number, guess: number, min: number, max: number) => {
    const panel = heights[i];
    if (middleBase === null || numberHeight === null || panel === null) {
      return guess;
    }
    const [g1, g2, g3] = gaps(i);
    const free =
      middleBase - panel - g1 - BUBBLE_FIELD_HEIGHT - g2 - g3 - numberHeight - SPACER - 1;
    return clamp(free / OWL_HEIGHT, min, max);
  };
  const owls = [
    owlFor(0, clamp((usable - 630) / OWL_HEIGHT, 0.75, 1.35), 0.75, 1.35),
    owlFor(1, clamp((usable - 705) / OWL_HEIGHT, 0.32, 0.9), 0.32, 0.9),
    owlFor(2, clamp((usable - 705) / OWL_HEIGHT, 0.32, 0.9), 0.32, 0.9),
  ];
  // Midten vises først, når uglens størrelse er regnet ud fra målingerne,
  // så den ikke blinker i skønnets størrelse ved opstart. Udebliver
  // målingen, vises den alligevel efter et øjeblik; en tom skærm er værre
  // end et blink.
  const [showAnyway, setShowAnyway] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowAnyway(true), FIT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);
  const fitted =
    (middleBase !== null && numberHeight !== null) || showAnyway;

  // Et tryk på pillen under tallet får uglen til at forklare niveauet i
  // boblen i nogle sekunder; derefter vender dens kommentar tilbage.
  const [explain, setExplain] = useState<string | null>(null);
  useEffect(() => {
    if (explain === null) return;
    const timer = setTimeout(() => setExplain(null), EXPLAIN_MS);
    return () => clearTimeout(timer);
  }, [explain]);
  useEffect(() => setExplain(null), [p.level]);
  const bubble =
    explain ?? roastFor(p.level, p.tonight.length, p.active);

  // Mens der er aktive genstande: tid til nul. Derefter: tid til listen
  // ryddes, så ingen undrer sig over, at gårsdagens liste stadig står der.
  const sober =
    p.minutesToZero > 0 || p.tonight.length === 0
      ? soberLine(p.minutesToZero)
      : clearLine(p.minutesToClear);
  const summary =
    p.tonight.length > 0
      ? s.main.summary(unitsX10Label(p.totalX10), hhmm(p.tonight[0].t))
      : s.main.nothingYet;

  function changeReminders(on: boolean) {
    p.setReminders(on).then((ok) => setRemindersDenied(on && !ok));
  }

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
    <Animated.View
      style={[styles.root, { backgroundColor: background }]}
      onLayout={(e) => setRootHeight(e.nativeEvent.layout.height)}
    >
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom, 12) + 6,
          },
        ]}
      >
        {/* Navnet står midt på skærmen: lige brede sider om det. */}
        <View style={styles.topbar}>
          <View style={styles.topSide} />
          <Text style={styles.brand} accessibilityRole="header">
            Pejling
          </Text>
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
          contentContainerStyle={[styles.middleContent, { opacity: fitted ? 1 : 0 }]}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          onLayout={(e) => onMiddleLayout(e.nativeEvent.layout.height)}
        >
          {/* I Avanceret fylder knapperne tre rækker. Ugle og luft bliver
              mindre, så skalaen ikke bliver skåret af på små skærme. */}
          <Animated.View
            style={[styles.bubble, { marginTop: along(PAGES.map((_, i) => gaps(i)[0])) }]}
          >
            <SpeechBubble text={bubble} italic={explain !== null} />
          </Animated.View>

          <Animated.View style={{ marginTop: along(PAGES.map((_, i) => gaps(i)[1])) }}>
            <Owl t={testing ? 0 : p.t} scale={along(owls)} />
          </Animated.View>

          <Animated.View
            style={[styles.numberBlock, { marginTop: along(PAGES.map((_, i) => gaps(i)[2])) }]}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              setNumberHeight((prev) =>
                prev !== null && Math.abs(prev - h) < 0.5 ? prev : h,
              );
            }}
          >
            {/* Tilden minder om, at tallet er et estimat. En usynlig kopi
                på den anden side holder selve tallet midt på skærmen. */}
            <View
              style={styles.numberRow}
              accessible
              accessibilityLabel={`${s.main.about} ${daWhole(p.active)} ${s.main.activeLabel}`}
            >
              <Text style={styles.tilde}>~</Text>
              <Text style={styles.number}>{daWhole(p.active)}</Text>
              <Text style={[styles.tilde, styles.tildeGhost]}>~</Text>
            </View>
            <Text style={styles.numberLabel}>{s.main.activeLabel}</Text>
            <LevelScale
              level={p.level}
              onPress={() =>
                setExplain((v) => (v ? null : statusDetail(p.level)))
              }
            />
          </Animated.View>

          {/* Hvornår tallet når nul, står i bunden af listen "I aften". */}
          <View style={styles.spacer} />
        </ScrollView>

        <DrinkPager
          scrollX={scrollX}
          width={width}
          height={panelHeight}
          onHeight={setPanelHeight}
          page={page}
          labels={[s.main.simple, s.main.advanced, s.custom.page]}
          recents={p.recents}
          body={{ weightKg: p.weightKg, sex: p.sex }}
          onRemoveRecent={p.removeRecent}
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
        onClear={p.clearTonight}
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
        level={p.level}
        bottomInset={Math.max(insets.bottom, 12) + 28}
        onWeight={p.setWeight}
        onSex={p.setSex}
        onLang={changeLang}
        reminders={p.reminders}
        remindersDenied={remindersDenied}
        onReminders={changeReminders}
      />
    </Animated.View>
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
  numberRow: { flexDirection: "row", alignItems: "flex-start" },
  tilde: {
    marginRight: 4,
    fontFamily: fonts.regular,
    fontSize: 48,
    lineHeight: 76,
    color: colors.numMuted,
  },
  tildeGhost: { marginRight: 0, marginLeft: 4, opacity: 0 },
  // Samme farve som tallet, så de to læses som ét.
  numberLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.numMuted,
  },
  spacer: { flex: 1, minHeight: SPACER },
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
