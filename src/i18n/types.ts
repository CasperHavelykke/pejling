// Alt, brugeren kan læse, ligger i ét sæt pr. sprog. Begge sæt skal
// opfylde denne type, så en manglende tekst bliver en fejl i typetjekket.

import type { DrinkKind } from "../domain/drinks";

export type Lang = "da" | "en";

export type DrinkText = {
  // Fuldt navn, vises i listen "I aften".
  name: string;
  // Kort navn på knappen.
  label: string;
  // Undertekst på knappen.
  sub: string;
};

export type Strings = {
  decimal: "," | ".";
  // Tegnet mellem timer og minutter i et klokkeslæt.
  timeSeparator: "." | ":";

  // Niveau 0-5. Uglen håner; statuslinjen er informativ.
  status: readonly string[];
  roasts: readonly (readonly string[])[];
  // Niveau 1-5.
  levelNames: readonly string[];

  rangeUpTo: (n: string) => string;
  rangeOver: (n: string) => string;
  infoExplanation: (perHour: string) => string;
  infoDrinks: string;
  infoDisclaimer: string;
  infoStorage: string;

  zeroLine: (hours: number, minutes: number) => string;
  entryWord: (count: number) => string;
  unitWord: (count: number) => string;
  unitShort: string;
  dayWord: (count: number) => string;

  drinks: Record<DrinkKind, DrinkText>;
  groups: { beer: string; drink: string; shot: string };

  months: readonly string[];
  // Mandag først.
  weekdaysShort: readonly string[];
  // Søndag først, som Date.getDay().
  weekdaysLong: readonly string[];
  longDate: (weekday: string, day: number, month: string) => string;

  main: {
    simple: string;
    advanced: string;
    infoButton: string;
    activeLabel: string;
    summary: (units: string, time: string) => string;
    nothingYet: string;
    showList: string;
  };
  drawer: {
    title: string;
    close: string;
    empty: string;
    undo: string;
    undoLabel: (name: string, time: string) => string;
    history: string;
  };
  info: {
    you: string;
    weight: string;
    kiloLess: string;
    kiloMore: string;
    sex: string;
    male: string;
    female: string;
    language: string;
    howTitle: string;
    tableHead: string;
    dataTitle: string;
    close: string;
  };
  history: {
    title: string;
    back: string;
    previousMonth: string;
    nextMonth: string;
    noEntries: string;
    noEntriesOn: (date: string) => string;
    firstUse: string;
    tapADay: string;
    legend: string;
    legendLabel: string;
    units: string;
    peak: string;
    entries: (count: number) => string;
    pastMidnight: string;
  };
};
