// Egen indtastning: brugeren vælger type, størrelse og styrke, og appen
// regner selv om til genstande.
//
// En egen indtastning gemmes som en almindelig indtastning. Typen står i
// nøglen, fx "egen:beer:440:55" for en øl på 44 cl og 5,5 %. Størrelse og
// styrke står i tiendedele, så nøglen kun indeholder heltal. Dermed kræves
// der ingen ændring af databasen.

import { GRAMS_PER_UNIT } from "./widmark";

export type CustomType = "beer" | "wine" | "spirit";

export const CUSTOM_TYPES: readonly CustomType[] = ["beer", "wine", "spirit"];

export type CustomDrink = {
  type: CustomType;
  // Størrelse i centiliter.
  cl: number;
  // Styrke i volumenprocent.
  abv: number;
};

// Det, panelet står på, når man vælger en type første gang.
export const CUSTOM_DEFAULTS: Record<CustomType, { cl: number; abv: number }> = {
  beer: { cl: 33, abv: 4.6 },
  wine: { cl: 15, abv: 12.5 },
  spirit: { cl: 4, abv: 40 },
};

// Plus og minus springer mellem de størrelser, man faktisk får serveret,
// i stedet for at tælle én centiliter ad gangen.
const SIZES: Record<CustomType, readonly number[]> = {
  beer: [20, 25, 30, 33, 40, 44, 50, 57, 60, 66, 75, 100],
  wine: [8, 10, 12, 15, 18, 20, 25, 37, 50, 75],
  spirit: [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20],
};

const STRENGTHS: Record<CustomType, { min: number; max: number; step: number }> = {
  beer: { min: 0.5, max: 15, step: 0.5 },
  wine: { min: 5, max: 22, step: 0.5 },
  spirit: { min: 10, max: 80, step: 2.5 },
};

const ETHANOL_GRAMS_PER_ML = 0.789;
const PREFIX = "egen";
const MAX_RECENT = 3;

// Genstande i tiendedele. Aldrig under 0,1, så et tryk altid tæller.
export function customUnitsX10({ cl, abv }: Pick<CustomDrink, "cl" | "abv">): number {
  const grams = cl * 10 * (abv / 100) * ETHANOL_GRAMS_PER_ML;
  return Math.max(1, Math.round((grams / GRAMS_PER_UNIT) * 10));
}

export function customKind({ type, cl, abv }: CustomDrink): string {
  return `${PREFIX}:${type}:${Math.round(cl * 10)}:${Math.round(abv * 10)}`;
}

export function parseCustom(kind: string): CustomDrink | null {
  const [prefix, type, cl, abv, ...rest] = kind.split(":");
  if (prefix !== PREFIX || rest.length > 0) return null;
  if (!CUSTOM_TYPES.includes(type as CustomType)) return null;
  const clX10 = Number(cl);
  const abvX10 = Number(abv);
  if (!Number.isInteger(clX10) || !Number.isInteger(abvX10)) return null;
  if (clX10 <= 0 || abvX10 <= 0 || abvX10 > 1000) return null;
  return { type: type as CustomType, cl: clX10 / 10, abv: abvX10 / 10 };
}

// Næste størrelse op eller ned. Står man på den yderste, bliver man der.
export function stepSize(type: CustomType, cl: number, direction: 1 | -1): number {
  const sizes = SIZES[type];
  if (direction === 1) return sizes.find((s) => s > cl) ?? sizes[sizes.length - 1];
  return [...sizes].reverse().find((s) => s < cl) ?? sizes[0];
}

// Næste hele trin op eller ned. En styrke uden for trinene, som øllens
// 4,6 %, lander på nærmeste trin i den retning, man trykker.
export function stepStrength(type: CustomType, abv: number, direction: 1 | -1): number {
  const { min, max, step } = STRENGTHS[type];
  const position = abv / step;
  const next =
    direction === 1
      ? (Math.floor(position + 1e-9) + 1) * step
      : (Math.ceil(position - 1e-9) - 1) * step;
  return Math.min(max, Math.max(min, Math.round(next * 10) / 10));
}

export function atSizeLimit(type: CustomType, cl: number, direction: 1 | -1): boolean {
  return stepSize(type, cl, direction) === cl;
}

export function atStrengthLimit(type: CustomType, abv: number, direction: 1 | -1): boolean {
  return stepStrength(type, abv, direction) === abv;
}

// Listen "Seneste": nyeste først, uden gentagelser, højst tre.
export function pushRecent(recents: readonly string[], kind: string): string[] {
  return [kind, ...recents.filter((k) => k !== kind)].slice(0, MAX_RECENT);
}

// Fjerner ét valg fra listen.
export function dropRecent(recents: readonly string[], kind: string): string[] {
  return recents.filter((k) => k !== kind);
}

// Læser den gemte liste. Alt, der ikke er gyldige egne indtastninger,
// kasseres frem for at vælte appen.
export function readRecents(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .filter((k): k is string => typeof k === "string" && parseCustom(k) !== null)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}
