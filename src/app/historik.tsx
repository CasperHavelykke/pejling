// Historik: en kalender over tidligere aftener. Kun data. Ingen rekorder,
// ingen ugle og ingen kommentarer.
//
// Feltets farve viser aftenens højeste antal aktive genstande i fem trin,
// samme trin som statuslinjen. Tallet i feltet er genstande i alt.

import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chevron } from "../components/Chevron";
import {
  WEEKDAYS_SHORT,
  addMonths,
  compareMonths,
  dayKey,
  longDate,
  monthGrid,
  monthTitle,
  type YearMonth,
} from "../domain/calendar";
import { LEVEL_TABLE } from "../domain/copy";
import { drinkName, type DrinkLog } from "../domain/drinks";
import {
  da,
  genstandWord,
  hhmm,
  unitsX10Label,
} from "../domain/format";
import {
  buildDays,
  dayKeyOf,
  monthSummary,
  type DaySummary,
} from "../domain/history";
import {
  DEFAULT_WEIGHT_KG,
  clampWeight,
  type Body,
} from "../domain/widmark";
import { loadDrinksSince, loadSettings } from "../storage/store";
import { mixOklch } from "../theme/color";
import { colors, fonts, radius, space } from "../theme/tokens";

// Ét farvetrin pr. niveau 1-5: samme farvetone som hovedtallet, fra svag
// til kraftig. Teksten skifter til mørk på de to lyseste trin, så den
// altid kan læses.
const STEPS = [0.22, 0.36, 0.5, 0.72, 0.9].map((p, i) => ({
  fill: mixOklch(colors.bg, colors.num, p),
  ink: i >= 3 ? colors.inkOnLight : colors.text,
}));

function stepFor(level: number) {
  return STEPS[Math.min(STEPS.length, Math.max(1, level)) - 1];
}

function levelName(level: number): string {
  return LEVEL_TABLE[Math.min(LEVEL_TABLE.length, Math.max(1, level)) - 1][1];
}

