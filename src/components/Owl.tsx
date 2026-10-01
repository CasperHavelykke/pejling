// Uglen. Bygget af simple former som i prototypen og tænkt som pladsholder,
// til der findes en rigtig illustration. Én værdi t (0..1) styrer alt:
// øjenlåg falder, pupiller skæver, kinder rødmer, kroppen hælder.

import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";
import { colors } from "../theme/tokens";

const W = 120;
const H = 130;
const EYE = 38;

// Ørerne er trekanter, der stikker op bag kroppen. Foden af hver trekant
// ligger et godt stykke inde under kroppen, så ørets yderkant løber lige
// ind i kroppens kant uden et hak.
const EAR_LEFT = "M7,60 L12.4,9 Q13,3 18.4,5.6 L42,17 Z";
const EAR_RIGHT = "M113,60 L107.6,9 Q107,3 101.6,5.6 L78,17 Z";

// Øjenlågene falder hurtigt i starten og langsommere, jo tættere de er på
// bunden. Kurven er 1 - (1 - t)², lagt ud i fem punkter.
const LID_MAX = EYE * 0.62 + 1;
const LID_STEPS = [0, 0.25, 0.5, 0.75, 1];
const LID_HEIGHTS = LID_STEPS.map((t) => (1 - (1 - t) ** 2) * LID_MAX);

// Øjets farve: hvidt, når uglen er ædru, og gradvist mere rødsprængt.
const EYE_CLEAR = "rgb(243, 245, 254)";
const EYE_RED = "rgb(240, 158, 168)";

// Kroppen: bred, rund top og lidt fladere bund.
const BODY_PATH =
  "M0,76 A60,66 0 0 1 60,10 A60,66 0 0 1 120,76 A55.2,54 0 0 1 64.8,130 L55.2,130 A55.2,54 0 0 1 0,76 Z";

function useAnimatedTo(target: number, duration: number) {
  const value = useRef(new Animated.Value(target)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: target,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [target, duration, value]);
  return value;
}

function Eye({
  side,
  t,
  dx,
  dy,
}: {
  side: "left" | "right";
  t: Animated.Value;
  dx: number;
  dy: number;
}) {
  return (
    <View style={[styles.eye, side === "left" ? { left: 17 } : { right: 17 }]}>
      <Animated.View
        style={[
          styles.eyeWhite,
          {
            backgroundColor: t.interpolate({
              inputRange: [0, 1],
              outputRange: [EYE_CLEAR, EYE_RED],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.pupil,
          {
            transform: [
              { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
              { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.lid,
          {
            height: t.interpolate({
              inputRange: LID_STEPS,
              outputRange: LID_HEIGHTS,
            }),
          },
        ]}
      />
    </View>
  );
}

export function Owl({
  t,
  scale: as,
}: {
  t: number;
  // Animeret, så uglen kan følge fingeren, når knappanelet swipes.
  scale: Animated.AnimatedInterpolation<number>;
}) {
  const at = useAnimatedTo(t, 500);
  const cheek = at.interpolate({
    inputRange: [0, 0.625, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Ugle"
      style={{
        width: Animated.multiply(as, W),
        height: Animated.multiply(as, H),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          width: W,
          height: H,
          transform: [
            { scale: as },
            {
              rotate: at.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "7deg"],
              }),
            },
          ],
        }}
      >
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          {/* Stregen i samme farve runder trekanternes spidser en smule. */}
          <Path
            d={EAR_LEFT}
            fill={colors.owlBody}
            stroke={colors.owlBody}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <Path
            d={EAR_RIGHT}
            fill={colors.owlBody}
            stroke={colors.owlBody}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <Path d={BODY_PATH} fill={colors.owlBody} />
          <Ellipse cx={60} cy={94} rx={30} ry={26} fill={colors.owlBelly} />
        </Svg>
        <Eye side="left" t={at} dx={5} dy={4} />
        <Eye side="right" t={at} dx={-3} dy={5} />
        <View style={styles.beak} />
        <Animated.View style={[styles.cheek, { left: 10, opacity: cheek }]}>
          <Svg width={18} height={10}>
            <Ellipse cx={9} cy={5} rx={9} ry={5} fill={colors.owlCheek} />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.cheek, { right: 10, opacity: cheek }]}>
          <Svg width={18} height={10}>
            <Ellipse cx={9} cy={5} rx={9} ry={5} fill={colors.owlCheek} />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Rammen er et punkt større end det hvide hele vejen rundt og har ingen
  // farve selv. Øjenlåget dækker helt ud til rammens kant, så den runde
  // kant blander lågets farve med kroppens, som er den samme. Dermed står
  // der ingen lys ring tilbage om øjet.
  eye: {
    position: "absolute",
    top: 27,
    width: EYE + 2,
    height: EYE + 2,
    borderRadius: (EYE + 2) / 2,
    overflow: "hidden",
  },
  eyeWhite: {
    position: "absolute",
    left: 1,
    top: 1,
    width: EYE,
    height: EYE,
    borderRadius: EYE / 2,
  },
  pupil: {
    position: "absolute",
    left: 12,
    top: 12,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.owlPupil,
  },
  lid: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    // Lige underkant hele vejen ned. Øjets runde form klipper siderne.
    backgroundColor: colors.owlBody,
  },
  beak: {
    position: "absolute",
    left: 53,
    top: 58,
    width: 14,
    height: 14,
    borderRadius: 3.5,
    backgroundColor: colors.owlBeak,
    transform: [{ rotate: "45deg" }],
  },
  cheek: {
    position: "absolute",
    top: 60,
    width: 18,
    height: 10,
  },
});
