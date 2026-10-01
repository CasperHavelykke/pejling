// Knappanelerne ligger side om side og skiftes med et swipe: Simpel først,
// så Avanceret, og til sidst egen indtastning. Prikkerne under panelet viser, hvor man er, og kan
// trykkes på, så panelet også kan skiftes uden at swipe.
//
// Panelerne er ikke lige høje. Feltets højde følger fingeren, så resten af
// skærmen glider med i stedet for at springe. Skærmen regner højden ud og
// giver den med, fordi ugle og luft skal følge samme bevægelse.

import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import type { Body } from "../domain/widmark";
import type { Entry } from "../state/usePejling";
import { colors, space } from "../theme/tokens";
import { CustomPanel } from "./CustomPanel";
import { AdvancedButtons, SimpleButtons } from "./DrinkButtons";

export function DrinkPager({
  scrollX,
  width,
  height,
  onHeight,
  page,
  labels,
  recents,
  body,
  onRemoveRecent,
  onPage,
  onAdd,
}: {
  // Vandret position i punkter. Ejes af skærmen, som også bruger den til
  // at lade ugle og luft følge med.
  scrollX: Animated.Value;
  // Ét panels bredde, lig med skærmens.
  width: number;
  // Feltets højde lige nu. Mangler, indtil alle paneler er målt.
  height: Animated.AnimatedInterpolation<number> | undefined;
  // Melder et panels egen højde.
  onHeight: (page: number, height: number) => void;
  // Det gemte panel. Bruges ved start og til at markere den valgte prik.
  page: number;
  // Navn på hvert panel, til skærmlæsere.
  labels: readonly string[];
  // De seneste egne indtastninger, til det tredje panel.
  recents: readonly string[];
  // Vægt og køn, til det tredje panel.
  body: Body;
  onRemoveRecent: (kind: string) => void;
  onPage: (page: number) => void;
  onAdd: (entry: Entry) => void;
}) {
  const ref = useRef<ScrollView>(null);
  const measured = height !== undefined;
  const settled = useRef(page);

  // Start på det gemte panel uden animation.
  useEffect(() => {
    scrollX.setValue(page * width);
    ref.current?.scrollTo({ x: page * width, animated: false });
    settled.current = page;
    // Kun ved start og hvis skærmens bredde ændrer sig. Skift undervejs
    // kommer fra fingeren eller prikkerne og skal ikke rulle en gang til.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  // Panelet regnes som skiftet, når det ligger stille på en hel side.
  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x;
    const nearest = Math.round(x / width);
    if (Math.abs(x - nearest * width) > 1) return;
    if (nearest !== settled.current) {
      settled.current = nearest;
      onPage(nearest);
    }
  }

  const panels = [
    <SimpleButtons key="simple" onAdd={onAdd} />,
    <AdvancedButtons key="advanced" onAdd={onAdd} />,
    <CustomPanel
      key="custom"
      recents={recents}
      body={body}
      onAdd={onAdd}
      onRemoveRecent={onRemoveRecent}
    />,
  ];

  return (
    <View>
      <Animated.View
        style={[styles.window, { height, opacity: measured ? 1 : 0 }]}
      >
        <Animated.ScrollView
          ref={ref}
          horizontal
          pagingEnabled
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentOffset={{ x: page * width, y: 0 }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false, listener: onScroll },
          )}
        >
          {panels.map((panel, i) => (
            // Panelet står på bunden af feltet. Feltet når det høje
            // panels højde tidligt i et swipe, så toppen ikke er skjult.
            <Animated.View key={i} style={[styles.page, { width, height }]}>
              <View
                onLayout={(e) => onHeight(i, e.nativeEvent.layout.height)}
              >
                {panel}
              </View>
            </Animated.View>
          ))}
        </Animated.ScrollView>
      </Animated.View>

      <View style={styles.dots} accessibilityRole="tablist">
        {labels.map((label, i) => (
          <Pressable
            key={label}
            onPress={() =>
              ref.current?.scrollTo({ x: i * width, animated: true })
            }
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: i === page }}
            hitSlop={{ top: 10, bottom: 10 }}
            style={styles.dotTarget}
          >
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: scrollX.interpolate({
                    inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Feltet går helt ud til skærmens kanter, så et panel glider ud af
  // skærmen og ikke bliver skåret af ved skærmens indre margen.
  window: { marginHorizontal: -space.side, overflow: "hidden" },
  page: {
    paddingHorizontal: space.side,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  // Selve prikken er lille; feltet om den er trykmålet.
  dotTarget: {
    width: 28,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text,
  },
});