function thisMonth(): YearMonth {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() };
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<DrinkLog[] | null>(null);
  const [fallback, setFallback] = useState<Body>({
    weightKg: DEFAULT_WEIGHT_KG,
    sex: "m",
  });
  const [shown, setShown] = useState<YearMonth>(thisMonth);
  const [selected, setSelected] = useState<string | null>(null);

  // Hentes hver gang skærmen åbnes, så aftenens seneste tryk er med.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          const [settings, all] = await Promise.all([
            loadSettings(),
            loadDrinksSince(0),
          ]);
          if (!alive) return;
          setFallback({
            weightKg: settings.weightKg
              ? clampWeight(Number(settings.weightKg))
              : DEFAULT_WEIGHT_KG,
            sex: settings.sex === "f" ? "f" : "m",
          });
          setLogs(all);
        } catch (e) {
          console.warn("Kunne ikke læse historik", e);
          if (alive) setLogs([]);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const days = useMemo(
    () => buildDays(logs ?? [], fallback),
    [logs, fallback],
  );
  const weeks = useMemo(() => monthGrid(shown.year, shown.month), [shown]);
  const summary = useMemo(
    () => monthSummary(days, shown.year, shown.month),
    [days, shown],
  );

  const now = thisMonth();
  const today = dayKeyOf(Date.now());
  const atLatest = compareMonths(shown, now) >= 0;
  const earliest = useMemo(() => {
    const first = [...days.keys()].sort()[0];
    if (!first) return now;
    const [y, m] = first.split("-").map(Number);
    return { year: y, month: m - 1 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);
  const atEarliest = compareMonths(shown, earliest) <= 0;

  const selectedDay = selected ? days.get(selected) : undefined;

  function go(delta: number) {
    setShown((s) => addMonths(s, delta));
    setSelected(null);
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 12 },
      ]}
    >
      <View style={styles.topbar}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          accessibilityRole="button"
          accessibilityLabel="Tilbage"
          hitSlop={10}
          style={({ pressed }) => [
            styles.back,
            pressed && { backgroundColor: colors.pressTint },
          ]}
        >
          <Chevron direction="left" color={colors.text} />
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">
          Historik
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 12) + 24 },
        ]}
        alwaysBounceVertical={false}
      >
        <View style={styles.monthRow}>
          <MonthButton
            direction="left"
            label="Forrige måned"
            disabled={atEarliest}
            onPress={() => go(-1)}
          />
          <View style={styles.monthText}>
            <Text style={styles.month}>{monthTitle(shown)}</Text>
            <Text style={styles.monthSub}>
              {logs === null
                ? " "
                : summary.days === 0
                  ? "Ingen indtastninger"
                  : `${summary.days} ${summary.days === 1 ? "dag" : "dage"} · ${unitsX10Label(summary.totalX10)} ${genstandWord(summary.totalX10 / 10)}`}
            </Text>
          </View>
          <MonthButton
            direction="right"
            label="Næste måned"
            disabled={atLatest}
            onPress={() => go(1)}
          />
        </View>

        <View style={styles.weekdays}>
          {WEEKDAYS_SHORT.map((d, i) => (
            <Text key={i} style={styles.weekday}>
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.week}>
              {week.map((day, di) => {
                if (day === null) {
                  return <View key={di} style={styles.cell} />;
                }
                const key = dayKey(shown.year, shown.month, day);
                return (
                  <DayCell
                    key={di}
                    day={day}
                    summary={days.get(key)}
                    isToday={key === today}
                    isSelected={key === selected}
                    label={longDate(key)}
                    onPress={() => setSelected(key === selected ? null : key)}
                  />
                );
              })}
            </View>
          ))}
        </View>

        <Legend />

        {selectedDay ? (
          <DayDetail day={selectedDay} />
        ) : (
          <Text style={styles.hint}>
            {selected
              ? `Ingen indtastninger ${longDate(selected)}.`
              : days.size === 0 && logs !== null
                ? "Her kommer dine aftener til at stå, når du har brugt Pejling."
                : "Tryk på en dag for at se aftenen."}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function MonthButton({
  direction,
  label,
  disabled,
  onPress,
}: {
  direction: "left" | "right";
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.monthButton,
        pressed && { backgroundColor: colors.pressTint },
        disabled && { opacity: 0.3 },
      ]}
    >
      <Chevron direction={direction} color={colors.text} />
    </Pressable>
  );
}

