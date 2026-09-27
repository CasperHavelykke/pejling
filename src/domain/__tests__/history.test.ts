import type { DrinkLog } from "../drinks";
import {
  addMonths,
  compareMonths,
  longDate,
  monthGrid,
  monthTitle,
} from "../calendar";
import { buildDays, buildSessions, dayKeyOf, monthSummary } from "../history";
import type { Body } from "../widmark";

const H = 3_600_000;
const man80: Body = { weightKg: 80, sex: "m" };

let nextId = 1;
function log(
  t: number,
  unitsX10: number,
  body: Partial<Pick<DrinkLog, "weightKg" | "sex">> = {},
): DrinkLog {
  return {
    id: nextId++,
    kind: "øl",
    unitsX10,
    t,
    weightKg: null,
    sex: null,
    ...body,
  };
}

// Lokal tid, så datoerne passer uanset tidszone.
const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 8, day, hour, minute).getTime();

describe("buildSessions", () => {
  test("ingen indtastninger giver ingen aftener", () => {
    expect(buildSessions([], man80)).toEqual([]);
  });

  test("en aften over midnat hører til den dato, den startede", () => {
    const sessions = buildSessions(
      [log(at(26, 22), 10), log(at(26, 23, 30), 15), log(at(27, 1), 10)],
      man80,
    );
    expect(sessions).toHaveLength(1);
    expect(sessions[0].dayKey).toBe("2026-09-26");
    expect(sessions[0].logs).toHaveLength(3);
    expect(sessions[0].totalX10).toBe(35);
    expect(sessions[0].start).toBe(at(26, 22));
    expect(sessions[0].end).toBe(at(27, 1));
  });

  test("to aftener adskilles, når kroppen har været længe i nul", () => {
    const sessions = buildSessions(
      [log(at(25, 21), 20), log(at(26, 21), 10)],
      man80,
    );
    expect(sessions.map((s) => s.dayKey)).toEqual(["2026-09-25", "2026-09-26"]);
  });

  test("toppen er det højeste antal aktive genstande", () => {
    // To genstande med det samme er toppen. En time senere er der brændt
    // 0,15 promille af, før den tredje lægges til.
    const sessions = buildSessions(
      [log(at(26, 21), 20), log(at(26, 22), 10)],
      man80,
    );
    const burned = (0.15 * 80 * 0.68) / 12;
    expect(sessions[0].peakActive).toBeCloseTo(3 - burned, 6);
  });

  test("toppen kan ligge tidligt på aftenen", () => {
    const sessions = buildSessions(
      [log(at(26, 20), 40), log(at(26, 23), 5)],
      man80,
    );
    expect(sessions[0].peakActive).toBeCloseTo(4, 6);
  });

  test("niveauet følger toppen", () => {
    // 6 genstande på én gang ved 80 kg mand: 72 / 54,4 = 1,32 promille.
    const [s] = buildSessions([log(at(26, 21), 60)], man80);
    expect(s.peakLevel).toBe(4);
    const [light] = buildSessions([log(at(26, 21), 10)], man80);
    expect(light.peakLevel).toBe(1);
  });

  test("gemt vægt og køn vinder over de nuværende indstillinger", () => {
    const stamped = log(at(26, 21), 60, { weightKg: 60, sex: "f" });
    const [s] = buildSessions([stamped], man80);
    // 72 / (60 × 0,55) = 2,18 promille.
    expect(s.peakLevel).toBe(5);
    // Aktive genstande er de samme seks; det er promillen, der ændrer sig.
    expect(s.peakActive).toBeCloseTo(6, 6);
  });

  test("ændrede indstillinger flytter ikke en gammel aften", () => {
    const stamped = [log(at(26, 21), 40, { weightKg: 80, sex: "m" })];
    const before = buildSessions(stamped, man80)[0];
    const after = buildSessions(stamped, { weightKg: 50, sex: "f" })[0];
    expect(after.peakLevel).toBe(before.peakLevel);
    expect(after.peakActive).toBeCloseTo(before.peakActive, 9);
  });

  test("rækkefølgen af rækker er ligegyldig", () => {
    const a = log(at(26, 21), 10);
    const b = log(at(26, 22), 15);
    expect(buildSessions([b, a], man80)[0].logs.map((l) => l.id)).toEqual([
      a.id,
      b.id,
    ]);
  });
});

describe("buildDays", () => {
  test("to aftener med samme startdato lægges sammen", () => {
    const days = buildDays(
      [log(at(26, 9), 10), log(at(26, 22), 30), log(at(26, 23), 10)],
      man80,
    );
    const day = days.get("2026-09-26");
    expect(days.size).toBe(1);
    expect(day?.entries).toBe(3);
    expect(day?.totalX10).toBe(50);
    expect(day?.peakActive).toBeGreaterThan(3);
    expect(day?.start).toBe(at(26, 9));
    expect(day?.end).toBe(at(26, 23));
  });

  test("månedens sum tæller kun månedens dage", () => {
    const days = buildDays(
      [
        log(at(5, 21), 20),
        log(at(26, 21), 35),
        log(new Date(2026, 9, 3, 21).getTime(), 10),
      ],
      man80,
    );
    expect(monthSummary(days, 2026, 8)).toEqual({ days: 2, totalX10: 55 });
    expect(monthSummary(days, 2026, 9)).toEqual({ days: 1, totalX10: 10 });
    expect(monthSummary(days, 2026, 7)).toEqual({ days: 0, totalX10: 0 });
  });
});

describe("kalender", () => {
  test("dato som nøgle", () => {
    expect(dayKeyOf(at(5, 23, 59))).toBe("2026-09-05");
  });

  test("september 2026 starter en tirsdag og har 30 dage", () => {
    const weeks = monthGrid(2026, 8);
    expect(weeks[0]).toEqual([null, 1, 2, 3, 4, 5, 6]);
    expect(weeks).toHaveLength(5);
    expect(weeks[4]).toEqual([28, 29, 30, null, null, null, null]);
    expect(weeks.flat().filter((d) => d !== null)).toHaveLength(30);
  });

  test("en måned der starter en søndag får seks uger", () => {
    // November 2026 starter en søndag.
    const weeks = monthGrid(2026, 10);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(weeks).toHaveLength(6);
  });

  test("februar i et skudår", () => {
    expect(monthGrid(2028, 1).flat().filter((d) => d !== null)).toHaveLength(29);
  });

  test("skift af måned krydser årsskiftet", () => {
    expect(addMonths({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    expect(compareMonths({ year: 2026, month: 8 }, { year: 2026, month: 9 })).toBeLessThan(0);
  });

  test("danske navne", () => {
    expect(monthTitle({ year: 2026, month: 8 })).toBe("september 2026");
    expect(longDate("2026-09-26")).toBe("lørdag 26. september");
  });
});
