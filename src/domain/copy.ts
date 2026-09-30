// Tekster pr. niveau (0-5). Status-linjen er informativ; uglen håner.
// Selve ordene ligger pr. sprog i src/i18n.

import { strings } from "../i18n";
import { da } from "./format";
import { burnUnitsPerHour, levelThresholds, type Body } from "./widmark";

export function statusFor(level: number): string {
  const list = strings().status;
  return list[Math.min(Math.max(level, 0), list.length - 1)];
}

// Teksten skifter ved hvert tryk, fordi antallet indgår i valget.
export function roastFor(level: number, drinkCount: number): string {
  const all = strings().roasts;
  const list = all[Math.min(level, all.length - 1)];
  return list[(drinkCount + level) % list.length];
}

// Navn på niveau 1-5.
export function levelName(level: number): string {
  const names = strings().levelNames;
  return names[Math.min(names.length, Math.max(1, level)) - 1];
}

// Tabellen i info-arket. Grænserne vises som aktive genstande for brugerens
// egen vægt og køn. Appen viser aldrig promille.
export function levelRows(body: Body): (readonly [string, string])[] {
  const s = strings();
  const t = levelThresholds(body).map((n) => da(n));
  return s.levelNames.map((name, i) => {
    if (i === 0) return [s.rangeUpTo(t[0]), name] as const;
    if (i === s.levelNames.length - 1) {
      return [s.rangeOver(t[i - 1]), name] as const;
    }
    return [`${t[i - 1]}–${t[i]}`, name] as const;
  });
}

export function infoExplanation(body: Body): string {
  return strings().infoExplanation(da(burnUnitsPerHour(body)));
}
