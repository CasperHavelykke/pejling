// Lokal lagring på telefonen (SQLite). Intet forlader enheden.
// Web-udgaven ligger i store.web.ts og bruges kun til forhåndsvisning.

import * as SQLite from "expo-sqlite";
import type { DrinkLog } from "../domain/drinks";
import type { Body } from "../domain/widmark";

// Skemaversion. Hæves med én for hver ændring af tabellerne.
const SCHEMA_VERSION = 2;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function db(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const d = await SQLite.openDatabaseAsync("pejling.db");
      await d.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS drinks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kind TEXT NOT NULL,
          units_x10 INTEGER NOT NULL,
          occurred_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS drinks_occurred_at ON drinks (occurred_at);
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      const row = await d.getFirstAsync<{ user_version: number }>(
        "PRAGMA user_version",
      );
      const version = row?.user_version ?? 0;
      if (version < 2) {
        // v2: vægt og køn gemmes med hver indtastning. En frisk database
        // har tabellen uden kolonnerne og går samme vej som en gammel.
        const cols = await d.getAllAsync<{ name: string }>(
          "PRAGMA table_info(drinks)",
        );
        const has = (name: string) => cols.some((c) => c.name === name);
        if (!has("weight_kg")) {
          await d.execAsync("ALTER TABLE drinks ADD COLUMN weight_kg INTEGER");
        }
        if (!has("sex")) {
          await d.execAsync("ALTER TABLE drinks ADD COLUMN sex TEXT");
        }
      }
      if (version < SCHEMA_VERSION) {
        await d.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
      }
      return d;
    })();
  }
  return dbPromise;
}

type Row = {
  id: number;
  kind: string;
  units_x10: number;
  occurred_at: number;
  weight_kg: number | null;
  sex: string | null;
};

export async function loadDrinksSince(sinceMs: number): Promise<DrinkLog[]> {
  const d = await db();
  const rows = await d.getAllAsync<Row>(
    "SELECT id, kind, units_x10, occurred_at, weight_kg, sex FROM drinks WHERE occurred_at >= ? ORDER BY occurred_at ASC",
    sinceMs,
  );
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    unitsX10: r.units_x10,
    t: r.occurred_at,
    weightKg: r.weight_kg,
    sex: r.sex === "m" || r.sex === "f" ? r.sex : null,
  }));
}

export async function insertDrink(
  kind: string,
  unitsX10: number,
  t: number,
  body: Body,
): Promise<DrinkLog> {
  const d = await db();
  const res = await d.runAsync(
    "INSERT INTO drinks (kind, units_x10, occurred_at, weight_kg, sex) VALUES (?, ?, ?, ?, ?)",
    kind,
    unitsX10,
    t,
    body.weightKg,
    body.sex,
  );
  return {
    id: res.lastInsertRowId,
    kind,
    unitsX10,
    t,
    weightKg: body.weightKg,
    sex: body.sex,
  };
}

// Retter vægt og køn på de nævnte indtastninger. Bruges på aftenen, der
// er i gang, når man ændrer sine indstillinger undervejs.
export async function updateDrinkBodies(
  ids: readonly number[],
  body: Body,
): Promise<void> {
  if (ids.length === 0) return;
  const d = await db();
  const marks = ids.map(() => "?").join(",");
  await d.runAsync(
    `UPDATE drinks SET weight_kg = ?, sex = ? WHERE id IN (${marks})`,
    body.weightKg,
    body.sex,
    ...ids,
  );
}

export async function deleteDrink(id: number): Promise<void> {
  const d = await db();
  await d.runAsync("DELETE FROM drinks WHERE id = ?", id);
}

export async function loadSettings(): Promise<Record<string, string>> {
  const d = await db();
  const rows = await d.getAllAsync<{ key: string; value: string }>(
    "SELECT key, value FROM settings",
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const d = await db();
  await d.runAsync(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    key,
    value,
  );
}
