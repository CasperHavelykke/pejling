import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import type { DrinkDef, DrinkLog } from "../domain/drinks";
import {
  DEFAULT_WEIGHT_KG,
  activeUnits,
  bacAt,
  clampWeight,
  currentSession,
  drunkenness,
  levelIndex,
  minutesToZero,
  type Body,
  type Sex,
} from "../domain/widmark";
import {
  deleteDrink,
  insertDrink,
  loadDrinksSince,
  loadSettings,
  saveSetting,
} from "../storage/store";

export type Mode = "simple" | "advanced";

const TICK_MS = 30_000;
// En aften rækker aldrig længere tilbage end dette i praksis.
const LOOKBACK_MS = 7 * 24 * 3_600_000;

// Midlertidige id'er til indtag, der vises før databasen har svaret.
let tempId = -1;

export function usePejling() {
  const [ready, setReady] = useState(false);
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [weightKg, setWeightKg] = useState(DEFAULT_WEIGHT_KG);
  const [sex, setSexState] = useState<Sex>("m");
  const [mode, setModeState] = useState<Mode>("simple");
  const [now, setNow] = useState(() => Date.now());
  // Skrivninger køres i rækkefølge, så fortryd aldrig overhaler tilføj.
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const realIds = useRef(new Map<number, number>());

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [settings, drinks] = await Promise.all([
          loadSettings(),
          loadDrinksSince(Date.now() - LOOKBACK_MS),
        ]);
        if (!alive) return;
        if (settings.weightKg) setWeightKg(clampWeight(Number(settings.weightKg)));
        if (settings.sex === "f" || settings.sex === "m") setSexState(settings.sex);
        if (settings.mode === "advanced" || settings.mode === "simple") {
          setModeState(settings.mode);
        }
        setLogs(drinks);
      } catch (e) {
        console.warn("Kunne ikke læse gemte data", e);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Tallet falder over tid uden tryk: puls hvert 30. sekund, og straks
  // når appen kommer i forgrunden.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") setNow(Date.now());
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);

  const enqueue = useCallback((task: () => Promise<void>) => {
    queue.current = queue.current.then(task).catch((e) => {
      console.warn("Kunne ikke gemme", e);
    });
  }, []);

  const add = useCallback(
    (def: DrinkDef) => {
      const t = Date.now();
      const id = tempId--;
      setLogs((prev) => [...prev, { id, kind: def.kind, unitsX10: def.unitsX10, t }]);
      setNow(t);
      enqueue(async () => {
        const saved = await insertDrink(def.kind, def.unitsX10, t);
        realIds.current.set(id, saved.id);
      });
    },
    [enqueue],
  );

  const remove = useCallback(
    (id: number) => {
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setNow(Date.now());
      enqueue(async () => {
        const realId = id < 0 ? realIds.current.get(id) : id;
        if (realId !== undefined) await deleteDrink(realId);
      });
    },
    [enqueue],
  );

  const setWeight = useCallback(
    (kg: number) => {
      const next = clampWeight(kg);
      setWeightKg(next);
      enqueue(() => saveSetting("weightKg", String(next)));
    },
    [enqueue],
  );

  const setSex = useCallback(
    (next: Sex) => {
      setSexState(next);
      enqueue(() => saveSetting("sex", next));
    },
    [enqueue],
  );

  const setMode = useCallback(
    (next: Mode) => {
      setModeState(next);
      enqueue(() => saveSetting("mode", next));
    },
    [enqueue],
  );

  const derived = useMemo(() => {
    const body: Body = { weightKg, sex };
    const tonight = currentSession(logs, now, body);
    const bac = bacAt(tonight, now, body);
    return {
      // Nyeste øverst.
      tonight: [...tonight].sort((a, b) => b.t - a.t),
      totalX10: tonight.reduce((sum, l) => sum + l.unitsX10, 0),
      active: activeUnits(bac, body),
      level: levelIndex(bac),
      t: drunkenness(bac),
      minutesToZero: minutesToZero(bac),
    };
  }, [logs, now, weightKg, sex]);

  return {
    ready,
    mode,
    weightKg,
    sex,
    ...derived,
    add,
    remove,
    setWeight,
    setSex,
    setMode,
  };
}