function DayCell({
  day,
  summary,
  isToday,
  isSelected,
  label,
  onPress,
}: {
  day: number;
  summary: DaySummary | undefined;
  isToday: boolean;
  isSelected: boolean;
  label: string;
  onPress: () => void;
}) {
  const step = summary ? stepFor(summary.peakLevel) : null;
  const a11y = summary
    ? `${label}. ${unitsX10Label(summary.totalX10)} ${genstandWord(summary.totalX10 / 10)}, ${levelName(summary.peakLevel).toLowerCase()}`
    : `${label}. Ingen indtastninger`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ selected: isSelected }}
      style={styles.cell}
    >
      <View
        style={[
          styles.cellBox,
          step && { backgroundColor: step.fill },
          isToday && !step && styles.cellToday,
          isSelected && styles.cellSelected,
        ]}
      >
        <Text
          style={[
            styles.cellDay,
            { color: step ? step.ink : colors.muted },
            isToday && !step && { color: colors.text },
          ]}
        >
          {day}
        </Text>
        {summary && step && (
          <Text style={[styles.cellValue, { color: step.ink }]}>
            {unitsX10Label(summary.totalX10)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function Legend() {
  return (
    <View
      style={styles.legend}
      accessible
      accessibilityLabel="Farven viser aftenens højeste antal aktive genstande, fra let påvirket til tag hjem. Tallet er genstande i alt."
    >
      <Text style={styles.legendTitle}>
        Farve: maks aktive genstande · Tal: genstande i alt
      </Text>
      <View style={styles.legendRow}>
        <Text style={styles.legendEnd}>{levelName(1)}</Text>
        <View style={styles.swatches}>
          {STEPS.map((s, i) => (
            <View key={i} style={[styles.swatch, { backgroundColor: s.fill }]} />
          ))}
        </View>
        <Text style={styles.legendEnd}>{levelName(5)}</Text>
      </View>
    </View>
  );
}

function DayDetail({ day }: { day: DaySummary }) {
  const step = stepFor(day.peakLevel);
  const span =
    hhmm(day.start) === hhmm(day.end)
      ? hhmm(day.start)
      : `${hhmm(day.start)}–${hhmm(day.end)}`;
  // Nyeste øverst, som i listen "I aften".
  const logs = [...day.logs].sort((a, b) => b.t - a.t);
  return (
    <View style={styles.detail}>
      <Text style={styles.detailTitle}>{longDate(day.dayKey)}</Text>

      <View style={styles.stats}>
        <Stat
          label="Genstande"
          value={unitsX10Label(day.totalX10)}
        />
        <Stat
          label="Maks aktive"
          value={da(day.peakActive)}
          swatch={step.fill}
          note={levelName(day.peakLevel)}
        />
        <Stat
          label={day.entries === 1 ? "Indtastning" : "Indtastninger"}
          value={String(day.entries)}
          note={span}
        />
      </View>

      <View>
        {logs.map((l) => (
          <View key={l.id} style={styles.row}>
            <Text style={styles.rowTime}>{hhmm(l.t)}</Text>
            <Text style={styles.rowName} numberOfLines={1}>
              {drinkName(l.kind)}
            </Text>
            <Text style={styles.rowUnits}>{unitsX10Label(l.unitsX10)} gs.</Text>
          </View>
        ))}
      </View>
      {dayKeyOf(day.end) !== day.dayKey && (
        <Text style={styles.detailFoot}>
          Aftenen fortsatte efter midnat og står samlet på den dag, den
          startede.
        </Text>
      )}
    </View>
  );
}

function Stat({
  label,
  value,
  note,
  swatch,
}: {
  label: string;
  value: string;
  note?: string;
  swatch?: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {note && (
        <View style={styles.statNote}>
          {swatch && <View style={[styles.dot, { backgroundColor: swatch }]} />}
          <Text style={styles.statNoteText} numberOfLines={1}>
            {note}
          </Text>
        </View>
      )}
    </View>
  );
}

const GAP = 4;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: space.side - 8,
    paddingBottom: 8,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 18,
    letterSpacing: -0.18,
    color: colors.text,
  },
  content: { paddingHorizontal: space.side },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 14,
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: { alignItems: "center", gap: 2 },
  month: {
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.text,
  },
  monthSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  weekdays: { flexDirection: "row", gap: GAP, marginBottom: 6 },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.regular,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.muted,
  },
  grid: { gap: GAP },
  week: { flexDirection: "row", gap: GAP },
  cell: { flex: 1, aspectRatio: 1 },
  cellBox: {
    flex: 1,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  cellToday: { borderColor: colors.divider },
  cellSelected: { borderColor: colors.text },
  cellDay: {
    position: "absolute",
    top: 3,
    left: 5,
    fontFamily: fonts.regular,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
  },
  cellValue: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
  legend: { marginTop: 14, gap: 6 },
  legendTitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendEnd: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  swatches: { flexDirection: "row", gap: 2 },
  swatch: { width: 18, height: 10, borderRadius: 3 },
  hint: {
    marginTop: 22,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  detail: {
    marginTop: 18,
    padding: 16,
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.sheet,
    borderWidth: 1,
    borderColor: colors.ringSm,
  },
  detailTitle: {
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.text,
  },
  stats: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, gap: 2 },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  statValue: {
    fontFamily: fonts.medium,
    fontSize: 24,
    lineHeight: 28,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  statNote: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statNoteText: {
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  rowTime: {
    width: 44,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    fontVariant: ["tabular-nums"],
  },
  rowName: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  rowUnits: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  detailFoot: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
});
