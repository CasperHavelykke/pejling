// Tredje knappanel: egen indtastning. Man vælger type, justerer størrelse
// og styrke med plus og minus, og appen regner om til genstande.
//
// Alt vælges med tryk. Panelet sidder i bunden af skærmen, så et tastatur
// ville dække det.

import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  CUSTOM_DEFAULTS,
  CUSTOM_TYPES,
  atSizeLimit,
  atStrengthLimit,
  burnMinutes,
  customKind,
  customUnitsX10,
  parseCustom,
  stepSize,
  stepStrength,
  type CustomType,
} from "../domain/custom";
import { customName } from "../domain/drinks";
import { daWhole, unitsX10Label } from "../domain/format";
import { useStrings } from "../i18n";
import type { Body } from "../domain/widmark";
import type { Entry } from "../state/usePejling";
import { colors, fonts, radius } from "../theme/tokens";
import { DrinkIcon } from "./icons";
import type { DrinkIconKey } from "../domain/drinks";

// Ikonets højde på knapperne under Seneste: begge tekstlinjer.
const RECENT_ICON = 26;
// Rækkens højde, hvad enten den er tom eller har knapper.
const RECENT_HEIGHT = 46;

const TYPE_ICONS: Record<CustomType, DrinkIconKey> = {
  beer: "bottle",
  wine: "wine",
  // Det lave glas: et shotglas og ikke et højt glas.
  spirit: "shot",
};

function Stepper({
  label,
  value,
  lessLabel,
  moreLabel,
  lessDisabled,
  moreDisabled,
  onLess,
  onMore,
}: {
  label: string;
  value: string;
  lessLabel: string;
  moreLabel: string;
  lessDisabled: boolean;
  moreDisabled: boolean;
  onLess: () => void;
  onMore: () => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.kicker}>{label}</Text>
      <View style={styles.stepRow}>
        <StepButton
          symbol="−"
          label={`${label}: ${lessLabel}`}
          disabled={lessDisabled}
          onPress={onLess}
        />
        <Text
          style={styles.value}
          numberOfLines={1}
          accessibilityLiveRegion="polite"
        >
          {value}
        </Text>
        <StepButton
          symbol="+"
          label={`${label}: ${moreLabel}`}
          disabled={moreDisabled}
          onPress={onMore}
        />
      </View>
    </View>
  );
}

function StepButton({
  symbol,
  label,
  disabled,
  onPress,
}: {
  symbol: string;
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
        styles.step,
        pressed && { backgroundColor: colors.pressTint },
        disabled && { opacity: 0.35 },
      ]}
    >
      <Text style={styles.stepText}>{symbol}</Text>
    </Pressable>
  );
}

