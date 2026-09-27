import Svg, { Path } from "react-native-svg";
import { colors } from "../theme/tokens";

// Lille pil til drawer-håndtaget.
export function Chevron({ direction }: { direction: "up" | "down" }) {
  return (
    <Svg width={16} height={9} viewBox="0 0 16 9" fill="none">
      <Path
        d={direction === "up" ? "M1 8 L8 1 L15 8" : "M1 1 L8 8 L15 1"}
        stroke={colors.accentText}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
