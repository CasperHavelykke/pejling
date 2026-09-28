// Beregningen bag "aktive genstande" (Widmarks formel).
// Vejledende estimat. Ikke en promillemåler, og aldrig et svar på, om
// man må køre.

export type Sex = "m" | "f";

export const GRAMS_PER_UNIT = 12;
// Forbrænding i promille pr. time.
export const BURN_PER_HOUR = 0.15;
export const DEFAULT_WEIGHT_KG = 80;
export const MIN_WEIGHT_KG = 35;
export const MAX_WEIGHT_KG = 150;
// Aftenen ryddes, når kroppen har været i nul så længe. Tre timer er
// kort nok til, at gårsdagens liste er væk næste formiddag, og langt nok
// til, at en øl til maden og en bytur senere er samme aften.
export const SESSION_GAP_HOURS = 3;
export const SESSION_GAP_MS = SESSION_GAP_HOURS * 3_600_000;

const MS_PER_HOUR = 3_600_000;
// Under denne grænse regnes kroppen som i nul.
export const ZERO_BAC = 0.001;

export type Body = { weightKg: number; sex: Sex };

type Timed = { unitsX10: number; t: number };

export function widmarkR(sex: Sex): number {
  return sex === "f" ? 0.55 : 0.68;
}

// Promille-bidraget fra ét indtag.
function bacPerDrink(unitsX10: number, body: Body): number {
  return ((unitsX10 / 10) * GRAMS_PER_UNIT) / (body.weightKg * widmarkR(body.sex));
}

function sortByTime<T extends Timed>(logs: readonly T[]): T[] {
  return [...logs].sort((a, b) => a.t - b.t);
}

// Estimeret promille lige nu: indtag lægges til, forbrænding trækkes fra,
// og niveauet kan aldrig gå under nul mellem to indtag.
export function bacAt(logs: readonly Timed[], nowMs: number, body: Body): number {
  let bac = 0;
  let last: number | null = null;
  for (const l of sortByTime(logs)) {
    if (l.t > nowMs) break;
    if (last !== null) {
      bac = Math.max(0, bac - (BURN_PER_HOUR * (l.t - last)) / MS_PER_HOUR);
    }
    bac += bacPerDrink(l.unitsX10, body);
    last = l.t;
  }
  if (last !== null) {
    bac = Math.max(0, bac - (BURN_PER_HOUR * (nowMs - last)) / MS_PER_HOUR);
  }
  return bac;
}

// Promille omregnet til genstande, der stadig er aktive i kroppen.
export function activeUnits(bac: number, body: Body): number {
  return (bac * body.weightKg * widmarkR(body.sex)) / GRAMS_PER_UNIT;
}

// Minutter til kroppen er i nul igen.
export function minutesToZero(bac: number): number {
  return Math.max(0, Math.round((bac / BURN_PER_HOUR) * 60));
}

// 0..1, styrer baggrund og ugle. Fuldt udslag ved 2 promille.
export function drunkenness(bac: number): number {
  return Math.min(1, Math.max(0, bac / 2));
}

// Niveau 0-5. Grænserne er promille.
const LEVEL_MAX = [ZERO_BAC, 0.4, 0.8, 1.2, 1.8] as const;

export function levelIndex(bac: number): number {
  const i = LEVEL_MAX.findIndex((max) => bac < max);
  return i === -1 ? LEVEL_MAX.length : i;
}

// "I aften": den seneste sammenhængende aften. En ny aften begynder, når
// kroppen har været i nul i mere end SESSION_GAP_HOURS før næste indtag.
// Er der gået længere tid i nul siden sidste aften, er listen tom.
export function currentSession<T extends Timed>(
  logs: readonly T[],
  nowMs: number,
  body: Body,
): T[] {
  let session: T[] = [];
  let bac = 0;
  let last: number | null = null;
  for (const l of sortByTime(logs)) {
    if (l.t > nowMs) break;
    if (last !== null) {
      const zeroAt = last + (bac / BURN_PER_HOUR) * MS_PER_HOUR;
      if (l.t - zeroAt > SESSION_GAP_MS) {
        session = [];
        bac = 0;
      } else {
        bac = Math.max(0, bac - (BURN_PER_HOUR * (l.t - last)) / MS_PER_HOUR);
      }
    }
    bac += bacPerDrink(l.unitsX10, body);
    session.push(l);
    last = l.t;
  }
  if (last === null) return [];
  const zeroAt = last + (bac / BURN_PER_HOUR) * MS_PER_HOUR;
  return nowMs - zeroAt > SESSION_GAP_MS ? [] : session;
}

export function clampWeight(kg: number): number {
  if (!Number.isFinite(kg)) return DEFAULT_WEIGHT_KG;
  return Math.min(MAX_WEIGHT_KG, Math.max(MIN_WEIGHT_KG, Math.round(kg)));
}
