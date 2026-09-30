import {
  activeUnits,
  bacAt,
  burnUnitsPerHour,
  levelThresholds,
  clampWeight,
  currentSession,
  drunkenness,
  levelIndex,
  minutesToZero,
  type Body,
} from "../widmark";
import { da, daWhole, entryWord, genstandWord, hhmm, soberLine } from "../format";
import { infoExplanation, levelRows, roastFor } from "../copy";
import { strings } from "../../i18n";
import {
  ADVANCED_DRINKS,
  ADVANCED_GROUPS,
  SIMPLE_DRINKS,
  drinkName,
} from "../drinks";

const H = 3_600_000;
const man80: Body = { weightKg: 80, sex: "m" };
const woman60: Body = { weightKg: 60, sex: "f" };
const T0 = Date.UTC(2026, 8, 26, 20, 0, 0);

describe("bacAt", () => {
  test("ingen indtag giver nul", () => {
    expect(bacAt([], T0, man80)).toBe(0);
  });

  test("én genstand lige nu: 12 g / (80 kg × 0,68)", () => {
    const bac = bacAt([{ unitsX10: 10, t: T0 }], T0, man80);
    expect(bac).toBeCloseTo(12 / (80 * 0.68), 6);
    expect(activeUnits(bac, man80)).toBeCloseTo(1, 6);
  });

  test("forbrænder 0,15 promille i timen", () => {
    const start = bacAt([{ unitsX10: 30, t: T0 }], T0, man80);
    const later = bacAt([{ unitsX10: 30, t: T0 }], T0 + H, man80);
    expect(start - later).toBeCloseTo(0.15, 6);
  });

  test("går aldrig under nul, og en pause giver ikke kredit", () => {
    const logs = [
      { unitsX10: 10, t: T0 },
      { unitsX10: 10, t: T0 + 10 * H },
    ];
    expect(bacAt(logs, T0 + 5 * H, man80)).toBe(0);
    expect(bacAt(logs, T0 + 10 * H, man80)).toBeCloseTo(12 / (80 * 0.68), 6);
  });

  test("rækkefølgen af rækker er ligegyldig", () => {
    const a = { unitsX10: 15, t: T0 };
    const b = { unitsX10: 10, t: T0 + H / 2 };
    expect(bacAt([b, a], T0 + H, man80)).toBeCloseTo(bacAt([a, b], T0 + H, man80), 9);
  });

  test("køn og vægt ændrer promillen", () => {
    const logs = [{ unitsX10: 20, t: T0 }];
    expect(bacAt(logs, T0, woman60)).toBeGreaterThan(bacAt(logs, T0, man80));
  });

  test("indtag i fremtiden tælles ikke", () => {
    expect(bacAt([{ unitsX10: 10, t: T0 + H }], T0, man80)).toBe(0);
  });
});

describe("niveauer", () => {
  test.each([
    [0, 0],
    [0.0005, 0],
    [0.2, 1],
    [0.4, 2],
    [0.79, 2],
    [0.8, 3],
    [1.2, 4],
    [1.79, 4],
    [1.8, 5],
    [3, 5],
  ])("promille %p giver niveau %p", (bac, level) => {
    expect(levelIndex(bac)).toBe(level);
  });

  test("fuldhed er 0..1 med fuldt udslag ved 2 promille", () => {
    expect(drunkenness(0)).toBe(0);
    expect(drunkenness(1)).toBe(0.5);
    expect(drunkenness(5)).toBe(1);
  });

  test("minutter til nul", () => {
    expect(minutesToZero(0.15)).toBe(60);
    expect(minutesToZero(0)).toBe(0);
  });
});

describe("niveauer vist som aktive genstande", () => {
  test("grænserne for en mand på 80 kg", () => {
    expect(levelRows(man80)).toEqual([
      ["Op til 1,8", "Let påvirket"],
      ["1,8–3,6", "Påvirket"],
      ["3,6–5,4", "Tydeligt fuld"],
      ["5,4–8,2", "Meget fuld"],
      ["Over 8,2", "Tag hjem"],
    ]);
  });

  test("en lettere krop har lavere grænser", () => {
    expect(levelRows(woman60)[0][0]).toBe("Op til 1,1");
    expect(levelRows(woman60)[4][0]).toBe("Over 5,0");
  });

  test("grænserne passer med det niveau, beregningen giver", () => {
    for (const body of [man80, woman60]) {
      levelThresholds(body).forEach((units, i) => {
        const bac = (units * 12) / (body.weightKg * (body.sex === "f" ? 0.55 : 0.68));
        expect(levelIndex(bac - 0.001)).toBe(i + 1);
        expect(levelIndex(bac + 0.001)).toBe(i + 2);
      });
    }
  });

  test("forbrænding i genstande pr. time", () => {
    expect(burnUnitsPerHour(man80)).toBeCloseTo(0.68, 6);
    expect(infoExplanation(man80)).toContain("ca. 0,7 genstande i timen");
  });

  test("brugeren får aldrig vist promille", () => {
    const shown = [
      infoExplanation(man80),
      ...levelRows(man80).flat(),
    ].join(" ");
    expect(shown).not.toMatch(/‰|promille|Widmark/i);
  });
});

