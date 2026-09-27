import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  INFO_DISCLAIMER,
  INFO_EXPLANATION,
  INFO_STORAGE,
  LEVEL_TABLE,
} from "../domain/copy";
import {
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
  type Sex,
} from "../domain/widmark";
import { colors, fonts, radius } from "../theme/tokens";
import { BottomPanel } from "./BottomPanel";
import { Segmented } from "./Segmented";

const SEX_OPTIONS = [
  { value: "m", label: "Mand" },
  { value: "f", label: "Kvinde" },
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
  bottomInset,
  onWeight,
  onSex,
}: {
  open: boolean;
  onClose: () => void;
  weightKg: number;
  sex: Sex;
  bottomInset: number;
  onWeight: (kg: number) => void;
  onSex: (sex: Sex) => void;
}) {
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
        <Text style={styles.heading}>Dig</Text>
        <View style={styles.you}>
          <View>
            <Text style={styles.fieldLabel}>Kropsvægt</Text>
            <View style={styles.weightRow}>
              <Stepper
                label="Et kilo mindre"
                symbol="−"
                disabled={weightKg <= MIN_WEIGHT_KG}
                onPress={() => onWeight(weightKg - 1)}
              />
              <Text style={styles.weight} accessibilityLiveRegion="polite">
                {weightKg} kg
              </Text>
              <Stepper
                label="Et kilo mere"
                symbol="+"
                disabled={weightKg >= MAX_WEIGHT_KG}
                onPress={() => onWeight(weightKg + 1)}
              />
            </View>
          </View>
          <View>
            <Text style={styles.fieldLabel}>Køn</Text>
            <View style={styles.sexRow}>
              <Segmented
                options={SEX_OPTIONS}
                value={sex}
                onChange={onSex}
                size="large"
                background={colors.bg}
              />
            </View>
          </View>
        </View>

        <View style={styles.rule} />

        <Text style={styles.heading}>Sådan regner Pejling</Text>
        <Text style={styles.body}>{INFO_EXPLANATION}</Text>

        <View style={styles.table}>
          {LEVEL_TABLE.map(([range, label]) => (
            <View key={range} style={styles.tableRow}>
              <Text style={[styles.tableText, styles.tableRange]}>{range}</Text>
              <Text style={styles.tableText}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>{INFO_DISCLAIMER}</Text>

        <View style={styles.rule} />

        <Text style={styles.heading}>Dine data</Text>
        <Text style={styles.body}>{INFO_STORAGE}</Text>
      </ScrollView>

      {/* Ligger uden for rullefeltet, så krydset altid kan nås. */}
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Luk"
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
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: 4,
    marginHorizontal: 24,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  table: { gap: 4 },
  tableRow: { flexDirection: "row", gap: 14 },
  tableRange: { width: 76 },
  tableText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
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
