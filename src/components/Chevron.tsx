import Svg, { Path } from "react-native-svg";
import { colors } from "../theme/tokens";

const PATHS = {
  up: "M1 8 L8 1 L15 8",
  down: "M1 1 L8 8 L15 1",
  left: "M8 1 L1 8 L8 15",
  right: "M1 1 L8 8 L1 15",
} as const;

// Lille pil til håndtag og navigation.
export function Chevron({
  direction,
  color = colors.accentText,
}: {
  direction: keyof typeof PATHS;
  color?: string;
}) {
  const vertical = direction === "up" || direction === "down";
  const w = vertical ? 16 : 9;
  const h = vertical ? 9 : 16;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <Path
        d={PATHS[direction]}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