describe("currentSession", () => {
  test("samler aftenens indtag", () => {
    const logs = [
      { unitsX10: 10, t: T0 },
      { unitsX10: 15, t: T0 + H },
    ];
    expect(currentSession(logs, T0 + 2 * H, man80)).toHaveLength(2);
  });

  test("ryddes når kroppen har været i nul i over 3 timer", () => {
    const logs = [{ unitsX10: 10, t: T0 }];
    const zeroAfterMs = (12 / (80 * 0.68) / 0.15) * H;
    expect(currentSession(logs, T0 + zeroAfterMs + 2.9 * H, man80)).toHaveLength(1);
    expect(currentSession(logs, T0 + zeroAfterMs + 3.1 * H, man80)).toHaveLength(0);
  });

  test("en øl til maden og en senere samme aften hænger sammen", () => {
    // Én genstand kl. 18 er forbrændt ca. 19.30. Næste kommer kl. 21.
    const logs = [
      { unitsX10: 10, t: T0 },
      { unitsX10: 10, t: T0 + 3 * H },
    ];
    expect(currentSession(logs, T0 + 3 * H, man80)).toHaveLength(2);
  });

  test("gårsdagens indtag følger ikke med ind i en ny aften", () => {
    const logs = [
      { unitsX10: 30, t: T0 },
      { unitsX10: 10, t: T0 + 24 * H },
    ];
    const session = currentSession(logs, T0 + 24 * H, man80);
    expect(session).toHaveLength(1);
    expect(session[0].t).toBe(T0 + 24 * H);
  });
});

describe("format og tekster", () => {
  test("dansk decimalkomma", () => {
    expect(da(2.5)).toBe("2,5");
    expect(da(2)).toBe("2,0");
  });

  test("hele tal vises uden decimal", () => {
    expect(daWhole(0)).toBe("0");
    expect(daWhole(2)).toBe("2");
    expect(daWhole(2.04)).toBe("2");
    expect(daWhole(1.96)).toBe("2");
    expect(daWhole(2.06)).toBe("2,1");
    expect(daWhole(12.5)).toBe("12,5");
  });

  test("klokkeslæt med punktum", () => {
    const t = new Date(2026, 8, 26, 9, 6).getTime();
    expect(hhmm(t)).toBe("09.06");
  });

  test("indtastninger og genstande bøjes hver for sig", () => {
    expect(entryWord(1)).toBe("indtastning");
    expect(entryWord(3)).toBe("indtastninger");
    expect(genstandWord(1)).toBe("genstand");
    expect(genstandWord(2.5)).toBe("genstande");
  });

  test("linjen om tid til nul lover ikke, at man er ædru", () => {
    for (const m of [0, 45, 130]) {
      expect(soberLine(m).toLowerCase()).not.toContain("ædru");
    }
  });

  test("linjen om tid til nul", () => {
    expect(soberLine(0)).toBe("");
    expect(soberLine(45)).toBe("Nul aktive genstande om ca. 45 min");
    expect(soberLine(130)).toBe("Nul aktive genstande om ca. 2 t 10 min");
  });

  test("roast skifter med antal og holder sig i niveauets liste", () => {
    for (let level = 0; level < 6; level++) {
      for (let n = 0; n < 10; n++) {
        expect(strings().roasts[level]).toContain(roastFor(level, n));
      }
    }
    expect(roastFor(2, 1)).not.toBe(roastFor(2, 2));
  });

  test("alle typer har entydige nøgler og navne", () => {
    const all = [...SIMPLE_DRINKS, ...ADVANCED_DRINKS];
    expect(new Set(all.map((d) => d.kind)).size).toBe(all.length);
    expect(drinkName("øl_stærk_50")).toBe("Stærk øl 50 cl");
    expect(drinkName("ukendt")).toBe("ukendt");
    expect(drinkName("vin")).toBe("Vin");
    expect(drinkName("vin_15")).toBe("Vin 15 cl");
  });

  test("vin står i Simpel og deler række med drinks i Avanceret", () => {
    expect(SIMPLE_DRINKS.map((d) => d.kind)).toEqual(["øl", "vin", "drink", "shot"]);
    const row = ADVANCED_GROUPS.find((g) => g.key === "drink");
    expect(row?.items.map((d) => d.kind)).toEqual([
      "drink_mild",
      "drink_alm",
      "drink_stærk",
      "vin_15",
    ]);
    // Alle knapper fra Avanceret ligger i en række.
    expect(ADVANCED_GROUPS.flatMap((g) => g.items)).toHaveLength(ADVANCED_DRINKS.length);
  });

  test("vægt holdes inden for 35-150 kg", () => {
    expect(clampWeight(10)).toBe(35);
    expect(clampWeight(200)).toBe(150);
    expect(clampWeight(80.4)).toBe(80);
    expect(clampWeight(NaN)).toBe(80);
  });
});
