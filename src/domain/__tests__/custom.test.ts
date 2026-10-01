import {
  burnMinutes,
  CUSTOM_DEFAULTS,
  CUSTOM_TYPES,
  atSizeLimit,
  atStrengthLimit,
  customKind,
  customUnitsX10,
  parseCustom,
  dropRecent,
  pushRecent,
  readRecents,
  stepSize,
  stepStrength,
} from "../custom";
import { ADVANCED_DRINKS, drinkName } from "../drinks";
import { setLang } from "../../i18n";

afterEach(() => setLang("da"));

describe("omregning til genstande", () => {
  test("stemmer med de faste knapper i Avanceret", () => {
    // 33 cl ved 4,6 % er 12,0 g alkohol, altså 1 genstand.
    expect(customUnitsX10({ cl: 33, abv: 4.6 })).toBe(10);
    // Stærk øl 50 cl står til 2,3 på knappen.
    expect(customUnitsX10({ cl: 50, abv: 7 })).toBe(23);
    // Et glas vin på 15 cl står til 1,2.
    expect(customUnitsX10({ cl: 15, abv: 12.5 })).toBe(12);
    expect(ADVANCED_DRINKS.find((d) => d.kind === "øl_stærk_50")?.unitsX10).toBe(23);
  });

  test("standardvalgene giver rimelige tal", () => {
    expect(customUnitsX10(CUSTOM_DEFAULTS.beer)).toBe(10);
    expect(customUnitsX10(CUSTOM_DEFAULTS.wine)).toBe(12);
    expect(customUnitsX10(CUSTOM_DEFAULTS.spirit)).toBe(11);
  });

  test("et tryk tæller altid mindst 0,1", () => {
    expect(customUnitsX10({ cl: 1, abv: 0.5 })).toBe(1);
  });
});

describe("hvor længe kroppen bruger på en genstand", () => {
  const man80 = { weightKg: 80, sex: "m" } as const;
  const woman60 = { weightKg: 60, sex: "f" } as const;

  test("følger forbrændingen for vægt og køn", () => {
    // En mand på 80 kg forbrænder ca. 0,7 genstande i timen.
    expect(burnMinutes(10, man80)).toBe(90);
    expect(burnMinutes(20, man80)).toBe(175);
    // En lettere kvinde bruger længere tid på det samme.
    expect(burnMinutes(10, woman60)).toBeGreaterThan(burnMinutes(10, man80));
  });

  test("rundes til fem minutter og er aldrig nul", () => {
    for (const x10 of [1, 5, 7, 12, 16, 23]) {
      expect(burnMinutes(x10, man80) % 5).toBe(0);
      expect(burnMinutes(x10, man80)).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("nøglen i databasen", () => {
  test("kan læses tilbage", () => {
    const drink = { type: "beer", cl: 44, abv: 5.5 } as const;
    expect(customKind(drink)).toBe("egen:beer:440:55");
    expect(parseCustom("egen:beer:440:55")).toEqual(drink);
    expect(parseCustom(customKind({ type: "spirit", cl: 4, abv: 37.5 }))).toEqual({
      type: "spirit",
      cl: 4,
      abv: 37.5,
    });
  });

  test("faste knapper og skrald er ikke egne indtastninger", () => {
    for (const kind of ["øl", "øl_stærk_50", "egen", "egen:beer", "egen:kaffe:10:10",
      "egen:beer:0:50", "egen:beer:x:50", "egen:beer:330:46:1", "egen:beer:330:2000"]) {
      expect(parseCustom(kind)).toBeNull();
    }
  });

  test("navnet følger sproget", () => {
    expect(drinkName("egen:beer:440:55")).toBe("Øl 44 cl 5,5 %");
    expect(drinkName("egen:spirit:40:400")).toBe("Sprut 4 cl 40 %");
    setLang("en");
    expect(drinkName("egen:beer:440:55")).toBe("Beer 44 cl 5.5%");
    expect(drinkName("egen:wine:150:125")).toBe("Wine 15 cl 12.5%");
  });
});

describe("plus og minus", () => {
  test("størrelsen springer mellem almindelige mål", () => {
    expect(stepSize("beer", 33, 1)).toBe(40);
    expect(stepSize("beer", 33, -1)).toBe(30);
    expect(stepSize("beer", 44, 1)).toBe(50);
    expect(stepSize("beer", 57, 1)).toBe(60);
    expect(stepSize("spirit", 4, -1)).toBe(3);
    // Et mål uden for listen finder nærmeste nabo.
    expect(stepSize("beer", 35, 1)).toBe(40);
    expect(stepSize("beer", 35, -1)).toBe(33);
  });

  test("styrken lander på hele trin", () => {
    expect(stepStrength("beer", 4.6, 1)).toBe(5);
    expect(stepStrength("beer", 4.6, -1)).toBe(4.5);
    expect(stepStrength("beer", 5, 1)).toBe(5.5);
    expect(stepStrength("beer", 5, -1)).toBe(4.5);
    expect(stepStrength("spirit", 40, -1)).toBe(37.5);
    expect(stepStrength("spirit", 40, 1)).toBe(42.5);
    expect(stepStrength("wine", 12.5, 1)).toBe(13);
  });

  test("stopper ved grænserne", () => {
    expect(stepSize("beer", 100, 1)).toBe(100);
    expect(stepSize("beer", 20, -1)).toBe(20);
    expect(atSizeLimit("beer", 100, 1)).toBe(true);
    expect(atSizeLimit("beer", 33, 1)).toBe(false);
    expect(stepStrength("beer", 15, 1)).toBe(15);
    expect(stepStrength("spirit", 15, -1)).toBe(12.5);
    expect(stepStrength("spirit", 10, -1)).toBe(10);
    expect(atStrengthLimit("spirit", 80, 1)).toBe(true);
    expect(atStrengthLimit("spirit", 40, -1)).toBe(false);
  });

  test("alle standardvalg kan justeres i begge retninger", () => {
    for (const type of CUSTOM_TYPES) {
      const { cl, abv } = CUSTOM_DEFAULTS[type];
      expect(atSizeLimit(type, cl, 1)).toBe(false);
      expect(atSizeLimit(type, cl, -1)).toBe(false);
      expect(atStrengthLimit(type, abv, 1)).toBe(false);
      expect(atStrengthLimit(type, abv, -1)).toBe(false);
    }
  });
});

describe("seneste", () => {
  test("nyeste først, uden gentagelser, højst tre", () => {
    let list: string[] = [];
    for (const kind of ["a", "b", "c", "d"]) list = pushRecent(list, kind);
    expect(list).toEqual(["d", "c", "b"]);
    expect(pushRecent(list, "b")).toEqual(["b", "d", "c"]);
  });

  test("et valg kan fjernes igen", () => {
    expect(dropRecent(["a", "b", "c"], "b")).toEqual(["a", "c"]);
    expect(dropRecent(["a"], "a")).toEqual([]);
    expect(dropRecent(["a"], "x")).toEqual(["a"]);
  });

  test("den gemte liste læses forsigtigt", () => {
    expect(readRecents(undefined)).toEqual([]);
    expect(readRecents("ikke json")).toEqual([]);
    expect(readRecents('{"a":1}')).toEqual([]);
    expect(readRecents('["egen:beer:440:55","øl",7,"egen:wine:150:125"]')).toEqual([
      "egen:beer:440:55",
      "egen:wine:150:125",
    ]);
  });
});
