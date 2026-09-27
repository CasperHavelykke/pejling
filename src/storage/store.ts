// Lokal lagring på telefonen (SQLite). Intet forlader enheden.
// Web-udgaven ligger i store.web.ts og bruges kun til forhåndsvisning.

import * as SQLite from "expo-sqlite";
import type { DrinkLog } from "../domain/drinks";

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
      return d;
    })();
  }
  return dbPromise;
}

type Row = { id: number; kind: string; units_x10: number; occurred_at: number };

export async function loadDrinksSince(sinceMs: number): Promise<DrinkLog[]> {
  const d = await db();
  const rows = await d.getAllAsync<Row>(
    "SELECT id, kind, units_x10, occurred_at FROM drinks WHERE occurred_at >= ? ORDER BY occurred_at ASC",
    sinceMs,
  );
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    unitsX10: r.units_x10,
    t: r.occurred_at,
  }));
}

export async function insertDrink(
  kind: string,
  unitsX10: number,
  t: number,
): Promise<DrinkLog> {
  const d = await db();
  const res = await d.runAsync(
    "INSERT INTO drinks (kind, units_x10, occurred_at) VALUES (?, ?, ?)",
    kind,
    unitsX10,
    t,
  );
  return { id: res.lastInsertRowId, kind, unitsX10, t };
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
