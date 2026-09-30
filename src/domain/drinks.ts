// Genstandstyper. Enheder regnes i TIENDEDELE genstande (×10) som heltal,
// så 0,7 + 2,3 ikke giver flydende-komma-støj. Mønstret er arvet fra Loggen.
// 1 genstand = 12 g ren alkohol.
//
// Nøglerne er danske og ligger i databasen. De må ikke ændres. Navnene,
// brugeren ser, ligger pr. sprog i src/i18n.

import { strings } from "../i18n";
import type { DrinkText } from "../i18n/types";

export type DrinkCategory = "beer" | "wine" | "drink" | "shot";

export type DrinkKind =
  // Simpel
  | "øl"
  | "vin"
  | "drink"
  | "shot"
  // Avanceret
  | "øl_alm_33"
  | "øl_stærk_33"
  | "øl_alm_50"
  | "øl_stærk_50"
  | "drink_mild"
  | "drink_alm"
  | "drink_stærk"
  | "vin_15"
  | "shot_alm_2"
  | "shot_stærk_2"
  | "shot_alm_4"
  | "shot_stærk_4";

export type DrinkIconKey =
  | "bottle"
  | "mug"
  | "cocktail"
  | "cocktailMild"
  | "cocktailMedium"
  | "cocktailStrong"
  | "wine"
  | "shot"
  | "shot2"
  | "shot2Strong"
  | "shot4"
  | "shot4Strong";

export type DrinkDef = {
  kind: DrinkKind;
  category: DrinkCategory;
  icon: DrinkIconKey;
  unitsX10: number;
};

export const SIMPLE_DRINKS: readonly DrinkDef[] = [
  { kind: "øl", category: "beer", icon: "bottle", unitsX10: 10 },
  // Et almindeligt glas: 15 cl ved 12,5 % er ca. 14,8 g alkohol.
  { kind: "vin", category: "wine", icon: "wine", unitsX10: 12 },
  { kind: "drink", category: "drink", icon: "cocktail", unitsX10: 15 },
  { kind: "shot", category: "shot", icon: "shot", unitsX10: 10 },
];

export const ADVANCED_DRINKS: readonly DrinkDef[] = [
  { kind: "øl_alm_33", category: "beer", icon: "bottle", unitsX10: 10 },
  { kind: "øl_stærk_33", category: "beer", icon: "bottle", unitsX10: 15 },
  { kind: "øl_alm_50", category: "beer", icon: "mug", unitsX10: 15 },
  { kind: "øl_stærk_50", category: "beer", icon: "mug", unitsX10: 23 },
  { kind: "drink_mild", category: "drink", icon: "cocktailMild", unitsX10: 10 },
  { kind: "drink_alm", category: "drink", icon: "cocktailMedium", unitsX10: 15 },
  { kind: "drink_stærk", category: "drink", icon: "cocktailStrong", unitsX10: 20 },
  { kind: "vin_15", category: "wine", icon: "wine", unitsX10: 12 },
  { kind: "shot_alm_2", category: "shot", icon: "shot2", unitsX10: 5 },
  { kind: "shot_stærk_2", category: "shot", icon: "shot2Strong", unitsX10: 7 },
  { kind: "shot_alm_4", category: "shot", icon: "shot4", unitsX10: 10 },
  { kind: "shot_stærk_4", category: "shot", icon: "shot4Strong", unitsX10: 14 },
];

export type GroupKey = "beer" | "drink" | "shot";

// Vin har kun én knap i Avanceret og deler derfor række med drinks.
export const ADVANCED_GROUPS: readonly {
  key: GroupKey;
  items: readonly DrinkDef[];
}[] = (
  [
    ["beer", ["beer"]],
    ["drink", ["drink", "wine"]],
    ["shot", ["shot"]],
  ] as const
).map(([key, categories]) => ({
  key,
  items: ADVANCED_DRINKS.filter((d) =>
    (categories as readonly DrinkCategory[]).includes(d.category),
  ),
}));

export function groupTitle(key: GroupKey): string {
  return strings().groups[key];
}

const BY_KIND = new Map<string, DrinkDef>(
  [...SIMPLE_DRINKS, ...ADVANCED_DRINKS].map((d) => [d.kind, d]),
);

export function drinkDef(kind: string): DrinkDef | undefined {
  return BY_KIND.get(kind);
}

// Knappens tekster på det valgte sprog.
export function drinkText(kind: DrinkKind): DrinkText {
  return strings().drinks[kind];
}

// Navn til visning. Ukendte typer (fx fra en nyere app-version) vises råt
// frem for at vælte listen.
export function drinkName(kind: string): string {
  const def = BY_KIND.get(kind);
  return def ? drinkText(def.kind).name : kind;
}

// En indtastning, som den ligger i databasen.
export type DrinkLog = {
  id: number;
  kind: string;
  unitsX10: number;
  // Tidspunkt i ms siden epoch.
  t: number;
  // Vægt og køn, da indtastningen blev lavet. Gamle aftener ændrer sig
  // derfor ikke, når man senere retter sine indstillinger. Mangler på
  // rækker fra før feltet fandtes.
  weightKg: number | null;
  sex: "m" | "f" | null;
};
