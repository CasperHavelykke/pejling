// Historik: indtastninger samlet til aftener og dage.
//
// En aften hører til den dato, den startede. Indtastninger efter midnat
// lander derfor på samme dag som resten af aftenen.

import type { DrinkLog } from "./drinks";
import {
  BURN_PER_HOUR,
  GRAMS_PER_UNIT,
  SESSION_GAP_MS,
  levelIndex,
  widmarkR,
  type Body,
} from "./widmark";

const MS_PER_HOUR = 3_600_000;

export type Session = {
  // Ældste først.
  logs: DrinkLog[];
  start: number;
  end: number;
  totalX10: number;
  // Det højeste antal aktive genstande i løbet af aftenen.
  peakActive: number;
  // Niveau 1-5 ved toppen. Samme trin som statuslinjen.
  peakLevel: number;
  dayKey: string;
};

export type DaySummary = {
  dayKey: string;
  entries: number;
  totalX10: number;
  peakActive: number;
  peakLevel: number;
  start: number;
  end: number;
  // Ældste først.
  logs: DrinkLog[];
};

// Lokal dato som "2026-09-26".
export function dayKeyOf(t: number): string {
  const d = new Date(t);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// Vægt og køn fra indtastningen selv. Rækker fra før felterne fandtes
// regnes med de nuværende indstillinger.
function bodyOf(log: DrinkLog, fallback: Body): Body {
  return {
    weightKg: log.weightKg ?? fallback.weightKg,
    sex: log.sex ?? fallback.sex,
  };
}

export function buildSessions(
  logs: readonly DrinkLog[],
  fallback: Body,
): Session[] {
  const sorted = [...logs].sort((a, b) => a.t - b.t);
  const sessions: Session[] = [];
  let current: Session | null = null;
  let bac = 0;
  let peakBac = 0;
  let last = 0;

  for (const log of sorted) {
    if (current) {
      const zeroAt = last + (bac / BURN_PER_HOUR) * MS_PER_HOUR;
      if (log.t - zeroAt > SESSION_GAP_MS) {
        sessions.push(current);
        current = null;
        bac = 0;
        peakBac = 0;
      } else {
        bac = Math.max(0, bac - (BURN_PER_HOUR * (log.t - last)) / MS_PER_HOUR);
      }
    }

    const body = bodyOf(log, fallback);
    const mass = body.weightKg * widmarkR(body.sex);
    bac += ((log.unitsX10 / 10) * GRAMS_PER_UNIT) / mass;
    last = log.t;

    if (!current) {
      current = {
        logs: [],
        start: log.t,
        end: log.t,
        totalX10: 0,
        peakActive: 0,
        peakLevel: 0,
        dayKey: dayKeyOf(log.t),
      };
    }
    current.logs.push(log);
    current.end = log.t;
    current.totalX10 += log.unitsX10;
    // Toppen ligger altid lige efter en indtastning, for mellem dem
    // falder tallet kun.
    current.peakActive = Math.max(
      current.peakActive,
      (bac * mass) / GRAMS_PER_UNIT,
    );
    peakBac = Math.max(peakBac, bac);
    current.peakLevel = levelIndex(peakBac);
  }

  if (current) sessions.push(current);
  return sessions;
}

// Flere aftener kan starte samme dato, fx en frokost og en bytur. De lægges
// sammen: genstande summeres, og toppen er den højeste af dem.
export function buildDays(
  logs: readonly DrinkLog[],
  fallback: Body,
): Map<string, DaySummary> {
  const days = new Map<string, DaySummary>();
  for (const s of buildSessions(logs, fallback)) {
    const day = days.get(s.dayKey);
    if (!day) {
      days.set(s.dayKey, {
        dayKey: s.dayKey,
        entries: s.logs.length,
        totalX10: s.totalX10,
        peakActive: s.peakActive,
        peakLevel: s.peakLevel,
        start: s.start,
        end: s.end,
        logs: [...s.logs],
      });
      continue;
    }
    day.entries += s.logs.length;
    day.totalX10 += s.totalX10;
    day.peakActive = Math.max(day.peakActive, s.peakActive);
    day.peakLevel = Math.max(day.peakLevel, s.peakLevel);
    day.end = Math.max(day.end, s.end);
    day.logs.push(...s.logs);
  }
  return days;
}

export type MonthSummary = { days: number; totalX10: number };

export function monthSummary(
  days: ReadonlyMap<string, DaySummary>,
  year: number,
  month: number,
): MonthSummary {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  let count = 0;
  let totalX10 = 0;
  for (const [key, day] of days) {
    if (!key.startsWith(prefix)) continue;
    count += 1;
    totalX10 += day.totalX10;
  }
  return { days: count, totalX10 };
}
