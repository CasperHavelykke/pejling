import { infoExplanation, levelRows, roastFor, statusFor } from "../../domain/copy";
import { longDate, monthTitle } from "../../domain/calendar";
import { ADVANCED_DRINKS, SIMPLE_DRINKS, drinkName } from "../../domain/drinks";
import { da as num, hhmm, soberLine } from "../../domain/format";
import type { Body } from "../../domain/widmark";
import { getLang, langForDevice, setLang, strings } from "../index";
import { da } from "../da";
import { en } from "../en";
import type { Strings } from "../types";

const man80: Body = { weightKg: 80, sex: "m" };

// Al tekst i et sæt, også den der bygges af funktioner.
function allText(s: Strings): string[] {
  return [
    ...s.status,
    ...s.roasts.flat(),
    ...s.levelNames,
    s.rangeUpTo("1"),
    s.rangeOver("1"),
    s.infoExplanation("1"),
    s.infoDrinks,
    s.infoDisclaimer,
    s.infoStorage,
    s.zeroLine(2, 10),
    ...Object.values(s.drinks).flatMap((d) => [d.name, d.label, d.sub]),
    ...Object.values(s.groups),
    ...Object.values(s.main).map((v) => (typeof v === "function" ? v("1", "1") : v)),
    ...Object.values(s.drawer).map((v) => (typeof v === "function" ? v("a", "b") : v)),
    ...Object.values(s.info),
    s.history.noEntriesOn("x"),
    s.history.entries(1),
    s.history.entries(2),
    s.history.legend,
    s.history.legendLabel,
    s.history.pastMidnight,
  ];
}

afterEach(() => setLang("da"));

describe("valg af sprog", () => {
  test("dansk er udgangspunktet", () => {
    expect(getLang()).toBe("da");
  });

  test("telefonens sprog afgør starten", () => {
    expect(langForDevice("da")).toBe("da");
    expect(langForDevice("nb")).toBe("da");
    expect(langForDevice("sv")).toBe("da");
    expect(langForDevice("en")).toBe("en");
    expect(langForDevice("de")).toBe("en");
    expect(langForDevice(null)).toBe("en");
    expect(langForDevice(undefined)).toBe("en");
  });

  test("teksterne følger det valgte sprog", () => {
    setLang("en");
    expect(strings()).toBe(en);
    expect(statusFor(0)).toBe("No active drinks");
    expect(drinkName("øl_stærk_50")).toBe("Strong beer 50 cl");
    expect(drinkName("ukendt")).toBe("ukendt");
    setLang("da");
    expect(strings()).toBe(da);
    expect(drinkName("øl_stærk_50")).toBe("Stærk øl 50 cl");
  });
});

describe("de to sæt har samme form", () => {
  test("lige mange niveauer og kommentarer", () => {
    expect(en.status).toHaveLength(da.status.length);
    expect(en.levelNames).toHaveLength(da.levelNames.length);
    expect(en.roasts.map((l) => l.length)).toEqual(da.roasts.map((l) => l.length));
    expect(en.months).toHaveLength(12);
    expect(en.weekdaysShort).toHaveLength(7);
    expect(en.weekdaysLong).toHaveLength(7);
  });

  test("alle knapper har tekst på begge sprog", () => {
    for (const d of [...SIMPLE_DRINKS, ...ADVANCED_DRINKS]) {
      for (const set of [da, en]) {
        expect(set.drinks[d.kind].name).toBeTruthy();
        expect(set.drinks[d.kind].label).toBeTruthy();
        expect(set.drinks[d.kind].sub).toBeTruthy();
      }
    }
  });

  test("højeste niveau kan deles i råb og forklaring", () => {
    for (const set of [da, en]) {
      expect(set.status[5]).toContain(" – ");
    }
  });
});

describe("engelsk format", () => {
  beforeEach(() => setLang("en"));

  test("punktum i tal og kolon i klokkeslæt", () => {
    expect(num(2.5)).toBe("2.5");
    expect(hhmm(new Date(2026, 8, 26, 9, 6).getTime())).toBe("09:06");
  });

  test("linjen om tid til nul", () => {
    expect(soberLine(0)).toBe("");
    expect(soberLine(45)).toBe("Zero active drinks in about 45 min");
    expect(soberLine(130)).toBe("Zero active drinks in about 2 h 10 min");
  });

  test("datoer", () => {
    expect(monthTitle({ year: 2026, month: 8 })).toBe("September 2026");
    expect(longDate("2026-09-26")).toBe("Saturday 26 September");
  });

  test("tabellen i info-arket", () => {
    const rows = levelRows(man80);
    expect(rows[0][0]).toMatch(/^Up to \d\.\d$/);
    expect(rows[4]).toEqual([expect.stringMatching(/^Over \d\.\d$/), "Go home"]);
    expect(infoExplanation(man80)).toContain("about 0.7 drinks per hour");
  });

  test("kommentaren holder sig i niveauets liste", () => {
    for (let level = 0; level < 6; level++) {
      for (let n = 0; n < 10; n++) {
        expect(en.roasts[level]).toContain(roastFor(level, n));
      }
    }
  });
});

describe("det, appen aldrig må sige", () => {
  test("ingen promille og ingen beregningsmetode, på noget sprog", () => {
    for (const set of [da, en]) {
      for (const text of allText(set)) {
        expect(text).not.toMatch(/‰|promille|per mille|\bBAC\b|blood alcohol|Widmark/i);
      }
    }
  });

  test("engelsk lover aldrig, at man er ædru", () => {
    for (const text of allText(en)) {
      expect(text).not.toMatch(/\bsober\b/i);
    }
  });

  test("kørsel nævnes kun i forbeholdet", () => {
    for (const set of [da, en]) {
      const rest = allText(set).filter(
        (t) => t !== set.infoDisclaimer && !set.roasts[0].includes(t),
      );
      for (const text of rest) {
        expect(text).not.toMatch(/\bkøre\b|\bkørsel\b|\bdrive\b|\bdriving\b/i);
      }
      expect(set.infoDisclaimer).toMatch(/ikke|not/);
    }
  });
});
