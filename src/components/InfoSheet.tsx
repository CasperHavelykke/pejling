import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { infoExplanation, levelRows } from "../domain/copy";
import {
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
  type Body,
  type Sex,
} from "../domain/widmark";
import { useLang, useStrings, type Lang } from "../i18n";
import { LEVEL_STEPS } from "../theme/levels";
import { colors, fonts, radius } from "../theme/tokens";
import { BottomPanel } from "./BottomPanel";
import { Segmented } from "./Segmented";

// Sprogenes egne navne, så de kan findes, uanset hvilket sprog der er valgt.
const LANG_OPTIONS = [
  { value: "da", label: "Dansk" },
  { value: "en", label: "English" },
] as const;

function Stepper({
  label,
  symbol,
  disabled,
  onPress,
}: {
  label: string;
  symbol: string;
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
        styles.stepper,
        pressed && { backgroundColor: colors.pressTint },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Text style={styles.stepperText}>{symbol}</Text>
    </Pressable>
  );
}

export function InfoSheet({
  open,
  onClose,
  weightKg,
  sex,
  level,
  bottomInset,
  onWeight,
  reminders,
  remindersDenied,
  onSex,
  onLang,
  onReminders,
}: {
  open: boolean;
  onClose: () => void;
  weightKg: number;
  sex: Sex;
  // Niveau 0-5 lige nu; rækken i skalaen mærkes. Ved 0 mærkes ingen.
  level: number;
  bottomInset: number;
  onWeight: (kg: number) => void;
  onSex: (sex: Sex) => void;
  onLang: (lang: Lang) => void;
  reminders: boolean;
  // Telefonen sagde nej, da påmindelser blev slået til.
  remindersDenied: boolean;
  onReminders: (on: boolean) => void;
}) {
  const s = useStrings();
  const lang = useLang();
  const body: Body = { weightKg, sex };
  const reminderOptions = [
    { value: "off", label: s.info.off },
    { value: "on", label: s.info.on },
  ] as const;
  const sexOptions = [
    { value: "m", label: s.info.male },
    { value: "f", label: s.info.female },
  ] as const;

  return (
    <BottomPanel
      open={open}
      onClose={onClose}
      style={[styles.panel, { bottom: bottomInset }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        alwaysBounceVertical={false}
      >
        <Text style={styles.heading}>{s.info.you}</Text>
        <View style={styles.you}>
          <View>
            <Text style={styles.fieldLabel}>{s.info.weight}</Text>
            <View style={styles.weightRow}>
              <Stepper
                label={s.info.kiloLess}
                symbol="−"
                disabled={weightKg <= MIN_WEIGHT_KG}
                onPress={() => onWeight(weightKg - 1)}
              />
              <Text style={styles.weight} accessibilityLiveRegion="polite">
                {weightKg} kg
              </Text>
              <Stepper
                label={s.info.kiloMore}
                symbol="+"
                disabled={weightKg >= MAX_WEIGHT_KG}
                onPress={() => onWeight(weightKg + 1)}
              />
            </View>
          </View>
          <View>
            <Text style={styles.fieldLabel}>{s.info.sex}</Text>
            <View style={styles.sexRow}>
              <Segmented
                options={sexOptions}
                value={sex}
                onChange={onSex}
                size="large"
                background={colors.bg}
              />
            </View>
          </View>
          <View>
            <Text style={styles.fieldLabel}>{s.info.language}</Text>
            <View style={styles.sexRow}>
              <Segmented
                options={LANG_OPTIONS}
                value={lang}
                onChange={onLang}
                size="large"
                background={colors.bg}
              />
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.fieldLabel}>{s.info.reminders}</Text>
          <View style={styles.sexRow}>
            <Segmented
              options={reminderOptions}
              value={reminders ? "on" : "off"}
              onChange={(v) => onReminders(v === "on")}
              size="large"
              background={colors.bg}
            />
          </View>
          <Text style={styles.help}>
            {remindersDenied ? s.info.remindersDenied : s.info.remindersHelp}
          </Text>
        </View>

        <View style={styles.rule} />

        <Text style={styles.heading}>{s.info.howTitle}</Text>
        <Text style={styles.body}>{infoExplanation(body)}</Text>
        <Text style={styles.body}>{s.infoDrinks}</Text>

        {/* Skalaen: samme fem farver som historikkens kalender. */}
        <View style={styles.scale}>
          <Text style={styles.scaleHead}>{s.info.tableHead}</Text>
          {levelRows(body).map(([range, label], i) => {
            const current = level === i + 1;
            return (
              <View
                key={range}
                style={styles.scaleRow}
                accessibilityLabel={`${range}: ${label}${current ? `, ${s.info.now}` : ""}`}
              >
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: LEVEL_STEPS[i].fill },
                    current && styles.swatchCurrent,
                  ]}
                />
                <Text style={styles.scaleRange}>{range}</Text>
                <Text
                  style={[styles.scaleName, current && styles.scaleNameCurrent]}
                >
                  {label}
                </Text>
                {current && <Text style={styles.scaleNow}>{s.info.now}</Text>}
              </View>
            );
          })}
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimer}>{s.infoDisclaimer}</Text>
        </View>

        <View style={styles.rule} />

        <Text style={styles.heading}>{s.info.dataTitle}</Text>
        <Text style={styles.body}>{s.infoStorage}</Text>
      </ScrollView>

      {/* Ligger uden for rullefeltet, så krydset altid kan nås. */}
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={s.info.close}
        hitSlop={6}
        style={({ pressed }) => [
          styles.close,
          pressed && { backgroundColor: colors.pressTint },
        ]}
      >
        <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
          <Path
            d="M2 2 L12 12 M12 2 L2 12"
            stroke={colors.text}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </Svg>
      </Pressable>
    </BottomPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    left: 16,
    right: 16,
    maxHeight: "85%",
    borderRadius: radius.sheet,
  },
  content: { padding: 18, gap: 12 },
  heading: { fontFamily: fonts.medium, fontSize: 18, color: colors.text },
  you: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    columnGap: 20,
    rowGap: 12,
  },
  fieldLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
  },
  weightRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  weight: {
    minWidth: 72,
    textAlign: "center",
    fontFamily: fonts.medium,
    fontSize: 22,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  stepper: {
    width: 40,
    height: 40,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    fontFamily: fonts.regular,
    fontSize: 20,
    lineHeight: 24,
    color: colors.text,
  },
  sexRow: { flexDirection: "row", height: 40, alignItems: "center" },
  help: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: 4,
    marginHorizontal: 24,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  scale: { gap: 6, marginTop: 2 },
  scaleHead: {
    fontFamily: fonts.regular,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 2,
  },
  scaleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  swatch: { width: 14, height: 14, borderRadius: 4 },
  swatchCurrent: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  scaleRange: {
    width: 70,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    fontVariant: ["tabular-nums"],
  },
  scaleName: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  scaleNameCurrent: { fontFamily: fonts.medium },
  scaleNow: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.num,
  },
  disclaimerBox: {
    padding: 12,
    borderRadius: radius.control,
    backgroundColor: colors.bubble,
  },
  disclaimer: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  close: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
