// Fælles ramme for drawer og info-ark: mørkt tæppe bagved, og et panel der
// glider op fra bunden. Tryk på tæppet lukker.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { strings } from "../i18n";
import { colors } from "../theme/tokens";

// Så langt eller så hurtigt skal man trække, før panelet lukker.
const CLOSE_DISTANCE = 80;
const CLOSE_VELOCITY = 0.6;
// Bevægelsen skal være tydeligt lodret, før den tæller som et træk.
const DRAG_SLOP = 6;

export function BottomPanel({
  open,
  onClose,
  children,
  style,
  draggable = false,
  canStartDrag,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  // Panelet kan trækkes ned med fingeren for at lukke.
  draggable?: boolean;
  // Spørges ved hvert træk. Bruges til at lade en liste rulle først.
  canStartDrag?: () => boolean;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(open);
  const [height, setHeight] = useState(600);

  // Nyeste værdier til PanResponder, som kun oprettes én gang.
  const latest = useRef({ onClose, canStartDrag, draggable });
  latest.current = { onClose, canStartDrag, draggable };

  useEffect(() => {
    if (open) {
      setMounted(true);
      drag.setValue(0);
    }
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? 400 : 250,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, progress, drag]);

  // Androids tilbage-knap lukker panelet frem for appen.
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [open, onClose]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => {
          const l = latest.current;
          if (!l.draggable) return false;
          const downward = g.dy > DRAG_SLOP && g.dy > Math.abs(g.dx) * 1.5;
          return downward && (l.canStartDrag?.() ?? true);
        },
        onPanResponderMove: (_e, g) => {
          drag.setValue(Math.max(0, g.dy));
        },
        onPanResponderRelease: (_e, g) => {
          if (g.dy > CLOSE_DISTANCE || g.vy > CLOSE_VELOCITY) {
            latest.current.onClose();
            return;
          }
          Animated.spring(drag, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(drag, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [drag],
  );

  if (!mounted) return null;

  const slide = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height + 40, 0],
  });

  return (
    <>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={strings().info.close}
        />
      </Animated.View>
      <Animated.View
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        accessibilityViewIsModal
        {...pan.panHandlers}
        style={[
          styles.panel,
          style,
          { transform: [{ translateY: Animated.add(slide, drag) }] },
        ]}
      >
        {children}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: colors.backdrop },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    // Afdæmpet kant: panelet skilles fra baggrunden af tæppet og skyggen.
    borderColor: colors.ringSm,
    shadowColor: "#000",
    shadowOpacity: 0.65,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 24,
  },
});
