import { mixOklch } from "./color";
import { colors } from "./tokens";

// Ét farvetrin pr. niveau 1-5: samme farvetone som hovedtallet, fra svag
// til kraftig. Bruges i historikkens kalender og i info-arkets skala, så
// de to steder fortæller det samme. Teksten skifter til mørk på de to
// lyseste trin, så den altid kan læses.
export const LEVEL_STEPS = [0.22, 0.36, 0.5, 0.72, 0.9].map((p, i) => ({
  fill: mixOklch(colors.bg, colors.num, p),
  ink: i >= 3 ? colors.inkOnLight : colors.text,
}));

export function stepFor(level: number) {
  return LEVEL_STEPS[Math.min(LEVEL_STEPS.length, Math.max(1, level)) - 1];
}
