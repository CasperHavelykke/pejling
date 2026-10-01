import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  dropRecent,
  parseCustom,
  pushRecent,
  readRecents,
} from "../domain/custom";
import type { DrinkLog } from "../domain/drinks";
import { REMINDER_INTERVAL_MS, reminderTimes } from "../domain/reminders";
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
  updateDrinkBodies,
} from "../storage/store";
import { strings, useLang } from "../i18n";
import {
  clearShownReminders,
  requestReminderPermission,
  setReminders,
} from "../notifications/reminders";

// Knappanelerne: faste knapper i to udgaver og egen indtastning.
export type Mode = "simple" | "advanced" | "custom";

const MODES: readonly Mode[] = ["simple", "advanced", "custom"];

// Det, en knap lægger i listen.
export type Entry = { kind: string; unitsX10: number };

const TICK_MS = 30_000;
// Under udvikling og i prøvebyg (profilen "preview" i eas.json) kommer
// påmindelserne efter to minutter i stedet for en time, så de kan afprøves
// uden at vente. Byg til butikkerne bruger altid en time.
const REMINDER_TEST =
  __DEV__ || process.env.EXPO_PUBLIC_REMINDER_TEST === "1";
const REMINDER_GAP_MS = REMINDER_TEST ? 2 * 60_000 : REMINDER_INTERVAL_MS;
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
  // De seneste egne indtastninger, nyeste først.
  const [recents, setRecents] = useState<string[]>([]);
  // Om brugeren har slået påmindelser til.
  const [reminders, setRemindersState] = useState(false);
  const lang = useLang();
  const [now, setNow] = useState(() => Date.now());
  // Skrivninger køres i rækkefølge, så fortryd aldrig overhaler tilføj.
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const realIds = useRef(new Map<number, number>());
  // Nyeste værdier til de funktioner, der kun oprettes én gang.
  const latest = useRef({ logs, weightKg, sex, recents });
  latest.current = { logs, weightKg, sex, recents };

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
        const savedMode = MODES.find((m) => m === settings.mode);
        if (savedMode) setModeState(savedMode);
        setRecents(readRecents(settings.recentCustom));
        setRemindersState(settings.reminders === "on");
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
      if (state !== "active") return;
      setNow(Date.now());
      // Påmindelser, der allerede er vist, er overflødige nu.
      clearShownReminders().catch(() => {});
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
    (def: Entry) => {
      const t = Date.now();
      const id = tempId--;
      const body: Body = {
        weightKg: latest.current.weightKg,
        sex: latest.current.sex,
      };
      setLogs((prev) => [
        ...prev,
        { id, kind: def.kind, unitsX10: def.unitsX10, t, ...body },
      ]);
      setNow(t);
      enqueue(async () => {
        const saved = await insertDrink(def.kind, def.unitsX10, t, body);
        realIds.current.set(id, saved.id);
      });
      if (parseCustom(def.kind)) {
        const next = pushRecent(latest.current.recents, def.kind);
        setRecents(next);
        enqueue(() => saveSetting("recentCustom", JSON.stringify(next)));
      }
    },
    [enqueue],
  );

  // Ændres vægt eller køn midt på en aften, rettes aftenens indtastninger
  // med, så tallet på skærmen og historikken er enige. Tidligere aftener
  // beholder de værdier, de blev lavet med.
  const restampTonight = useCallback(
    (body: Body) => {
      const ids = currentSession(latest.current.logs, Date.now(), body).map(
        (l) => l.id,
      );
      if (ids.length === 0) return;
      const set = new Set(ids);
      setLogs((prev) =>
        prev.map((l) => (set.has(l.id) ? { ...l, ...body } : l)),
      );
      enqueue(async () => {
        const real = ids
          .map((id) => (id < 0 ? realIds.current.get(id) : id))
          .filter((id): id is number => id !== undefined);
        await updateDrinkBodies(real, body);
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

  // Fjerner et valg fra rækken Seneste. Aftenens indtastninger røres ikke.
  const removeRecent = useCallback(
    (kind: string) => {
      const next = dropRecent(latest.current.recents, kind);
      setRecents(next);
      enqueue(() => saveSetting("recentCustom", JSON.stringify(next)));
    },
    [enqueue],
  );

  const setWeight = useCallback(
    (kg: number) => {
      const next = clampWeight(kg);
      setWeightKg(next);
      enqueue(() => saveSetting("weightKg", String(next)));
      restampTonight({ weightKg: next, sex: latest.current.sex });
    },
    [enqueue, restampTonight],
  );

  const setSex = useCallback(
    (next: Sex) => {
      setSexState(next);
      enqueue(() => saveSetting("sex", next));
      restampTonight({ weightKg: latest.current.weightKg, sex: next });
    },
    [enqueue, restampTonight],
  );

  const setMode = useCallback(
    (next: Mode) => {
      setModeState(next);
      enqueue(() => saveSetting("mode", next));
    },
    [enqueue],
  );

  // Slår påmindelser til eller fra. Svarer falsk, hvis telefonen ikke giver
  // lov, og så forbliver de slået fra.
  const setRemindersOn = useCallback(
    async (next: boolean): Promise<boolean> => {
      if (next) {
        const allowed = await requestReminderPermission(
          strings().reminder.channel,
        ).catch(() => false);
        if (!allowed) return false;
      }
      setRemindersState(next);
      enqueue(() => saveSetting("reminders", next ? "on" : "off"));
      return true;
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

  // Planlagte påmindelser følger aftenens indtastninger: hver ny, fortrudt
  // eller ændret indtastning regner tiderne forfra. Tallet til nul læses i
  // det øjeblik og indgår ikke som afhængighed, for det ændrer sig hele tiden.
  const lastEntryAt = derived.tonight[0]?.t ?? null;
  const entryCount = derived.tonight.length;
  const minutesLeft = useRef(derived.minutesToZero);
  minutesLeft.current = derived.minutesToZero;
  useEffect(() => {
    if (!ready) return;
    const text = strings().reminder;
    const times = reminders
      ? reminderTimes({
          lastEntryAt,
          now: Date.now(),
          minutesToZero: minutesLeft.current,
          intervalMs: REMINDER_GAP_MS,
        })
      : [];
    setReminders(times, text).catch((e) => {
      console.warn("Kunne ikke planlægge påmindelser", e);
    });
  }, [ready, reminders, lastEntryAt, entryCount, weightKg, sex, lang]);

  return {
    ready,
    mode,
    recents,
    reminders,
    weightKg,
    sex,
    ...derived,
    add,
    remove,
    removeRecent,
    setWeight,
    setSex,
    setMode,
    setReminders: setRemindersOn,
  };
}
