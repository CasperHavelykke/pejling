// Genstandstyper. Enheder regnes i TIENDEDELE genstande (×10) som heltal,
// så 0,7 + 2,3 ikke giver flydende-komma-støj. Mønstret er arvet fra Loggen.
// 1 genstand = 12 g ren alkohol.

export type DrinkCategory = "beer" | "drink" | "shot";

export type DrinkKind =
  // Simpel
  | "øl"
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
  | "shot"
  | "shot2"
  | "shot2Strong"
  | "shot4"
  | "shot4Strong";

export type DrinkDef = {
  kind: DrinkKind;
  category: DrinkCategory;
  icon: DrinkIconKey;
  // Fuldt navn, vises i listen "I aften".
  name: string;
  // Kort navn på knappen.
  label: string;
  // Undertekst på knappen.
  sub: string;
  unitsX10: number;
};

export const SIMPLE_DRINKS: readonly DrinkDef[] = [
  { kind: "øl", category: "beer", icon: "bottle", name: "Øl", label: "Øl", sub: "1 genstand", unitsX10: 10 },
  { kind: "drink", category: "drink", icon: "cocktail", name: "Drink", label: "Drink", sub: "1,5 genstand", unitsX10: 15 },
  { kind: "shot", category: "shot", icon: "shot", name: "Shot", label: "Shot", sub: "1 genstand", unitsX10: 10 },
];

export const ADVANCED_DRINKS: readonly DrinkDef[] = [
  { kind: "øl_alm_33", category: "beer", icon: "bottle", name: "Alm. øl 33 cl", label: "Alm.", sub: "33 cl · 1", unitsX10: 10 },
  { kind: "øl_stærk_33", category: "beer", icon: "bottle", name: "Stærk øl 33 cl", label: "Stærk", sub: "33 cl · 1,5", unitsX10: 15 },
  { kind: "øl_alm_50", category: "beer", icon: "mug", name: "Alm. øl 50 cl", label: "Alm.", sub: "50 cl · 1,5", unitsX10: 15 },
  { kind: "øl_stærk_50", category: "beer", icon: "mug", name: "Stærk øl 50 cl", label: "Stærk", sub: "50 cl · 2,3", unitsX10: 23 },
  { kind: "drink_mild", category: "drink", icon: "cocktailMild", name: "Mild drink", label: "Mild", sub: "1 gs.", unitsX10: 10 },
  { kind: "drink_alm", category: "drink", icon: "cocktailMedium", name: "Alm. drink", label: "Alm.", sub: "1,5 gs.", unitsX10: 15 },
  { kind: "drink_stærk", category: "drink", icon: "cocktailStrong", name: "Stærk drink", label: "Stærk", sub: "2 gs.", unitsX10: 20 },
  { kind: "shot_alm_2", category: "shot", icon: "shot2", name: "Alm. shot 2 cl", label: "Alm.", sub: "2 cl · 0,5", unitsX10: 5 },
  { kind: "shot_stærk_2", category: "shot", icon: "shot2Strong", name: "Stærk shot 2 cl", label: "Stærk", sub: "2 cl · 0,7", unitsX10: 7 },
  { kind: "shot_alm_4", category: "shot", icon: "shot4", name: "Alm. shot 4 cl", label: "Alm.", sub: "4 cl · 1", unitsX10: 10 },
  { kind: "shot_stærk_4", category: "shot", icon: "shot4Strong", name: "Stærk shot 4 cl", label: "Stærk", sub: "4 cl · 1,4", unitsX10: 14 },
];

export const ADVANCED_GROUPS: readonly {
  title: string;
  category: DrinkCategory;
  items: readonly DrinkDef[];
}[] = (
  [
    ["Øl", "beer"],
    ["Drinks", "drink"],
    ["Shots", "shot"],
  ] as const
).map(([title, category]) => ({
  title,
  category,
  items: ADVANCED_DRINKS.filter((d) => d.category === category),
}));

const BY_KIND = new Map<string, DrinkDef>(
  [...SIMPLE_DRINKS, ...ADVANCED_DRINKS].map((d) => [d.kind, d]),
);

export function drinkDef(kind: string): DrinkDef | undefined {
  return BY_KIND.get(kind);
}

// Navn til visning. Ukendte typer (fx fra en nyere app-version) vises råt
// frem for at vælte listen.
export function drinkName(kind: string): string {
  return BY_KIND.get(kind)?.name ?? kind;
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
