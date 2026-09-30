// Appens sprog. Valget ligger ét sted, så både skærme og de rene
// funktioner i domain læser det samme. Filen importerer ikke noget fra
// telefonen og kan derfor bruges i tests.

import { useSyncExternalStore } from "react";
import { da } from "./da";
import { en } from "./en";
import type { Lang, Strings } from "./types";

export type { Lang, Strings } from "./types";

const SETS: Record<Lang, Strings> = { da, en };

let current: Lang = "da";
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  if (lang === current) return;
  current = lang;
  listeners.forEach((l) => l());
}

export function strings(): Strings {
  return SETS[current];
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Skærme, der bruger denne, tegnes igen, når sproget skifter.
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, getLang);
}

export function useStrings(): Strings {
  return SETS[useLang()];
}

export function isLang(value: unknown): value is Lang {
  return value === "da" || value === "en";
}

// Dansk til dem, der læser dansk uden besvær. Alle andre får engelsk.
const READS_DANISH = new Set(["da", "nb", "nn", "no", "sv"]);

export function langForDevice(languageCode: string | null | undefined): Lang {
  return languageCode && READS_DANISH.has(languageCode.toLowerCase())
    ? "da"
    : "en";
}