export function CustomPanel({
  recents,
  body,
  onAdd,
  onRemoveRecent,
}: {
  // De seneste egne indtastninger, nyeste først.
  recents: readonly string[];
  // Vægt og køn, til skønnet over hvor længe kroppen bruger på genstanden.
  body: Body;
  onAdd: (entry: Entry) => void;
  // Et langt tryk på en knap under Seneste fjerner den fra rækken.
  onRemoveRecent: (kind: string) => void;
}) {
  const s = useStrings();
  const [type, setType] = useState<CustomType>("beer");
  // Hver type husker sine egne tal, mens appen er åben.
  const [values, setValues] = useState(CUSTOM_DEFAULTS);
  const { cl, abv } = values[type];
  const unitsX10 = customUnitsX10({ cl, abv });
  const burn = burnMinutes(unitsX10, body);

  // Et langt tryk mærker knappen, og den fjernes først, når fingeren
  // slippes. Ellers ville naboknappen rykke ind under fingeren og kunne
  // blive trykket på i samme bevægelse. Af samme grund tæller tryk på
  // rækken ikke i et kort øjeblik efter en fjernelse.
  const [removing, setRemoving] = useState<string | null>(null);
  const blockedUntil = useRef(0);

  function change(next: Partial<{ cl: number; abv: number }>) {
    setValues((prev) => ({ ...prev, [type]: { ...prev[type], ...next } }));
  }

  return (
    <View style={styles.panel}>
      {/* Typen vælges, den logger ikke. Derfor er knapperne mørke og ikke
          lilla som dem, der lægger noget i listen. */}
      <View style={styles.typeRow} accessibilityRole="radiogroup">
        {CUSTOM_TYPES.map((t) => {
          const on = t === type;
          const ink = on ? colors.segOnFg : colors.muted;
          return (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [
                styles.type,
                on && styles.typeOn,
                !on && pressed && { backgroundColor: colors.pressTint },
              ]}
            >
              <DrinkIcon icon={TYPE_ICONS[t]} height={18} color={ink} />
              <Text style={[styles.typeText, { color: ink }]} numberOfLines={1}>
                {s.custom.types[t]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.fields}>
        <Stepper
          label={s.custom.size}
          value={`${daWhole(cl)} cl`}
          lessLabel={s.custom.smaller}
          moreLabel={s.custom.larger}
          lessDisabled={atSizeLimit(type, cl, -1)}
          moreDisabled={atSizeLimit(type, cl, 1)}
          onLess={() => change({ cl: stepSize(type, cl, -1) })}
          onMore={() => change({ cl: stepSize(type, cl, 1) })}
        />
        <Stepper
          label={s.custom.strength}
          value={s.custom.percent(daWhole(abv))}
          lessLabel={s.custom.weaker}
          moreLabel={s.custom.stronger}
          lessDisabled={atStrengthLimit(type, abv, -1)}
          moreDisabled={atStrengthLimit(type, abv, 1)}
          onLess={() => change({ abv: stepStrength(type, abv, -1) })}
          onMore={() => change({ abv: stepStrength(type, abv, 1) })}
        />
      </View>

      <Pressable
        onPress={() =>
          onAdd({ kind: customKind({ type, cl, abv }), unitsX10 })
        }
        accessibilityRole="button"
        style={({ pressed }) => [styles.add, pressed && styles.addPressed]}
      >
        <Text style={styles.addText}>
          {s.custom.add(unitsX10Label(unitsX10), unitsX10 / 10)}
        </Text>
        {/* Ændrer sig med plus og minus, så man kan se, hvad en genstand
            koster i tid, uden at logge den. */}
        <Text style={styles.addSub} numberOfLines={1}>
          {s.custom.burnTime(Math.floor(burn / 60), burn % 60)}
        </Text>
      </Pressable>

      {/* Rækken er der fra start, også når den er tom. Så har panelet samme
          højde hele tiden, og intet flytter sig ved første tryk. */}
      <View>
        <Text style={styles.kicker}>{s.custom.recent}</Text>
        {recents.length === 0 ? (
          <View style={styles.recentEmpty}>
            <Text style={styles.recentEmptyText} numberOfLines={1}>
              {s.custom.recentEmpty}
            </Text>
          </View>
        ) : (
          <View style={styles.recentRow}>
            {recents.map((kind) => {
              const drink = parseCustom(kind);
              if (!drink) return null;
              const units = customUnitsX10(drink);
              const name = customName(drink);
              return (
                <Pressable
                  key={kind}
                  onPress={() => {
                    if (Date.now() < blockedUntil.current) return;
                    onAdd({ kind, unitsX10: units });
                  }}
                  onLongPress={() => setRemoving(kind)}
                  onPressOut={() => {
                    if (removing !== kind) return;
                    setRemoving(null);
                    blockedUntil.current = Date.now() + 400;
                    onRemoveRecent(kind);
                  }}
                  accessibilityRole="button"
                  accessibilityHint={s.custom.recentHint}
                  accessibilityLabel={`${name}, ${unitsX10Label(units)} ${s.unitWord(units / 10)}`}
                  style={({ pressed }) => [
                    styles.recent,
                    pressed && styles.recentPressed,
                    removing === kind && styles.recentRemoving,
                  ]}
                >
                  {/* Ikonet viser typen og fylder begge linjer. Teksten er
                      delt som på knapperne i Avanceret: størrelse øverst,
                      styrke og genstande nedenunder. */}
                  <View style={styles.recentIcon}>
                    <DrinkIcon
                      icon={TYPE_ICONS[drink.type]}
                      height={RECENT_ICON}
                      color={colors.btnFg}
                    />
                  </View>
                  <View style={styles.recentText}>
                    <Text style={styles.recentName} numberOfLines={1}>
                      {daWhole(drink.cl)} cl
                    </Text>
                    <Text
                      style={styles.recentSub}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {s.custom.percent(daWhole(drink.abv))} ·{" "}
                      {unitsX10Label(units)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 10 },
  kicker: {
    fontFamily: fonts.regular,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 5,
  },
  recentRow: { flexDirection: "row", gap: 6 },
  // Den tomme række er lige så høj som knapperne, der senere står der.
  recentEmpty: {
    height: RECENT_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.button,
  },
  recentEmptyText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
  // Samme udseende som knapperne i de andre paneler: et tryk logger.
  recent: {
    flex: 1,
    minWidth: 0,
    height: RECENT_HEIGHT,
    paddingVertical: 6,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.btnBg,
    borderWidth: 1,
    borderColor: colors.btnBg,
    borderRadius: radius.button,
  },
  recentPressed: {
    backgroundColor: colors.btnActive,
    borderColor: colors.btnActive,
  },
  // Knappen blegner, når den er mærket til at blive fjernet.
  recentRemoving: { opacity: 0.35 },
  // Fast felt til ikonet, så teksten starter samme sted i alle tre knapper,
  // selvom flasken er smal og vinglasset bredt.
  recentIcon: {
    width: RECENT_ICON,
    height: RECENT_ICON,
    alignItems: "center",
    justifyContent: "center",
  },
  recentText: { flex: 1, minWidth: 0, gap: 1 },
  recentName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 16,
    color: colors.btnFg,
  },
  recentSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.btnSub,
  },
  typeRow: { flexDirection: "row", gap: 6 },
  type: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.button,
  },
  typeOn: { backgroundColor: colors.segOn, borderColor: colors.segOn },
  typeText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 18,
  },
  fields: { flexDirection: "row", gap: 12 },
  field: { flex: 1, minWidth: 0 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  step: {
    width: 40,
    height: 40,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontFamily: fonts.regular,
    fontSize: 20,
    lineHeight: 24,
    color: colors.text,
  },
  value: {
    flex: 1,
    minWidth: 0,
    textAlign: "center",
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  add: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.btnBg,
    borderWidth: 1,
    borderColor: colors.btnBg,
    borderRadius: radius.button,
  },
  addPressed: {
    backgroundColor: colors.btnActive,
    borderColor: colors.btnActive,
  },
  addText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.btnFg,
  },
  addSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.btnSub,
  },
});
