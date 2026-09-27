// Web-udgave af lagringen, kun til forhåndsvisning i browseren under
// udvikling. Samme funktioner som store.ts, men oven på localStorage.

import type { DrinkLog } from "../domain/drinks";

const DRINKS_KEY = "pejling.drinks";
const SETTINGS_KEY = "pejling.settings";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Privat vindue eller fuld kvote: appen virker stadig i hukommelsen.
  }
}

export async function loadDrinksSince(sinceMs: number): Promise<DrinkLog[]> {
  return read<DrinkLog[]>(DRINKS_KEY, [])
    .filter((d) => d.t >= sinceMs)
    .sort((a, b) => a.t - b.t);
}

export async function insertDrink(
  kind: string,
  unitsX10: number,
  t: number,
): Promise<DrinkLog> {
  const all = read<DrinkLog[]>(DRINKS_KEY, []);
  const id = all.reduce((max, d) => Math.max(max, d.id), 0) + 1;
  const log: DrinkLog = { id, kind, unitsX10, t };
  write(DRINKS_KEY, [...all, log]);
  return log;
}

export async function deleteDrink(id: number): Promise<void> {
  write(
    DRINKS_KEY,
    read<DrinkLog[]>(DRINKS_KEY, []).filter((d) => d.id !== id),
  );
}

export async function loadSettings(): Promise<Record<string, string>> {
  return read<Record<string, string>>(SETTINGS_KEY, {});
}

export async function saveSetting(key: string, value: string): Promise<void> {
  write(SETTINGS_KEY, { ...read<Record<string, string>>(SETTINGS_KEY, {}), [key]: value });
}
