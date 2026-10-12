// Tekster pr. niveau (0-5). Status-linjen er informativ; uglen håner.
// Selve ordene ligger pr. sprog i src/i18n.

import { strings } from "../i18n";
import { da } from "./format";
import { burnUnitsPerHour, levelThresholds, type Body } from "./widmark";

export function statusFor(level: number): string {
  const list = strings().status;
  return list[Math.min(Math.max(level, 0), list.length - 1)];
}

// Så mange aktive genstande når ingen ved et uheld. Står tallet der,
// er appen ved at blive prøvet af, og uglen viser vej til Ryd i skuffen,
// så listen ikke hænger i dagevis.
export const TEST_HINT_UNITS = 20;

// Rundes som tallet på skærmen, så hintet og tallet er enige.
export function isTestHint(activeUnits: number): boolean {
  return Math.round(activeUnits * 10) / 10 >= TEST_HINT_UNITS;
}

// Teksten skifter ved hvert tryk, fordi antallet indgår i valget.
export function roastFor(
  level: number,
  drinkCount: number,
  activeUnits = 0,
): string {
  if (isTestHint(activeUnits)) return strings().testHint;
  const all = strings().roasts;
  const list = all[Math.min(level, all.length - 1)];
  return list[(drinkCount + level) % list.length];
}

// Forklaringen efter tankestregen i statuslinjen, fx "Hæmningerne falder,
// og det gør dømmekraften også", med stort begyndelsesbogstav, så den kan
// stå alene i uglens boble. Navnet står for sig i levelName.
export function statusDetail(level: number): string {
  const text = statusFor(level);
  const split = text.indexOf(" – ");
  const detail = split === -1 ? text : text.slice(split + 3);
  return detail.charAt(0).toUpperCase() + detail.slice(1);
}

// Hvor på en skala med fem lige brede felter tallet ligger, 0..1. Feltet
// for niveau i går fra grænsen under til grænsen over; det øverste felt
// er lige så bredt som det under, fordi det ingen øvre grænse har.
export function scalePosition(active: number, thresholds: number[]): number {
  const edges = [0, ...thresholds];
  const n = thresholds.length + 1;
  const last = edges[edges.length - 1];
  edges.push(last + (last - edges[edges.length - 2]));
  let i = 0;
  while (i < n - 1 && active >= edges[i + 1]) i++;
  const within = (active - edges[i]) / (edges[i + 1] - edges[i]);
  return Math.min(1, Math.max(0, (i + Math.min(1, Math.max(0, within))) / n));
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
